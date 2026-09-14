import Settings from '../../models/settings/Settings.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Get system settings by key
// @route   GET /api/admin/settings/:key
// @access  Private/Admin
export const getSettings = asyncHandler(async (req, res, next) => {
  const { key } = req.params;
  let settings = await Settings.findOne({ key });

  if (!settings) {
    // Return empty object if not set yet, so client can merge with defaults
    return sendSuccess(res, 200, `Settings for ${key} retrieved`, {});
  }

  sendSuccess(res, 200, `Settings for ${key} retrieved`, settings.value);
});

// @desc    Update system settings by key
// @route   PUT /api/admin/settings/:key
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res, next) => {
  const { key } = req.params;
  const value = req.body;

  let settings = await Settings.findOneAndUpdate(
    { key },
    { key, value },
    { new: true, upsert: true, runValidators: true }
  );

  sendSuccess(res, 200, `Settings for ${key} updated successfully`, settings.value);
});
