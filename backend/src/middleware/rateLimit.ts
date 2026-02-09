import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * Rate limit error handler
 */
const rateLimitHandler = (req: Request, res: Response) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
  });

  res.status(429).json({
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '1 minute',
    },
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: rateLimitHandler,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Password change rate limiter
 */
export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password change attempts per hour
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Registration rate limiter
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration attempts per hour
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API creation rate limiter (for creating resources)
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 create requests per minute
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * File upload rate limiter
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 upload requests per minute
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Search rate limiter
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 search requests per minute
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});