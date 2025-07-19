import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { rateLimitConfig } from '../config/security';
import logger from '../utils/logger';

// General API rate limiter
export const generalRateLimiter = rateLimit({
  windowMs: rateLimitConfig.general.windowMs,
  max: rateLimitConfig.general.max,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: rateLimitConfig.general.message
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('General rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: rateLimitConfig.general.message
    });
  }
});

// Authentication rate limiter
export const authRateLimiter = rateLimit({
  windowMs: rateLimitConfig.auth.windowMs,
  max: rateLimitConfig.auth.max,
  message: {
    success: false,
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: rateLimitConfig.auth.message
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: rateLimitConfig.auth.skipSuccessfulRequests,
  handler: (req: Request, res: Response) => {
    logger.warn('Authentication rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: rateLimitConfig.auth.message
    });
  }
});

// Password reset rate limiter
export const passwordResetRateLimiter = rateLimit({
  windowMs: rateLimitConfig.passwordReset.windowMs,
  max: rateLimitConfig.passwordReset.max,
  message: {
    success: false,
    error: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    message: rateLimitConfig.passwordReset.message
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Password reset rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
      message: rateLimitConfig.passwordReset.message
    });
  }
});

// Email verification rate limiter
export const emailVerificationRateLimiter = rateLimit({
  windowMs: rateLimitConfig.emailVerification.windowMs,
  max: rateLimitConfig.emailVerification.max,
  message: {
    success: false,
    error: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED',
    message: rateLimitConfig.emailVerification.message
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Email verification rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED',
      message: rateLimitConfig.emailVerification.message
    });
  }
});

// User registration rate limiter
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour
  message: {
    success: false,
    error: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
    message: 'Too many registration attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Registration rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
      message: 'Too many registration attempts, please try again later.'
    });
  }
});

// Profile update rate limiter
export const profileUpdateRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 profile updates per 15 minutes
  message: {
    success: false,
    error: 'PROFILE_UPDATE_RATE_LIMIT_EXCEEDED',
    message: 'Too many profile update attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Profile update rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'PROFILE_UPDATE_RATE_LIMIT_EXCEEDED',
      message: 'Too many profile update attempts, please try again later.'
    });
  }
});

// Admin operations rate limiter
export const adminRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 admin operations per hour
  message: {
    success: false,
    error: 'ADMIN_RATE_LIMIT_EXCEEDED',
    message: 'Too many admin operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Admin rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'ADMIN_RATE_LIMIT_EXCEEDED',
      message: 'Too many admin operations, please try again later.'
    });
  }
});

// Custom rate limiter factory
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  errorCode: string;
  skipSuccessfulRequests: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: options.errorCode,
      message: options.message
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests,
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded: ${options.errorCode}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method
      });
      
      res.status(429).json({
        success: false,
        error: options.errorCode,
        message: options.message
      });
    }
  });
}; 