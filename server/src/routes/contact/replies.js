import express from 'express';
import {
  getReplies,
  deleteContactQuery,
} from '../../controllers/contact/replyController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';

const router = express.Router();

router.get('/:id/replies', protect, isAdmin, getReplies);
router.delete('/:id', protect, isAdmin, deleteContactQuery);

export default router;
