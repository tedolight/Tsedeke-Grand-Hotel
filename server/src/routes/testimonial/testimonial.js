import express from 'express';
import {
  getActiveTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  uploadTestimonialImage,
} from '../../controllers/testimonial/testimonialController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';
import { uploadCloud } from '../../middleware/upload/upload.js';

const router = express.Router();

router
  .route('/')
  .get(getActiveTestimonials)
  .post(protect, isAdmin, createTestimonial);

router.get('/admin', protect, isAdmin, getAllTestimonials);
router.post('/upload', protect, isAdmin, uploadCloud, uploadTestimonialImage);

router
  .route('/:id')
  .put(protect, isAdmin, updateTestimonial)
  .delete(protect, isAdmin, deleteTestimonial);

export default router;
