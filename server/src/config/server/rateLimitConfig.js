/**
 * Rate limiting configuration.
 */
const rateLimitConfig = {
  general: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 login attempts per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
    },
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200,
    message: {
      success: false,
      message: 'Too many upload requests, please try again later.',
    },
  },
};

export default rateLimitConfig;
