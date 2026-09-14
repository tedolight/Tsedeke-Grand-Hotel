import express from 'express';
import {
  checkAvailability,
  getAvailabilityCalendar,
} from '../../controllers/room/availabilityController.js';

const router = express.Router();

// Public routes
router.get('/:id/availability', checkAvailability);
router.get('/:id/availability/calendar', getAvailabilityCalendar);

export default router;
