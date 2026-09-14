import express from 'express';
import { getSettings, updateSettings } from '../../controllers/settings/settingsController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';

const router = express.Router();

router
  .route('/:key')
  .get(getSettings)
  .put(protect, isAdmin, updateSettings);

export default router;
