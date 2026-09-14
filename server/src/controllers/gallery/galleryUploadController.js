import Gallery from '../../models/gallery/Gallery.js';
import GalleryCategory from '../../models/gallery/GalleryCategory.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// === GALLERY ITEMS ===

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
export const getGalleryItems = asyncHandler(async (req, res, next) => {
  const queryObj = {};

  if (req.query.category) {
    queryObj.category = req.query.category;
  }

  const items = await Gallery.find(queryObj);

  sendSuccess(res, 200, 'Gallery items retrieved successfully', items);
});

// @desc    Create gallery item
// @route   POST /api/gallery
// @access  Private/Admin
export const createGalleryItem = asyncHandler(async (req, res, next) => {
  const categoryName = req.body.category ? req.body.category.toLowerCase().trim() : 'rooms';
  
  // Validate category exists, or create it
  let categoryExists = await GalleryCategory.findOne({ name: categoryName });
  if (!categoryExists) {
    const displayName = req.body.category || 'Rooms & Suites';
    categoryExists = await GalleryCategory.create({
      name: categoryName,
      displayName: displayName
    });
  }

  const item = await Gallery.create({
    ...req.body,
    category: categoryName
  });

  sendSuccess(res, 201, 'Gallery item created successfully', item);
});

// @desc    Update gallery item
// @route   PUT /api/gallery/:id
// @access  Private/Admin
export const updateGalleryItem = asyncHandler(async (req, res, next) => {
  let item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(
      new ErrorResponse(`Gallery item not found with id of ${req.params.id}`, 404)
    );
  }

  if (req.body.category) {
    const categoryName = req.body.category.toLowerCase().trim();
    let categoryExists = await GalleryCategory.findOne({ name: categoryName });
    if (!categoryExists) {
      await GalleryCategory.create({
        name: categoryName,
        displayName: req.body.category
      });
    }
    req.body.category = categoryName;
  }

  item = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, 'Gallery item updated successfully', item);
});

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryItem = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);

  if (!item) {
    return next(
      new ErrorResponse(`Gallery item not found with id of ${req.params.id}`, 404)
    );
  }

  await item.deleteOne();

  sendSuccess(res, 200, 'Gallery item deleted successfully');
});

// === GALLERY CATEGORIES ===

// @desc    Get all gallery categories
// @route   GET /api/gallery/categories
// @access  Public
export const getGalleryCategories = asyncHandler(async (req, res, next) => {
  const categories = await GalleryCategory.find();

  sendSuccess(res, 200, 'Gallery categories retrieved successfully', categories);
});

// @desc    Create gallery category
// @route   POST /api/gallery/categories
// @access  Private/Admin
export const createGalleryCategory = asyncHandler(async (req, res, next) => {
  const category = await GalleryCategory.create(req.body);

  sendSuccess(res, 201, 'Gallery category created successfully', category);
});

// @desc    Delete gallery category
// @route   DELETE /api/gallery/categories/:id
// @access  Private/Admin
export const deleteGalleryCategory = asyncHandler(async (req, res, next) => {
  const category = await GalleryCategory.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Gallery category not found with id of ${req.params.id}`, 404)
    );
  }

  await category.deleteOne();

  sendSuccess(res, 200, 'Gallery category deleted successfully');
});

// @desc    Upload an image
// @route   POST /api/gallery/upload
// @access  Private/Admin
export const uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }
  // Construct URL as a relative path so frontend proxy can handle it seamlessly across devices
  const fileUrl = req.file.path;

  sendSuccess(res, 200, 'Image uploaded successfully', { url: fileUrl });
});
