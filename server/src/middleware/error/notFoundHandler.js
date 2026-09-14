import ErrorResponse from '../../utils/response/errorResponse.js';

/**
 * 404 Not Found handler.
 * This is a duplicate of the one in errorHandler.js for modular use.
 */
const notFoundHandler = (req, res, next) => {
  const error = new ErrorResponse(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

export default notFoundHandler;
