import Room from '../../models/room/Room.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Upload room images
// @route   POST /api/rooms/:id/images
// @access  Private/Admin
export const uploadRoomImages = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
  }

  if (!req.body.images || !Array.isArray(req.body.images)) {
    return next(new ErrorResponse('Please provide an array of image URLs', 400));
  }

  // Append new images to existing ones
  room.images = [...room.images, ...req.body.images];
  await room.save();

  sendSuccess(res, 200, 'Room images uploaded successfully', room);
});

// @desc    Delete room image
// @route   DELETE /api/rooms/:id/images/:imageIndex
// @access  Private/Admin
export const deleteRoomImage = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
  }

  const imageIndex = parseInt(req.params.imageIndex, 10);

  if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= room.images.length) {
    return next(new ErrorResponse('Invalid image index', 400));
  }

  room.images.splice(imageIndex, 1);
  await room.save();

  sendSuccess(res, 200, 'Room image deleted successfully', room);
});

// @desc    Set primary room image (move to front)
// @route   PUT /api/rooms/:id/images/:imageIndex/primary
// @access  Private/Admin
export const setPrimaryImage = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Room not found with id of ${req.params.id}`, 404));
  }

  const imageIndex = parseInt(req.params.imageIndex, 10);

  if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= room.images.length) {
    return next(new ErrorResponse('Invalid image index', 400));
  }

  // Move selected image to front
  const [image] = room.images.splice(imageIndex, 1);
  room.images.unshift(image);
  await room.save();

  sendSuccess(res, 200, 'Primary image set successfully', room);
});
