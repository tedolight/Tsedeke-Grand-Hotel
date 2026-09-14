import MenuItem from '../../models/restaurant/MenuItem.js';
import MenuCategory from '../../models/restaurant/MenuCategory.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Get all menu items (optional filter by category)
// @route   GET /api/restaurant/items
// @access  Public
export const getMenuItems = asyncHandler(async (req, res, next) => {
  const queryObj = {};

  if (req.query.category) {
    queryObj.category = req.query.category;
  }

  const items = await MenuItem.find(queryObj);

  sendSuccess(res, 200, 'Menu items retrieved successfully', items);
});

// @desc    Get single menu item
// @route   GET /api/restaurant/items/:id
// @access  Public
export const getMenuItem = asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id);

  if (!item) {
    return next(
      new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404)
    );
  }

  sendSuccess(res, 200, 'Menu item retrieved successfully', item);
});

// @desc    Create menu item
// @route   POST /api/restaurant/items
// @access  Private/Admin
export const createMenuItem = asyncHandler(async (req, res, next) => {
  if (!req.body.category) {
    return next(new ErrorResponse('Please specify a menu category', 400));
  }

  const categorySlug = String(req.body.category).trim().toLowerCase();

  // Find category by case-insensitive name or displayName
  let categoryDoc = await MenuCategory.findOne({
    $or: [
      { name: categorySlug },
      { name: { $regex: new RegExp(`^${categorySlug}$`, 'i') } },
      { displayName: { $regex: new RegExp(`^${categorySlug}$`, 'i') } }
    ]
  });

  // Auto-create category if it does not exist yet in DB
  if (!categoryDoc) {
    const formattedDisplay = req.body.category.charAt(0).toUpperCase() + req.body.category.slice(1);
    categoryDoc = await MenuCategory.create({
      name: categorySlug,
      displayName: formattedDisplay
    });
  }

  req.body.category = categoryDoc.name;

  const item = await MenuItem.create(req.body);

  sendSuccess(res, 201, 'Menu item created successfully', item);
});

// @desc    Update menu item
// @route   PUT /api/restaurant/items/:id
// @access  Private/Admin
export const updateMenuItem = asyncHandler(async (req, res, next) => {
  let item = await MenuItem.findById(req.params.id);

  if (!item) {
    return next(
      new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.body.category) {
    const categorySlug = String(req.body.category).trim().toLowerCase();
    let categoryDoc = await MenuCategory.findOne({
      $or: [
        { name: categorySlug },
        { name: { $regex: new RegExp(`^${categorySlug}$`, 'i') } },
        { displayName: { $regex: new RegExp(`^${categorySlug}$`, 'i') } }
      ]
    });

    if (!categoryDoc) {
      const formattedDisplay = req.body.category.charAt(0).toUpperCase() + req.body.category.slice(1);
      categoryDoc = await MenuCategory.create({
        name: categorySlug,
        displayName: formattedDisplay
      });
    }

    req.body.category = categoryDoc.name;
  }

  item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, 'Menu item updated successfully', item);
});

// @desc    Delete menu item
// @route   DELETE /api/restaurant/items/:id
// @access  Private/Admin
export const deleteMenuItem = asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id);

  if (!item) {
    return next(
      new ErrorResponse(`Menu item not found with id of ${req.params.id}`, 404)
    );
  }

  await item.deleteOne();

  sendSuccess(res, 200, 'Menu item deleted successfully');
});
