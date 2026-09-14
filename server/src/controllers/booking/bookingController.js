import mongoose from 'mongoose';
import Booking from '../../models/booking/Booking.js';
import Room from '../../models/room/Room.js';
import Contact from '../../models/contact/Contact.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';
import sendEmail from '../../utils/email/sendEmail.js';
import sendSms from '../../utils/sms/sendSms.js';

// Helper to resolve room by ObjectId OR roomNumber
const resolveRoom = async (idOrNumber) => {
  if (!idOrNumber) return null;
  if (mongoose.Types.ObjectId.isValid(idOrNumber)) {
    const room = await Room.findById(idOrNumber);
    if (room) return room;
  }
  return await Room.findOne({ roomNumber: String(idOrNumber) });
};

// @desc    Check room availability
// @route   POST /api/rooms/:roomId/availability
// @access  Public
export const checkRoomAvailability = asyncHandler(async (req, res, next) => {
  const { checkIn, checkOut } = req.body;
  const roomId = req.params.roomId;

  if (!checkIn || !checkOut) {
    return next(new ErrorResponse('Please provide check-in and check-out dates', 400));
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    return next(new ErrorResponse('Check-out date must be after check-in date', 400));
  }

  // Check if room exists
  const room = await resolveRoom(roomId);
  if (!room) {
    return next(new ErrorResponse(`Room not found with id of ${roomId}`, 404));
  }

  // Check overlapping bookings (confirmed/checked-in bookings, or pending within last 15 min)
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
  const overlappingBooking = await Booking.findOne({
    room: room._id,
    $or: [
      { status: { $in: ['confirmed', 'checked-in'] } },
      { status: 'pending', createdAt: { $gte: fifteenMinAgo } },
    ],
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });

  const isAvailable = !overlappingBooking;

  sendSuccess(res, 200, isAvailable ? 'Room is available' : 'Room is already booked', {
    roomId: room._id,
    isAvailable,
  });
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find()
    .populate('room')
    .populate('user', 'name email')
    .sort({ createdAt: -1 }); // Newest bookings first

  sendSuccess(res, 200, 'Bookings retrieved successfully', bookings);
});

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id }).populate('room');

  sendSuccess(res, 200, 'My bookings retrieved successfully', bookings);
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('room');

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is booking owner or admin
  if (booking.user && booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this booking', 401));
  }

  sendSuccess(res, 200, 'Booking retrieved successfully', booking);
});

// @desc    Create booking
// @route   POST /api/bookings
// @access  Public (Optional Auth)
export const createBooking = asyncHandler(async (req, res, next) => {
  const { 
    room, 
    checkIn, 
    checkOut, 
    guests, 
    fullName, 
    email, 
    phone, 
    nationalId,
    specialRequests, 
    bookingSource, 
    status, 
    paymentStatus 
  } = req.body;

  if (!room || !checkIn || !checkOut || !guests || !fullName || !phone) {
    return next(new ErrorResponse('Please provide all required booking details (room, dates, guests, guest name, and phone)', 400));
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    return next(new ErrorResponse('Check-out date must be after check-in date', 400));
  }

  // Check if room exists
  const roomObj = await resolveRoom(room);
  if (!roomObj) {
    return next(new ErrorResponse(`Room not found with id or number of ${room}`, 404));
  }

  // Check overlapping bookings (confirmed/checked-in bookings, or pending within last 15 min)
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
  const overlappingBooking = await Booking.findOne({
    room: roomObj._id,
    $or: [
      { status: { $in: ['confirmed', 'checked-in'] } },
      { status: 'pending', createdAt: { $gte: fifteenMinAgo } },
    ],
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });

  if (overlappingBooking) {
    return next(new ErrorResponse('Room is already booked for the selected dates', 400));
  }

  // Calculate total price
  const diffTime = Math.abs(checkOutDate - checkInDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalPrice = diffDays * roomObj.price;

  // Set user if logged in
  const userId = req.user ? req.user.id : null;

  // Guest email fallback if walk-in guest doesn't provide email
  const guestEmail = email && email.trim() !== '' 
    ? email 
    : `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'walkin'}@tsedekegrandhotel.com`;

  const booking = await Booking.create({
    user: userId,
    room: roomObj._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests,
    totalPrice,
    fullName,
    email: guestEmail,
    phone,
    nationalId: nationalId || req.body.passportNo || '',
    specialRequests,
    bookingSource: bookingSource || (req.user?.role === 'admin' ? 'Walk-In' : 'Online'),
    status: status || (bookingSource === 'Walk-In' || req.user?.role === 'admin' ? 'checked-in' : 'pending'),
    paymentStatus: paymentStatus || (bookingSource === 'Walk-In' ? 'paid' : 'pending'),
  });

  // Only mark room as Occupied and notify immediately for Walk-In / Admin bookings or already paid bookings
  const isImmediate = bookingSource === 'Walk-In' || req.user?.role === 'admin' || paymentStatus === 'paid';

  if (isImmediate) {
    roomObj.status = 'Occupied';
    roomObj.isAvailable = false;
    await roomObj.save();

    // Send email notification to Admin
    try {
      const adminEmail = process.env.EMAIL_USER; 
      const subject = `New Booking: Room ${roomObj.roomNumber || 'Notification'} by ${fullName}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C9A84C;">New Room Booking</h2>
          <p>A new booking has been made at Tsedeke Grand Hotel. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Room:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${roomObj.name} (Room #${roomObj.roomNumber || 'N/A'}, ${roomObj.type || 'N/A'})</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Guest Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${fullName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Check-in:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${checkInDate.toDateString()}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Check-out:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${checkOutDate.toDateString()}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Guests:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${guests}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Price:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">ETB ${totalPrice}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Special Requests:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${specialRequests || 'None'}</td></tr>
          </table>
          <p style="margin-top: 20px;">Please log in to the admin dashboard to manage this booking.</p>
        </div>
      `;

      await sendEmail({
        to: adminEmail,
        subject: subject,
        html: html,
        text: `New booking for ${roomObj.name} by ${fullName} for ${checkInDate.toDateString()} to ${checkOutDate.toDateString()}. Total: ETB ${totalPrice}.`
      });
    } catch (err) {
      console.error('Failed to send admin notification email:', err.message);
    }

    // Also create a Contact message for the admin dashboard
    try {
      await Contact.create({
        name: fullName,
        email: email,
        subject: `New Booking: Room ${roomObj.roomNumber || 'Notification'}`,
        message: `New booking created.
Check-in: ${checkInDate.toDateString()}
Check-out: ${checkOutDate.toDateString()}
Guests: ${guests}
Total Price: ETB ${totalPrice}
Phone: ${phone}
Special Requests: ${specialRequests || 'None'}`,
        status: 'new'
      });
    } catch (err) {
      console.error('Failed to create admin dashboard message:', err.message);
    }
  }

  // Send SMS notification to Admin
  try {
    if (process.env.ADMIN_PHONE) {
      await sendSms({
        to: process.env.ADMIN_PHONE,
        message: `New Booking! ${fullName} booked Room ${roomObj.roomNumber || room} for ${checkInDate.toDateString()}. Total: ETB ${totalPrice}.`
      });
    }
  } catch (err) {
    console.error('Failed to send admin notification SMS:', err.message);
  }

  sendSuccess(res, 201, 'Booking created successfully', booking);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status, paymentStatus } = req.body;

  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
  }

  const updateFields = {};
  if (status) updateFields.status = status;
  if (paymentStatus) updateFields.paymentStatus = paymentStatus;

  booking = await Booking.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, 'Booking status updated successfully', booking);
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is booking owner or admin
  if (booking.user && booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to cancel this booking', 401));
  }

  booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true }
  );

  sendSuccess(res, 200, 'Booking cancelled successfully', booking);
});

// @desc    Send email/SMS message to booking guest
// @route   POST /api/bookings/:id/message
// @access  Private/Admin
export const sendBookingMessage = asyncHandler(async (req, res, next) => {
  const { message, subject, channel } = req.body;

  if (!message || !channel) {
    return next(new ErrorResponse('Please provide message content and channel', 400));
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
  }

  // Trigger dispatch based on channel
  if (channel.toLowerCase() === 'email') {
    try {
      await sendEmail({
        to: booking.email,
        subject: subject || 'Message from Tsedeke Grand Hotel',
        text: message,
      });
    } catch (err) {
      console.error('Email sending failed:', err.message);
    }
  } else if (channel.toLowerCase() === 'sms') {
    try {
      await sendSms({
        to: booking.phone,
        message: message,
      });
    } catch (err) {
      console.error('SMS sending failed:', err.message);
    }
  }

  // Append message to specialRequests (the stay notes field)
  const dateStr = new Date().toLocaleString('en-US', { hour12: false });
  const logEntry = `\n\n— Sent ${channel.toUpperCase()} (${dateStr}):\nSubject: ${subject || 'N/A'}\n"${message}"`;
  booking.specialRequests = (booking.specialRequests || '') + logEntry;

  await booking.save();

  sendSuccess(res, 200, `${channel.toUpperCase()} message sent and logged successfully`, booking);
});
