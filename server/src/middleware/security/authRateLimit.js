import rateLimit from 'express-rate-limit';
import rateLimitConfig from '../../config/server/rateLimitConfig.js';

/**
 * Authentication-specific rate limiter.
 * Stricter limits for login/register endpoints to prevent brute force.
 */
export const authRateLimit = rateLimit(rateLimitConfig.auth);

export default authRateLimit;
