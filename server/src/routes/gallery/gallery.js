import express from 'express';
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getGalleryCategories,
  createGalleryCategory,
  deleteGalleryCategory,
  uploadImage,
} from '../../controllers/gallery/galleryUploadController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';
import { uploadCloud } from '../../middleware/upload/upload.js';

const router = express.Router();

// Categories routes (static path first)
router
  .route('/categories')
  .get(getGalleryCategories)
  .post(protect, isAdmin, createGalleryCategory);

router
  .route('/categories/:id')
  .delete(protect, isAdmin, deleteGalleryCategory);

// Upload route
router.post('/upload', protect, isAdmin, uploadCloud, uploadImage);

// Items routes
router
  .route('/')
  .get(getGalleryItems)
  .post(protect, isAdmin, createGalleryItem);

router
  .route('/:id')
  .put(protect, isAdmin, updateGalleryItem)
  .delete(protect, isAdmin, deleteGalleryItem);

export default router;
