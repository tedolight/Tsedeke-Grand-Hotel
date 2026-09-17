import Room from '../../models/room/Room.js';
import Booking from '../../models/booking/Booking.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

const applyTypeFilter = (parsedQuery, rawType) => {
  if (!rawType || rawType === 'all') return;
  const t = String(rawType).trim();
  if (/^deluxe\s+suite$/i.test(t)) {
    parsedQuery.$or = [
      { type: { $regex: /^deluxe\s+suite$/i } },
      { type: { $regex: /^suite$/i } }
    ];
    delete parsedQuery.type;
  } else if (/^deluxe\s+single(\s+room)?$/i.test(t)) {
    parsedQuery.$or = [
      { type: { $regex: /^deluxe\s+single(\s+room)?$/i } },
      { type: { $regex: /^single$/i } }
    ];
    delete parsedQuery.type;
  } else if (/^deluxe\s+double(\s+room)?$/i.test(t)) {
    parsedQuery.$or = [
      { type: { $regex: /^deluxe\s+double(\s+room)?$/i } },
      { type: { $regex: /^double$/i } },
      { type: { $regex: /^family\s+double(\s+bed)?$/i } }
    ];
    delete parsedQuery.type;
  } else if (/^deluxe\s+triple(\s+room)?$/i.test(t)) {
    parsedQuery.$or = [
      { type: { $regex: /^deluxe\s+triple(\s+room)?$/i } },
      { type: { $regex: /^triple$/i } }
    ];
    delete parsedQuery.type;
  } else if (/^special(\s+price(\s+room)?)?$/i.test(t)) {
    parsedQuery.$or = [
      { type: { $regex: /^special(\s+price(\s+room)?)?$/i } },
      { discount: { $gt: 0 } }
    ];
    delete parsedQuery.type;
  } else if (/^hour(\s+room)?$/i.test(t)) {
    parsedQuery.$or = [
      { type: { $regex: /^hour(\s+room)?$/i } }
    ];
    delete parsedQuery.type;
  } else {
    parsedQuery.type = { $regex: new RegExp(`^${t}$`, 'i') };
  }
};

// @desc    Get all rooms (with filters & sorting)
// @route   GET /api/rooms
// @access  Public
export const getRooms = asyncHandler(async (req, res, next) => {
  // Sync room status based on active/confirmed bookings TODAY
  const now = new Date();
  const activeBookingsToday = await Booking.find({
    status: { $in: ['confirmed', 'checked-in', 'active', 'pending'] },
    checkIn: { $lte: now },
    checkOut: { $gte: now }
  });

  const occupiedRoomIds = new Set(
    activeBookingsToday
      .filter(b => b.room)
      .map(b => b.room.toString())
  );

  const allDbRooms = await Room.find();
  const bulkOps = [];
  for (const roomItem of allDbRooms) {
    if (roomItem.status === 'Maintenance' || roomItem.status === 'Cleaning' || roomItem.status === 'Reserved') continue;
    const isOccupied = occupiedRoomIds.has(roomItem._id.toString());
    const targetStatus = isOccupied ? 'Occupied' : 'Available';

    if (roomItem.status !== targetStatus || roomItem.isAvailable !== !isOccupied) {
      bulkOps.push({
        updateOne: {
          filter: { _id: roomItem._id },
          update: { $set: { status: targetStatus, isAvailable: !isOccupied } }
        }
      });
    }
  }
  if (bulkOps.length > 0) {
    await Room.bulkWrite(bulkOps);
  }

  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', '_t', 'cacheBuster'];
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  const parsedQuery = JSON.parse(queryStr);
  if (reqQuery.type && reqQuery.type !== 'all') {
    applyTypeFilter(parsedQuery, reqQuery.type);
  }
  if (reqQuery.isFeatured === 'true') {
    parsedQuery.isFeatured = true;
  } else if (reqQuery.isFeatured === 'false') {
    parsedQuery.isFeatured = false;
  }

  // Finding resource
  query = Room.find(parsedQuery);

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort({ roomNumber: 1 });
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Room.countDocuments(parsedQuery);

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const rooms = await query;

  // Fetch active bookings today to attach check-in and check-out data to occupied rooms
  const activeBookings = await Booking.find({
    status: { $in: ['confirmed', 'checked-in', 'active', 'pending'] },
    checkIn: { $lte: now },
    checkOut: { $gte: now }
  }).populate('user', 'name email phone').sort({ checkIn: -1 });

  const roomBookingMap = {};
  activeBookings.forEach((b) => {
    if (b.room) {
      const rId = b.room.toString();
      if (!roomBookingMap[rId]) {
        roomBookingMap[rId] = b;
      }
    }
  });

  const enrichedRooms = rooms.map((room) => {
    const rObj = room.toObject ? room.toObject() : { ...room };
    const booking = roomBookingMap[rObj._id.toString()];
    if (booking) {
      rObj.currentBooking = {
        _id: booking._id,
        bookingId: `#AH-${booking._id.toString().slice(-5).toUpperCase()}`,
        fullName: booking.fullName || (booking.user && booking.user.name) || 'Registered Guest',
        email: booking.email || (booking.user && booking.user.email) || '',
        phone: booking.phone || (booking.user && booking.user.phone) || '',
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        bookingSource: booking.bookingSource || 'Online',
        specialRequests: booking.specialRequests || ''
      };
    }
    return rObj;
  });

  // Sort rooms numerically by roomNumber (1, 2, 3, ... 38)
  enrichedRooms.sort((a, b) => (parseInt(a.roomNumber, 10) || 0) - (parseInt(b.roomNumber, 10) || 0));

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).json({
    success: true,
    count: enrichedRooms.length,
    pagination,
    data: enrichedRooms,
  });
});

// @desc    Get available rooms for a given date range
// @route   GET /api/rooms/available
// @access  Public
export const getAvailableRooms = asyncHandler(async (req, res, next) => {
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    return next(new ErrorResponse('Please provide check-in and check-out dates', 400));
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    return next(new ErrorResponse('Check-out date must be after check-in date', 400));
  }

  // Find overlapping bookings
  const overlappingBookings = await Booking.find({
    status: { $ne: 'cancelled' },
    $or: [
      {
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      },
    ],
  }).select('room');

  const bookedRoomIds = overlappingBookings.map((b) => b.room);

  // Find all rooms NOT in bookedRoomIds
  // Apply the same query filters as getRooms for type, etc.
  let query;
  const reqQuery = { ...req.query };
  const removeFields = ['checkIn', 'checkOut', 'select', 'sort', 'page', 'limit', '_t', 'cacheBuster'];
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
  const parsedQuery = JSON.parse(queryStr);

  if (reqQuery.type && reqQuery.type !== 'all') {
    applyTypeFilter(parsedQuery, reqQuery.type);
  }

  // Add the availability filter
  parsedQuery._id = { $nin: bookedRoomIds };

  query = Room.find(parsedQuery);

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('price'); // Sort by price by default for available rooms
  }

  const rooms = await query;

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).json({
    success: true,
    count: rooms.length,
    data: rooms,
  });
});

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
export const getRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
    );
  }

  const now = new Date();
  const activeBooking = await Booking.findOne({
    room: room._id,
    status: { $in: ['confirmed', 'checked-in', 'active', 'pending'] },
    checkIn: { $lte: now },
    checkOut: { $gte: now }
  }).populate('user', 'name email phone').sort({ checkIn: -1 });

  const rObj = room.toObject ? room.toObject() : { ...room };
  if (activeBooking) {
    rObj.currentBooking = {
      _id: activeBooking._id,
      bookingId: `#AH-${activeBooking._id.toString().slice(-5).toUpperCase()}`,
      fullName: activeBooking.fullName || (activeBooking.user && activeBooking.user.name) || 'Registered Guest',
      email: activeBooking.email || (activeBooking.user && activeBooking.user.email) || '',
      phone: activeBooking.phone || (activeBooking.user && activeBooking.user.phone) || '',
      checkIn: activeBooking.checkIn,
      checkOut: activeBooking.checkOut,
      guests: activeBooking.guests,
      totalPrice: activeBooking.totalPrice,
      status: activeBooking.status,
      paymentStatus: activeBooking.paymentStatus,
      bookingSource: activeBooking.bookingSource || 'Online',
      specialRequests: activeBooking.specialRequests || ''
    };
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  sendSuccess(res, 200, 'Room details retrieved', rObj);
});

// @desc    Create room
// @route   POST /api/rooms
// @access  Private/Admin
export const createRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.create(req.body);

  sendSuccess(res, 201, 'Room created successfully', room);
});

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
export const updateRoom = asyncHandler(async (req, res, next) => {
  let room = await Room.findById(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
    );
  }

  // If status is updated to 'Occupied' manually by admin, check if an active booking exists for today.
  // If not, automatically create a Walk-In booking for today -> tomorrow so dates are locked on website.
  if (req.body.status === 'Occupied' && room.status !== 'Occupied') {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const existingActive = await Booking.findOne({
      room: room._id,
      status: { $ne: 'cancelled' },
      checkIn: { $lt: tomorrow },
      checkOut: { $gt: now },
    });

    if (!existingActive) {
      await Booking.create({
        room: room._id,
        checkIn: now,
        checkOut: tomorrow,
        guests: room.capacity || 2,
        totalPrice: room.price || 0,
        fullName: 'Physical Walk-In Guest',
        email: `walkin-room${room.roomNumber || room._id}@tsedekegrandhotel.com`,
        phone: 'Physical Walk-In',
        bookingSource: 'Walk-In',
        status: 'checked-in',
        paymentStatus: 'paid',
        specialRequests: 'Manually marked as Occupied by Admin'
      });
    }
  }

  // Synchronize isAvailable based on status if status is supplied
  if (req.body.status) {
    req.body.isAvailable = req.body.status === 'Available';
  }

  room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, 'Room updated successfully', room);
});

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
export const deleteRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
    );
  }

  await room.deleteOne();

  sendSuccess(res, 200, 'Room deleted successfully');
});

// @desc    Upload room image
// @route   POST /api/rooms/upload
// @access  Private/Admin
export const uploadRoomImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }
  
  // Normalize path for cross-platform compatibility
  const imagePath = req.file.path;

  sendSuccess(res, 200, 'Image uploaded successfully', { url: imagePath, path: imagePath });
});
