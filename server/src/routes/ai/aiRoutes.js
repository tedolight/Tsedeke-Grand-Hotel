import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleGuestChat,
  handleAdminCopilot,
  getAiStatus,
} from '../../controllers/ai/aiController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';

const router = express.Router();

// Rate limiter for public guest AI chat (30 requests per 10 minutes per IP)
const guestAiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI Concierge rate limit reached. Please wait a few moments before sending more inquiries.',
  },
});

// Routes
router.get('/status', getAiStatus);
router.post('/guest/chat', guestAiLimiter, handleGuestChat);
router.post('/admin/copilot', protect, isAdmin, handleAdminCopilot);

export default router;
