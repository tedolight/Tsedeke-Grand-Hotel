import TableReservation from '../../models/restaurant/TableReservation.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Create table reservation
// @route   POST /api/restaurant/reservations
// @access  Public
export const createReservation = asyncHandler(async (req, res, next) => {
  const { fullName, email, phone, date, time, guests, specialRequests, occasion } = req.body;

  if (!fullName || !email || !phone || !date || !time || !guests) {
    return next(new ErrorResponse('Please provide all required reservation details', 400));
  }

  // Set user if logged in
  const userId = req.user ? req.user.id : null;

  const reservation = await TableReservation.create({
    user: userId,
    fullName,
    email,
    phone,
    date: new Date(date),
    time,
    guests,
    specialRequests,
    occasion,
  });

  sendSuccess(res, 201, 'Reservation created successfully', reservation);
});

// @desc    Get all reservations
// @route   GET /api/restaurant/reservations
// @access  Private/Admin
export const getReservations = asyncHandler(async (req, res, next) => {
  const reservations = await TableReservation.find()
    .populate('user', 'name email')
    .sort('-createdAt');

  sendSuccess(res, 200, 'Reservations retrieved successfully', reservations);
});

// @desc    Get single reservation
// @route   GET /api/restaurant/reservations/:id
// @access  Private/Admin
export const getReservation = asyncHandler(async (req, res, next) => {
  const reservation = await TableReservation.findById(req.params.id).populate('user', 'name email');

  if (!reservation) {
    return next(new ErrorResponse(`Reservation not found with id of ${req.params.id}`, 404));
  }

  sendSuccess(res, 200, 'Reservation retrieved successfully', reservation);
});

// @desc    Update reservation status
// @route   PUT /api/restaurant/reservations/:id/status
// @access  Private/Admin
export const updateReservationStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'cancelled', 'completed', 'seated'].includes(status)) {
    return next(new ErrorResponse('Please provide a valid status', 400));
  }

  let reservation = await TableReservation.findById(req.params.id);

  if (!reservation) {
    return next(new ErrorResponse(`Reservation not found with id of ${req.params.id}`, 404));
  }

  reservation = await TableReservation.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  sendSuccess(res, 200, 'Reservation status updated successfully', reservation);
});

// @desc    Delete reservation
// @route   DELETE /api/restaurant/reservations/:id
// @access  Private/Admin
export const deleteReservation = asyncHandler(async (req, res, next) => {
  const reservation = await TableReservation.findById(req.params.id);

  if (!reservation) {
    return next(new ErrorResponse(`Reservation not found with id of ${req.params.id}`, 404));
  }

  await reservation.deleteOne();

  sendSuccess(res, 200, 'Reservation deleted successfully');
});
