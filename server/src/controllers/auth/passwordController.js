import User from '../../models/user/User.js';
import asyncHandler from '../../middleware/error/asyncHandler.js';
import ErrorResponse from '../../utils/response/errorResponse.js';
import { sendSuccess } from '../../utils/response/apiResponse.js';
import crypto from 'crypto';
import sendEmail from '../../utils/email/sendEmail.js';
import { passwordResetTemplate } from '../../utils/email/emailTemplates.js';

// @desc    Forgot password — send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email address', 400));
  }

  const cleanEmail = email.trim();
  const user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });

  if (!user) {
    return next(new ErrorResponse(`No account found with email: ${cleanEmail}`, 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  // Create reset URL (support both Admin and Frontend depending on request origin or user role)
  const origin = req.headers.origin || req.headers.referer || '';
  const isAdminReq = origin.includes('5174') || user.role === 'admin' || user.role === 'superadmin';
  const baseUrl = isAdminReq 
    ? (process.env.ADMIN_URL || 'http://localhost:5174')
    : (process.env.CLIENT_URL || 'http://localhost:3000');

  const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

  try {
    const template = passwordResetTemplate(resetUrl);
    await sendEmail({
      to: user.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    console.log(`[PASSWORD RESET] Email sent successfully to ${user.email}. Link: ${resetUrl}`);
    sendSuccess(res, 200, 'Password reset email sent successfully');
  } catch (error) {
    console.error('Email send error:', error);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent. Please verify SMTP settings.', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new ErrorResponse('Please provide a new password', 400));
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired reset token', 400));
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendSuccess(res, 200, 'Password reset successful');
});

// @desc    Change password (logged in user)
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new password', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  sendSuccess(res, 200, 'Password changed successfully');
});
