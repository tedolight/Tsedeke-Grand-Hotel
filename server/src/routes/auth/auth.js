import express from 'express';
import { register, login, getMe, getLoginStats } from '../../controllers/auth/authController.js';
import { getProfile, updateProfile } from '../../controllers/auth/profileController.js';
import { forgotPassword, resetPassword, changePassword } from '../../controllers/auth/passwordController.js';
import { protect } from '../../middleware/auth/auth.js';
import { authRateLimit } from '../../middleware/security/authRateLimit.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', authRateLimit, login);
router.get('/login-stats', getLoginStats);
router.get('/me', protect, getMe);

// Profile routes
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

// Password routes
router.post('/forgot-password', authRateLimit, forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.put('/change-password', protect, changePassword);

export default router;
