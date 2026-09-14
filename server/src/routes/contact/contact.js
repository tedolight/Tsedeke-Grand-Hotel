import express from 'express';
import {
  submitContactQuery,
  getContactQueries,
  getContactQuery,
  replyToContactQuery,
  markContactQueryRead,
  updateMessageAttributes,
} from '../../controllers/contact/contactController.js';
import {
  getReplies,
  deleteContactQuery,
} from '../../controllers/contact/replyController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';

const router = express.Router();

router
  .route('/')
  .post(protect, submitContactQuery)
  .get(protect, isAdmin, getContactQueries);

router
  .route('/:id')
  .get(protect, isAdmin, getContactQuery)
  .delete(protect, isAdmin, deleteContactQuery);

router
  .route('/:id/reply')
  .post(protect, isAdmin, replyToContactQuery);

router
  .route('/:id/replies')
  .get(protect, isAdmin, getReplies);

router
  .route('/:id/read')
  .put(protect, isAdmin, markContactQueryRead);

router
  .route('/:id/attributes')
  .put(protect, isAdmin, updateMessageAttributes);

export default router;
