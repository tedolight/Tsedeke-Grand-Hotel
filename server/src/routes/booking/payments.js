import express from 'express';
import {
  processPayment,
  getPayments,
  getPayment,
  verifyChapa,
  chapaWebhook,
} from '../../controllers/booking/paymentController.js';
import { protect, optionalProtect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';

const router = express.Router();

router
  .route('/')
  .post(optionalProtect, processPayment)
  .get(protect, isAdmin, getPayments);

router.get('/verify/:txRef', verifyChapa);
router.post('/chapa-webhook', chapaWebhook);

router
  .route('/:id')
  .get(protect, getPayment);

export default router;
