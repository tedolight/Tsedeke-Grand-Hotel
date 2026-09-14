import Gallery from '../../models/gallery/Gallery.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Get single gallery item
// @route   GET /api/gallery/:id
// @access  Public
export const getGalleryItem = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new ErrorResponse(`Gallery item not found with id of ${req.params.id}`, 404));
  }

  sendSuccess(res, 200, 'Gallery item retrieved successfully', item);
});

// @desc    Update gallery item
// @route   PUT /api/gallery/:id
// @access  Private/Admin
export const updateGalleryItem = asyncHandler(async (req, res, next) => {
  let item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new ErrorResponse(`Gallery item not found with id of ${req.params.id}`, 404));
  }

  item = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, 'Gallery item updated successfully', item);
});

// @desc    Toggle gallery item featured status
// @route   PUT /api/gallery/:id/featured
// @access  Private/Admin
export const toggleFeatured = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(new ErrorResponse(`Gallery item not found with id of ${req.params.id}`, 404));
  }

  item.isFeatured = !item.isFeatured;
  await item.save();

  sendSuccess(res, 200, `Gallery item ${item.isFeatured ? 'marked as' : 'removed from'} featured`, item);
});
