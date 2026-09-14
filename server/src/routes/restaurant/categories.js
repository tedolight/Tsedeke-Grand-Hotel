import express from 'express';
import {
  getMenuCategories,
  createMenuCategory,
  deleteMenuCategory,
} from '../../controllers/restaurant/categoryController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';

const router = express.Router();

router
  .route('/')
  .get(getMenuCategories)
  .post(protect, isAdmin, createMenuCategory);

router
  .route('/:id')
  .delete(protect, isAdmin, deleteMenuCategory);

export default router;
