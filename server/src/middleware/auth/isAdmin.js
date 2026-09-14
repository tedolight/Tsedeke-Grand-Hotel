import ErrorResponseClass from '../../utils/response/errorResponse.js';

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponseClass('User not authenticated', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponseClass(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ErrorResponseClass('Not authorized as an admin', 403));
  }
  next();
};
