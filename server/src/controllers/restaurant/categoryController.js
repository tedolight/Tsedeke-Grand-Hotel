import MenuCategory from '../../models/restaurant/MenuCategory.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Get all menu categories
// @route   GET /api/restaurant/categories
// @access  Public
export const getMenuCategories = asyncHandler(async (req, res, next) => {
  const categories = await MenuCategory.find();

  sendSuccess(res, 200, 'Menu categories retrieved successfully', categories);
});

// @desc    Create menu category
// @route   POST /api/restaurant/categories
// @access  Private/Admin
export const createMenuCategory = asyncHandler(async (req, res, next) => {
  const category = await MenuCategory.create(req.body);

  sendSuccess(res, 201, 'Menu category created successfully', category);
});

// @desc    Delete menu category
// @route   DELETE /api/restaurant/categories/:id
// @access  Private/Admin
export const deleteMenuCategory = asyncHandler(async (req, res, next) => {
  const category = await MenuCategory.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Menu category not found with id of ${req.params.id}`, 404)
    );
  }

  await category.deleteOne();

  sendSuccess(res, 200, 'Menu category deleted successfully');
});
