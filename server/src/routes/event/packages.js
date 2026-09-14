import express from 'express';
import { getEventPackage } from '../../controllers/event/packageController.js';

const router = express.Router();

// Get single package details
router.get('/:id', getEventPackage);

export default router;
