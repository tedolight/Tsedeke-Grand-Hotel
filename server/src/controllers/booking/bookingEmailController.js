import Booking from '../../models/booking/Booking.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';
import { sendBookingConfirmation, sendBookingCancellation } from '../../services/email/bookingEmail.js';

// @desc    Send booking confirmation email
// @route   POST /api/bookings/:id/send-confirmation
// @access  Private/Admin
export const sendConfirmationEmail = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('room');

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
  }

  await sendBookingConfirmation(booking);

  sendSuccess(res, 200, 'Confirmation email sent successfully');
});

// @desc    Send booking cancellation email
// @route   POST /api/bookings/:id/send-cancellation
// @access  Private/Admin
export const sendCancellationEmail = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('room');

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404));
  }

  await sendBookingCancellation(booking);

  sendSuccess(res, 200, 'Cancellation email sent successfully');
});
