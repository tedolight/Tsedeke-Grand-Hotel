import express from 'express';
import {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImage,
  getAvailableRooms,
} from '../../controllers/room/roomController.js';
import { protect } from '../../middleware/auth/auth.js';
import { isAdmin } from '../../middleware/auth/isAdmin.js';
import { uploadCloud } from '../../middleware/upload/upload.js';

const router = express.Router();

router.post('/upload', protect, isAdmin, uploadCloud, uploadRoomImage);

router
  .route('/')
  .get(getRooms)
  .post(protect, isAdmin, createRoom);

router.get('/available', getAvailableRooms);

router
  .route('/:id')
  .get(getRoom)
  .put(protect, isAdmin, updateRoom)
  .delete(protect, isAdmin, deleteRoom);

export default router;
