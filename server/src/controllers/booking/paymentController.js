import mongoose from 'mongoose';
import BookingPayment from '../../models/booking/BookingPayment.js';
import Booking from '../../models/booking/Booking.js';
import Room from '../../models/room/Room.js';
import Contact from '../../models/contact/Contact.js';
import sendEmail from '../../utils/email/sendEmail.js';
import { sendBookingConfirmation } from '../../services/email/bookingEmail.js';
import {
  processMockPayment,
  initializeChapaPayment,
  verifyChapaPayment,
} from '../../services/payment/paymentService.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Process booking payment
// @route   POST /api/payments
// @access  Public (Optional Auth)
export const processPayment = asyncHandler(async (req, res, next) => {
  const { bookingId, paymentMethod, amount } = req.body;

  if (!bookingId || !paymentMethod || !amount) {
    return next(new ErrorResponse('Please provide booking ID, payment method, and amount', 400));
  }

  // Check if booking exists
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${bookingId}`, 404));
  }

  if (booking.paymentStatus === 'paid') {
    return next(new ErrorResponse('This booking is already paid', 400));
  }

  // Set user if logged in
  const userId = req.user ? req.user.id : null;

  // Create pending payment record
  const payment = await BookingPayment.create({
    booking: bookingId,
    user: userId,
    amount,
    paymentMethod,
    status: 'pending',
  });

  try {
    if (paymentMethod === 'chapa') {
      // Generate a transaction reference
      const txRef = `CHAPA_TX_${Math.random().toString(36).substring(2, 10).toUpperCase()}_${Date.now()}`;
      
      // Initialize Chapa payment
      const paymentResult = await initializeChapaPayment(booking, amount, txRef);

      if (paymentResult.status === 'success') {
        payment.transactionId = txRef;
        await payment.save();

        return sendSuccess(res, 200, 'Chapa payment initialized successfully', {
          payment,
          checkoutUrl: paymentResult.data.checkout_url
        });
      } else {
        throw new Error('Chapa initialization failed');
      }
    } else {
      // Process mock payment
      const paymentResult = await processMockPayment(amount, paymentMethod);

      if (paymentResult.success) {
        // Update payment record
        payment.status = 'completed';
        payment.transactionId = paymentResult.transactionId;
        await payment.save();

        // Update booking status
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();

        sendSuccess(res, 200, 'Payment processed successfully', payment);
      } else {
        throw new Error('Payment declined');
      }
    }
  } catch (error) {
    payment.status = 'failed';
    await payment.save();

    booking.paymentStatus = 'failed';
    await booking.save();

    return next(new ErrorResponse(error.message || 'Payment processing failed', 400));
  }
});

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
export const getPayments = asyncHandler(async (req, res, next) => {
  const payments = await BookingPayment.find()
    .populate('booking')
    .populate('user', 'name email');

  sendSuccess(res, 200, 'Payments retrieved successfully', payments);
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = asyncHandler(async (req, res, next) => {
  const payment = await BookingPayment.findById(req.params.id)
    .populate('booking');

  if (!payment) {
    return next(new ErrorResponse(`Payment record not found with id of ${req.params.id}`, 404));
  }

  // Access control
  if (payment.user && payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this payment record', 401));
  }

  sendSuccess(res, 200, 'Payment record retrieved successfully', payment);
});

// @desc    Verify Chapa payment
// @route   GET /api/payments/verify/:txRef
// @access  Public
export const verifyChapa = asyncHandler(async (req, res, next) => {
  const { txRef } = req.params;

  if (!txRef) {
    return next(new ErrorResponse('Please provide a transaction reference', 400));
  }

  // Find the payment record by transactionId or by booking ID
  let payment = await BookingPayment.findOne({ transactionId: txRef }).populate('booking');
  if (!payment && mongoose.Types.ObjectId.isValid(txRef)) {
    payment = await BookingPayment.findOne({ booking: txRef }).sort({ createdAt: -1 }).populate('booking');
  }

  if (!payment) {
    return next(new ErrorResponse('Payment record not found for this transaction reference', 404));
  }

  const booking = payment.booking;
  if (!booking) {
    return next(new ErrorResponse('Booking not found associated with this payment', 404));
  }

  if (payment.status === 'completed') {
    return sendSuccess(res, 200, 'Payment already verified and completed', { payment, booking });
  }

  try {
    // Verify payment status with Chapa using the payment's transactionId
    const targetTxRef = payment.transactionId || txRef;
    const verificationResult = await verifyChapaPayment(targetTxRef);

    if (verificationResult.status === 'success') {
      // Update payment record
      payment.status = 'completed';
      await payment.save();

      // Update booking status
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();

      // Mark Room as Occupied & unavailable in DB
      const room = await Room.findById(booking.room);
      if (room) {
        room.status = 'Occupied';
        room.isAvailable = false;
        await room.save();
      }

      // Send booking confirmation email to guest
      try {
        await sendBookingConfirmation(booking);
      } catch (e) {
        console.error('Failed to send guest confirmation email:', e.message);
      }

      // Send email notification to Admin
      try {
        const adminEmail = process.env.EMAIL_USER;
        await sendEmail({
          to: adminEmail,
          subject: `Confirmed Paid Booking: Room ${room?.roomNumber || ''} by ${booking.fullName}`,
          text: `A new booking has been paid via Chapa for ${room?.name || 'Room'} by ${booking.fullName}.\nCheck-in: ${new Date(booking.checkIn).toDateString()}\nCheck-out: ${new Date(booking.checkOut).toDateString()}\nTotal: ETB ${booking.totalPrice}.`,
        });
      } catch (e) {
        console.error('Failed to send admin notification email:', e.message);
      }

      // Create message for Admin dashboard
      try {
        await Contact.create({
          name: booking.fullName,
          email: booking.email,
          subject: `Confirmed Booking: Room ${room?.roomNumber || 'Notification'}`,
          message: `Booking paid and confirmed via Chapa.
Check-in: ${new Date(booking.checkIn).toDateString()}
Check-out: ${new Date(booking.checkOut).toDateString()}
Guests: ${booking.guests}
Total Price: ETB ${booking.totalPrice}
Phone: ${booking.phone}`,
          status: 'new'
        });
      } catch (e) {
        console.error('Failed to create admin dashboard message:', e.message);
      }

      sendSuccess(res, 200, 'Payment verified successfully', { payment, booking });
    } else {
      payment.status = 'failed';
      await payment.save();

      booking.paymentStatus = 'failed';
      booking.status = 'cancelled';
      await booking.save();

      return next(new ErrorResponse('Payment verification failed or was declined', 400));
    }
  } catch (error) {
    payment.status = 'failed';
    await payment.save();

    booking.paymentStatus = 'failed';
    booking.status = 'cancelled';
    await booking.save();

    return next(new ErrorResponse(error.message || 'Error during payment verification', 400));
  }
});

// @desc    Chapa payment webhook
// @route   POST /api/payments/chapa-webhook
// @access  Public
export const chapaWebhook = asyncHandler(async (req, res, next) => {
  const { tx_ref, status } = req.body;
  if (!tx_ref) {
    return res.status(400).json({ success: false, message: 'No tx_ref in webhook body' });
  }

  try {
    const payment = await BookingPayment.findOne({ transactionId: tx_ref }).populate('booking');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const booking = payment.booking;
    if (status === 'success' && payment.status !== 'completed') {
      payment.status = 'completed';
      await payment.save();

      if (booking) {
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();

        const room = await Room.findById(booking.room);
        if (room) {
          room.status = 'Occupied';
          room.isAvailable = false;
          await room.save();
        }

        try {
          await sendBookingConfirmation(booking);
        } catch (e) {}
      }
    }

    res.status(200).json({ success: true, message: 'Webhook received and processed' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error processing webhook' });
  }
});
