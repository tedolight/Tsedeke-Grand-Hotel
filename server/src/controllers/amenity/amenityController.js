import Amenity from '../../models/amenity/Amenity.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Get all amenities
// @route   GET /api/amenities
// @access  Public
export const getAmenities = asyncHandler(async (req, res, next) => {
  const amenities = await Amenity.find().sort({ order: 1, createdAt: -1 });
  sendSuccess(res, 200, 'Amenities retrieved successfully', amenities);
});

// @desc    Get single amenity
// @route   GET /api/amenities/:id
// @access  Public
export const getAmenity = asyncHandler(async (req, res, next) => {
  const amenity = await Amenity.findById(req.params.id);

  if (!amenity) {
    return next(new ErrorResponse(`Amenity not found with id of ${req.params.id}`, 404));
  }

  sendSuccess(res, 200, 'Amenity retrieved successfully', amenity);
});

// @desc    Create amenity
// @route   POST /api/amenities
// @access  Private/Admin
export const createAmenity = asyncHandler(async (req, res, next) => {
  const amenity = await Amenity.create(req.body);
  sendSuccess(res, 201, 'Amenity created successfully', amenity);
});

// @desc    Update amenity
// @route   PUT /api/amenities/:id
// @access  Private/Admin
export const updateAmenity = asyncHandler(async (req, res, next) => {
  let amenity = await Amenity.findById(req.params.id);

  if (!amenity) {
    return next(new ErrorResponse(`Amenity not found with id of ${req.params.id}`, 404));
  }

  amenity = await Amenity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, 'Amenity updated successfully', amenity);
});

// @desc    Delete amenity
// @route   DELETE /api/amenities/:id
// @access  Private/Admin
export const deleteAmenity = asyncHandler(async (req, res, next) => {
  const amenity = await Amenity.findById(req.params.id);

  if (!amenity) {
    return next(new ErrorResponse(`Amenity not found with id of ${req.params.id}`, 404));
  }

  await amenity.deleteOne();
  sendSuccess(res, 200, 'Amenity deleted successfully', {});
});

// @desc    Upload an image
// @route   POST /api/amenities/upload
// @access  Private/Admin
export const uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }
  // Construct URL as a relative path so frontend proxy can handle it seamlessly across devices
  const fileUrl = req.file.path;

  sendSuccess(res, 200, 'Image uploaded successfully', { url: fileUrl });
});
