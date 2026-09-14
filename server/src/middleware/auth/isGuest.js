/**
 * Middleware to allow guest (unauthenticated) access while optionally
 * attaching user info if a valid token is present.
 */
import jwt from 'jsonwebtoken';
import User from '../../models/user/User.js';

export const isGuest = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (err) {
      // Token is invalid — continue as guest
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

export default isGuest;
