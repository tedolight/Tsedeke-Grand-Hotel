import ContactReply from '../../models/contact/ContactReply.js';
import Contact from '../../models/contact/Contact.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Get all replies for a contact query
// @route   GET /api/contact/:id/replies
// @access  Private/Admin
export const getReplies = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact query not found with id of ${req.params.id}`, 404));
  }

  const replies = await ContactReply.find({ contact: req.params.id })
    .populate('user', 'name email')
    .sort('createdAt');

  sendSuccess(res, 200, 'Replies retrieved successfully', replies);
});

// @desc    Delete a contact query and its replies
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContactQuery = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Contact query not found with id of ${req.params.id}`, 404));
  }

  // Delete all replies associated with this contact
  await ContactReply.deleteMany({ contact: req.params.id });

  // Delete the contact query itself
  await contact.deleteOne();

  sendSuccess(res, 200, 'Contact query and replies deleted successfully');
});
