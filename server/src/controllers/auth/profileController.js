import User from '../../models/user/User.js';
import UserProfile from '../../models/user/UserProfile.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const profile = await UserProfile.findOne({ user: req.user.id });

  sendSuccess(res, 200, 'Profile retrieved successfully', {
    user,
    profile: profile || {},
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, address, dateOfBirth, nationality, preferences } = req.body;

  // Update user name if provided
  if (name) {
    await User.findByIdAndUpdate(req.user.id, { name }, { new: true, runValidators: true });
  }

  // Update or create profile
  const profileData = {};
  if (phone !== undefined) profileData.phone = phone;
  if (address !== undefined) profileData.address = address;
  if (dateOfBirth !== undefined) profileData.dateOfBirth = dateOfBirth;
  if (nationality !== undefined) profileData.nationality = nationality;
  if (preferences !== undefined) profileData.preferences = preferences;

  const profile = await UserProfile.findOneAndUpdate(
    { user: req.user.id },
    { ...profileData, user: req.user.id },
    { new: true, upsert: true, runValidators: true }
  );

  const updatedUser = await User.findById(req.user.id);

  sendSuccess(res, 200, 'Profile updated successfully', {
    user: updatedUser,
    profile,
  });
});

// @desc    Get all users (admin)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().sort('-createdAt').lean();
  const profiles = await UserProfile.find().lean();
  
  const usersWithProfiles = users.map(user => {
    const profile = profiles.find(p => p.user.toString() === user._id.toString());
    return { ...user, profile: profile || {} };
  });

  sendSuccess(res, 200, 'Users retrieved successfully', usersWithProfiles);
});

// @desc    Get single user (admin)
// @route   GET /api/auth/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  const profile = await UserProfile.findOne({ user: req.params.id });

  sendSuccess(res, 200, 'User retrieved successfully', {
    user,
    profile: profile || {},
  });
});

// @desc    Update user role (admin)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    return next(new ErrorResponse('Please provide a valid role (user or admin)', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  sendSuccess(res, 200, 'User role updated successfully', user);
});

// @desc    Update user (admin)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const { first, last, email, phone, role, dept, status, location, notes } = req.body;

  let user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  const name = first && last ? `${first} ${last}` : user.name;
  const dbRole = role === 'superadmin' || role === 'admin' ? 'admin' : 'user';

  user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role: dbRole },
    { new: true, runValidators: true }
  );

  const profileData = {};
  if (phone !== undefined) profileData.phone = phone;
  if (location !== undefined) profileData.location = location;
  if (notes !== undefined) profileData.notes = notes;
  if (dept !== undefined) profileData.dept = dept;
  if (status !== undefined) profileData.status = status;
  if (role !== undefined) profileData.detailedRole = role;

  const profile = await UserProfile.findOneAndUpdate(
    { user: req.params.id },
    { ...profileData, user: req.params.id },
    { new: true, upsert: true, runValidators: true }
  );

  sendSuccess(res, 200, 'User updated successfully', {
    user,
    profile,
  });
});

// @desc    Delete user (disabled)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  return next(new ErrorResponse('Account deletion has been disabled for security reasons.', 403));
});

// @desc    Create user (admin)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, role, password, first, last, dept, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorResponse('User already exists', 400));
  }

  const dbRole = role === 'superadmin' || role === 'admin' ? 'admin' : 'user';
  const fullName = name || (first && last ? `${first} ${last}` : 'New User');

  const user = await User.create({
    name: fullName,
    email,
    role: dbRole,
    password: password || '123456',
  });

  await UserProfile.create({
    user: user._id,
    phone: phone || '',
    dept: dept || 'Front Desk',
    detailedRole: role || 'staff',
    status: 'active'
  });

  sendSuccess(res, 201, 'User created successfully', user);
});
