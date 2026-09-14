import Testimonial from '../../models/testimonial/Testimonial.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Get active testimonials
// @route   GET /api/testimonials
// @access  Public
export const getActiveTestimonials = asyncHandler(async (req, res, next) => {
  const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
  sendSuccess(res, 200, 'Active testimonials retrieved successfully', testimonials);
});

// @desc    Get all testimonials (for admin management)
// @route   GET /api/testimonials/admin
// @access  Private/Admin
export const getAllTestimonials = asyncHandler(async (req, res, next) => {
  const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
  sendSuccess(res, 200, 'All testimonials retrieved successfully', testimonials);
});

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
export const createTestimonial = asyncHandler(async (req, res, next) => {
  const testimonial = await Testimonial.create(req.body);
  sendSuccess(res, 201, 'Testimonial created successfully', testimonial);
});

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
export const updateTestimonial = asyncHandler(async (req, res, next) => {
  let testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(
      new ErrorResponse(`Testimonial not found with id of ${req.params.id}`, 404)
    );
  }

  testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, 'Testimonial updated successfully', testimonial);
});

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = asyncHandler(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(
      new ErrorResponse(`Testimonial not found with id of ${req.params.id}`, 404)
    );
  }

  await testimonial.deleteOne();
  sendSuccess(res, 200, 'Testimonial deleted successfully');
});

// @desc    Upload testimonial image
// @route   POST /api/testimonials/upload
// @access  Private/Admin
export const uploadTestimonialImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }
  const imagePath = req.file.path;
  sendSuccess(res, 200, 'Image uploaded successfully', { url: imagePath, path: imagePath });
});

