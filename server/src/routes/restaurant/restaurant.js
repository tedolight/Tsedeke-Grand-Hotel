import express from 'express';
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../../controllers/restaurant/restaurantController.js';
import {
  getMenuCategories,
  createMenuCategory,
  deleteMenuCategory,
} from '../../controllers/restaurant/categoryController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';

const router = express.Router();

// Categories routes
router
  .route('/categories')
  .get(getMenuCategories)
  .post(protect, isAdmin, createMenuCategory);

router
  .route('/categories/:id')
  .delete(protect, isAdmin, deleteMenuCategory);

// Items routes
router
  .route('/items')
  .get(getMenuItems)
  .post(protect, isAdmin, createMenuItem);

router
  .route('/items/:id')
  .get(getMenuItem)
  .put(protect, isAdmin, updateMenuItem)
  .delete(protect, isAdmin, deleteMenuItem);

export default router;
