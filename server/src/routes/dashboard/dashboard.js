import express from 'express';
import {
  getDashboardStats,
  getDashboardRevenue,
  getDashboardOccupancy,
} from '../../controllers/dashboard/dashboardController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';

const router = express.Router();

router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/revenue', protect, isAdmin, getDashboardRevenue);
router.get('/occupancy', protect, isAdmin, getDashboardOccupancy);

export default router;
