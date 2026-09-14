import express from 'express';
import {
  forgotPassword,
  resetPassword,
  changePassword,
} from '../../controllers/auth/passwordController.js';
import { protect } from '../../middleware/auth/auth.js';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.put('/change-password', protect, changePassword);

export default router;
