import express from 'express';
import {
  createReservation,
  getReservations,
  getReservation,
  updateReservationStatus,
  deleteReservation,
} from '../../controllers/restaurant/reservationController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';
import isGuest from '../../middleware/auth/isGuest.js';

const router = express.Router();

// Protected: must be logged in to make a reservation
router.post('/', protect, createReservation);

// Admin routes
router.get('/', protect, isAdmin, getReservations);
router.get('/:id', protect, isAdmin, getReservation);
router.put('/:id/status', protect, isAdmin, updateReservationStatus);
router.delete('/:id', protect, isAdmin, deleteReservation);

export default router;
