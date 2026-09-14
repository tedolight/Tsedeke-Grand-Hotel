import User from '../../models/user/User.js';
import Room from '../../models/room/Room.js';
import Booking from '../../models/booking/Booking.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendResponse, sendSuccess } from '../../utils/response/apiResponse.js';
import generateToken from '../../utils/auth/generateToken.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new ErrorResponse('User already exists', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    const token = generateToken(user._id);
    sendResponse(res, 201, true, 'User registered successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, token);
  } else {
    return next(new ErrorResponse('Invalid user data', 400));
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('No account found with that email address', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Incorrect password. Please try again.', 401));
  }

  const token = generateToken(user._id);

  sendResponse(res, 200, true, 'Login successful', {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }, token);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  sendSuccess(res, 200, 'User data retrieved', user);
});

// @desc    Get public login statistics (Rooms, Occupancy, Check-ins)
// @route   GET /api/auth/login-stats
// @access  Public
export const getLoginStats = asyncHandler(async (req, res, next) => {
  const totalRooms = await Room.countDocuments() || 38;
  const activeBookedCount = await Booking.countDocuments({ status: { $in: ['confirmed', 'checked-in'] } });
  const occupancyRate = totalRooms > 0 ? Math.round((activeBookedCount / totalRooms) * 100) : 0;

  sendSuccess(res, 200, 'Login statistics retrieved', {
    totalRooms,
    occupancyRate: `${occupancyRate}%`,
    checkIns: activeBookedCount,
  });
});
