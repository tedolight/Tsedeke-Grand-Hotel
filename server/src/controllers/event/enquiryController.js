import EventEnquiry from '../../models/event/EventEnquiry.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Get single event enquiry
// @route   GET /api/events/enquiries/:id
// @access  Private/Admin
export const getEventEnquiry = asyncHandler(async (req, res, next) => {
  const enquiry = await EventEnquiry.findById(req.params.id);

  if (!enquiry) {
    return next(new ErrorResponse(`Enquiry not found with id of ${req.params.id}`, 404));
  }

  sendSuccess(res, 200, 'Event enquiry retrieved successfully', enquiry);
});

// @desc    Delete event enquiry
// @route   DELETE /api/events/enquiries/:id
// @access  Private/Admin
export const deleteEventEnquiry = asyncHandler(async (req, res, next) => {
  const enquiry = await EventEnquiry.findById(req.params.id);

  if (!enquiry) {
    return next(new ErrorResponse(`Enquiry not found with id of ${req.params.id}`, 404));
  }

  await enquiry.deleteOne();

  sendSuccess(res, 200, 'Event enquiry deleted successfully');
});
