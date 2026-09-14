import express from 'express';
import {
  getAmenities,
  getAmenity,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  uploadImage
} from '../../controllers/amenity/amenityController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';
import { uploadCloud } from '../../middleware/upload/upload.js';

const router = express.Router();

// Upload route
router.post('/upload', protect, isAdmin, uploadCloud, uploadImage);

// Amenities routes
router
  .route('/')
  .get(getAmenities)
  .post(protect, isAdmin, createAmenity);

router
  .route('/:id')
  .get(getAmenity)
  .put(protect, isAdmin, updateAmenity)
  .delete(protect, isAdmin, deleteAmenity);

export default router;
