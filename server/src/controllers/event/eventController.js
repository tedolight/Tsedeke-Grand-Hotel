import Event from '../../models/event/Event.js';
import EventPackage from '../../models/event/EventPackage.js';
import EventEnquiry from '../../models/event/EventEnquiry.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// === VENUES ===

// @desc    Get all event venues
// @route   GET /api/events
// @access  Public
export const getEvents = asyncHandler(async (req, res, next) => {
  const venues = await Event.find();

  sendSuccess(res, 200, 'Event venues retrieved', venues);
});

// @desc    Get single venue
// @route   GET /api/events/:id
// @access  Public
export const getEvent = asyncHandler(async (req, res, next) => {
  const venue = await Event.findById(req.params.id);

  if (!venue) {
    return next(
      new ErrorResponse(`Venue not found with id of ${req.params.id}`, 404)
    );
  }

  sendSuccess(res, 200, 'Venue details retrieved', venue);
});

// @desc    Create event venue
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = asyncHandler(async (req, res, next) => {
  const venue = await Event.create(req.body);

  sendSuccess(res, 201, 'Event venue created successfully', venue);
});

// @desc    Update event venue
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = asyncHandler(async (req, res, next) => {
  let venue = await Event.findById(req.params.id);

  if (!venue) {
    return next(
      new ErrorResponse(`Venue not found with id of ${req.params.id}`, 404)
    );
  }

  venue = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, 'Event venue updated successfully', venue);
});

// @desc    Delete event venue
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = asyncHandler(async (req, res, next) => {
  const venue = await Event.findById(req.params.id);

  if (!venue) {
    return next(
      new ErrorResponse(`Venue not found with id of ${req.params.id}`, 404)
    );
  }

  await venue.deleteOne();

  sendSuccess(res, 200, 'Event venue deleted successfully');
});

// === PACKAGES ===

// @desc    Get all event packages
// @route   GET /api/events/packages
// @access  Public
export const getEventPackages = asyncHandler(async (req, res, next) => {
  const packages = await EventPackage.find();

  sendSuccess(res, 200, 'Event packages retrieved', packages);
});

// @desc    Create event package
// @route   POST /api/events/packages
// @access  Private/Admin
export const createEventPackage = asyncHandler(async (req, res, next) => {
  const eventPackage = await EventPackage.create(req.body);

  sendSuccess(res, 201, 'Event package created successfully', eventPackage);
});

// @desc    Update event package
// @route   PUT /api/events/packages/:id
// @access  Private/Admin
export const updateEventPackage = asyncHandler(async (req, res, next) => {
  let eventPackage = await EventPackage.findById(req.params.id);

  if (!eventPackage) {
    return next(
      new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
    );
  }

  eventPackage = await EventPackage.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, 'Event package updated successfully', eventPackage);
});

// @desc    Delete event package
// @route   DELETE /api/events/packages/:id
// @access  Private/Admin
export const deleteEventPackage = asyncHandler(async (req, res, next) => {
  const eventPackage = await EventPackage.findById(req.params.id);

  if (!eventPackage) {
    return next(
      new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
    );
  }

  await eventPackage.deleteOne();

  sendSuccess(res, 200, 'Event package deleted successfully');
});

// === EVENT ENQUIRIES ===

// @desc    Submit event enquiry
// @route   POST /api/events/enquiries
// @access  Public
export const submitEventEnquiry = asyncHandler(async (req, res, next) => {
  const { fullName, phone, email, eventType, preferredDate, expectedGuests, preferredVenue, message } = req.body;

  if (!fullName || !phone || !email || !eventType || !preferredDate || !expectedGuests || !preferredVenue) {
    return next(new ErrorResponse('Please provide all required enquiry details', 400));
  }

  const enquiry = await EventEnquiry.create({
    fullName,
    phone,
    email,
    eventType,
    preferredDate: new Date(preferredDate),
    expectedGuests,
    preferredVenue,
    message,
  });

  sendSuccess(res, 201, 'Event enquiry submitted successfully', enquiry);
});

// @desc    Get all event enquiries
// @route   GET /api/events/enquiries
// @access  Private/Admin
export const getEventEnquiries = asyncHandler(async (req, res, next) => {
  const enquiries = await EventEnquiry.find().sort('-createdAt');

  sendSuccess(res, 200, 'Event enquiries retrieved successfully', enquiries);
});

// @desc    Update event enquiry status
// @route   PUT /api/events/enquiries/:id/status
// @access  Private/Admin
export const updateEventEnquiryStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse('Please provide status update', 400));
  }

  let enquiry = await EventEnquiry.findById(req.params.id);

  if (!enquiry) {
    return next(new ErrorResponse(`Enquiry not found with id of ${req.params.id}`, 404));
  }

  enquiry = await EventEnquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  sendSuccess(res, 200, 'Enquiry status updated successfully', enquiry);
});

// @desc    Upload event venue image
// @route   POST /api/events/upload
// @access  Private/Admin
export const uploadEventImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }
  
  // Normalize path for cross-platform compatibility
  const imagePath = req.file.path;

  sendSuccess(res, 200, 'Image uploaded successfully', imagePath);
});
