import { validationResult } from 'express-validator';
import ErrorResponse from '../../utils/response/errorResponse.js';

/**
 * Express-validator results handler middleware.
 * Place this after validation rules to catch and format errors.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }

  next();
};

export default validate;
