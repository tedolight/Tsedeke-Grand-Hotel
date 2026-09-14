import Contact from '../../models/contact/Contact.js';
import ContactReply from '../../models/contact/ContactReply.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';
import sendEmail from '../../utils/email/sendEmail.js';
import { contactReplyTemplate, newContactMessageTemplate } from '../../utils/email/emailTemplates.js';

// @desc    Submit a contact query
// @route   POST /api/contact
// @access  Public
export const submitContactQuery = asyncHandler(async (req, res, next) => {
  const { name, email, subject, message, folder } = req.body;

  if (!name || !email || !subject || !message) {
    return next(new ErrorResponse('Please provide name, email, subject, and message', 400));
  }

  const query = await Contact.create({
    name,
    email,
    subject,
    message,
    folder: folder || 'inbox',
  });

  if (folder === 'sent') {
    try {
      const template = newContactMessageTemplate(query);
      await sendEmail({
        to: query.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (err) {
      console.error('Error sending outbound contact email:', err);
    }
  }

  sendSuccess(res, 201, 'Contact query submitted successfully', query);
});

// @desc    Get all contact queries
// @route   GET /api/contact
// @access  Private/Admin
export const getContactQueries = asyncHandler(async (req, res, next) => {
  const queries = await Contact.find().sort('-createdAt');

  sendSuccess(res, 200, 'Contact queries retrieved successfully', queries);
});

// @desc    Get single contact query
// @route   GET /api/contact/:id
// @access  Private/Admin
export const getContactQuery = asyncHandler(async (req, res, next) => {
  const query = await Contact.findById(req.params.id);

  if (!query) {
    return next(new ErrorResponse(`Query not found with id of ${req.params.id}`, 404));
  }

  // Mark as read when admin views it
  if (query.status === 'new') {
    query.status = 'read';
    await query.save();
  }

  sendSuccess(res, 200, 'Contact query retrieved successfully', query);
});

// @desc    Reply to a contact query
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
export const replyToContactQuery = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const contactId = req.params.id;

  if (!message) {
    return next(new ErrorResponse('Please provide a reply message', 400));
  }

  const contact = await Contact.findById(contactId);
  if (!contact) {
    return next(new ErrorResponse(`Contact query not found with id of ${contactId}`, 404));
  }

  // Create reply
  const reply = await ContactReply.create({
    contact: contactId,
    user: req.user.id, // Admin user id
    message,
  });

  // Update contact status
  contact.status = 'replied';
  await contact.save();

  // Send email to user
  try {
    const template = contactReplyTemplate(contact, message);
    await sendEmail({
      to: contact.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  } catch (err) {
    console.error('Failed to send reply email:', err.message);
    // We still want to return success for saving the reply even if email fails
  }

  sendSuccess(res, 201, 'Reply submitted and email sent successfully', reply);
});

// @desc    Mark a contact query as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
export const markContactQueryRead = asyncHandler(async (req, res, next) => {
  const query = await Contact.findById(req.params.id);

  if (!query) {
    return next(new ErrorResponse(`Query not found with id of ${req.params.id}`, 404));
  }

  query.status = 'read';
  await query.save();

  sendSuccess(res, 200, 'Contact query marked as read', query);
});

// @desc    Update message attributes (folder, tags, status)
// @route   PUT /api/contact/:id/attributes
// @access  Private/Admin
export const updateMessageAttributes = asyncHandler(async (req, res, next) => {
  const query = await Contact.findById(req.params.id);

  if (!query) {
    return next(new ErrorResponse(`Query not found with id of ${req.params.id}`, 404));
  }

  const { folder, tags, status, priority, assignedTo, department } = req.body;

  if (folder) query.folder = folder;
  if (tags) query.tags = tags;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo !== undefined) query.assignedTo = assignedTo;
  if (department) query.department = department;

  await query.save();

  sendSuccess(res, 200, 'Message attributes updated', query);
});
