import EventPackage from '../../models/event/EventPackage.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Get single event package
// @route   GET /api/events/packages/:id
// @access  Public
export const getEventPackage = asyncHandler(async (req, res, next) => {
  const eventPackage = await EventPackage.findById(req.params.id);

  if (!eventPackage) {
    return next(new ErrorResponse(`Package not found with id of ${req.params.id}`, 404));
  }

  sendSuccess(res, 200, 'Event package retrieved successfully', eventPackage);
});
