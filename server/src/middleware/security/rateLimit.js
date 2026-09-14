import rateLimit from 'express-rate-limit';
import rateLimitConfig from '../../config/server/rateLimitConfig.js';

/**
 * General API rate limiter.
 */
export const generalRateLimit = rateLimit(rateLimitConfig.general);

/**
 * Upload-specific rate limiter.
 */
export const uploadRateLimit = rateLimit(rateLimitConfig.upload);

export default generalRateLimit;
