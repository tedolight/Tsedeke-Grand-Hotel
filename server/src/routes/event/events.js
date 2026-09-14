import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventPackages,
  createEventPackage,
  updateEventPackage,
  deleteEventPackage,
  uploadEventImage,
} from '../../controllers/event/eventController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';
import { uploadCloud } from '../../middleware/upload/upload.js';

const router = express.Router();

// Image upload route
router.post('/upload', protect, isAdmin, uploadCloud, uploadEventImage);

// Packages routes (static path first)
router
  .route('/packages')
  .get(getEventPackages)
  .post(protect, isAdmin, createEventPackage);

router
  .route('/packages/:id')
  .put(protect, isAdmin, updateEventPackage)
  .delete(protect, isAdmin, deleteEventPackage);

// Venues routes
router
  .route('/')
  .get(getEvents)
  .post(protect, isAdmin, createEvent);

router
  .route('/:id')
  .get(getEvent)
  .put(protect, isAdmin, updateEvent)
  .delete(protect, isAdmin, deleteEvent);

export default router;
