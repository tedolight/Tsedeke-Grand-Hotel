import mongoose from 'mongoose';
import Booking from '../../models/booking/Booking.js';
import Room from '../../models/room/Room.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

const resolveRoom = async (idOrNumber) => {
  if (!idOrNumber) return null;
  if (mongoose.Types.ObjectId.isValid(idOrNumber)) {
    const room = await Room.findById(idOrNumber);
    if (room) return room;
  }
  return await Room.findOne({ roomNumber: String(idOrNumber) });
};

// @desc    Check room availability for date range
// @route   GET /api/rooms/:id/availability
// @access  Public
export const checkAvailability = asyncHandler(async (req, res, next) => {
  const { checkIn, checkOut } = req.query;
  const roomId = req.params.id;

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

  // Find overlapping bookings
  const overlappingBookings = await Booking.find({
    room: room._id,
    status: { $ne: 'cancelled' },
    $or: [
      {
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      },
    ],
  });

  const isAvailable = overlappingBookings.length === 0;

  sendSuccess(res, 200, isAvailable ? 'Room is available' : 'Room is not available', {
    roomId: room._id,
    isAvailable,
    conflictingBookings: overlappingBookings.length,
  });
});

// @desc    Get room availability calendar (next 30 days)
// @route   GET /api/rooms/:id/availability/calendar
// @access  Public
export const getAvailabilityCalendar = asyncHandler(async (req, res, next) => {
  const roomId = req.params.id;
  const days = parseInt(req.query.days, 10) || 30;

  const room = await resolveRoom(roomId);
  if (!room) {
    return next(new ErrorResponse(`Room not found with id of ${roomId}`, 404));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);

  // Get all bookings in the date range
  const bookings = await Booking.find({
    room: room._id,
    status: { $ne: 'cancelled' },
    checkIn: { $lt: endDate },
    checkOut: { $gt: today },
  }).select('checkIn checkOut');

  // Build availability calendar
  const calendar = [];
  for (let d = new Date(today); d < endDate; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const isBooked = bookings.some(
      (b) => date >= new Date(b.checkIn) && date < new Date(b.checkOut)
    );
    calendar.push({
      date: date.toISOString().split('T')[0],
      available: !isBooked,
    });
  }

  sendSuccess(res, 200, 'Availability calendar retrieved', {
    roomId,
    room: room.name,
    calendar,
  });
});
