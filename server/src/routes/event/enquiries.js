import express from 'express';
import {
  submitEventEnquiry,
  getEventEnquiries,
  updateEventEnquiryStatus,
} from '../../controllers/event/eventController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';

const router = express.Router();

router
  .route('/')
  .post(protect, submitEventEnquiry)
  .get(protect, isAdmin, getEventEnquiries);

router
  .route('/:id/status')
  .put(protect, isAdmin, updateEventEnquiryStatus);

export default router;
