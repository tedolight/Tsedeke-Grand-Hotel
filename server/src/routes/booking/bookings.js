import express from 'express';
import {
  getBookings,
  getMyBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  checkRoomAvailability,
  sendBookingMessage,
} from '../../controllers/booking/bookingController.js';
import { protect, optionalProtect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';
import { createBookingValidation } from '../../middleware/validation/bookingValidation.js';
import { validate } from '../../middleware/validation/validate.js';

const router = express.Router();

// Public routes
router.post('/availability/:roomId', checkRoomAvailability);
// Optional Auth: logged in users attach their ID, guests can still book
router.post('/', optionalProtect, createBookingValidation, validate, createBooking);

// Protected user routes
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Admin-only routes
router.get('/', protect, isAdmin, getBookings);
router.put('/:id/status', protect, isAdmin, updateBookingStatus);
router.post('/:id/message', protect, isAdmin, sendBookingMessage);

export default router;
