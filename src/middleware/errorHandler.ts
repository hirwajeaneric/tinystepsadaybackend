import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { 
  ErrorResponse, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  ConflictError, 
  RateLimitError, 
  DatabaseError, 
  EmailError, 
  TokenError, 
  SessionError, 
  InternalServerError, 
  AppValidationError
} from '../types/errors';
import logger from '../utils/logger';

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle different types of errors
  if (error instanceof AppValidationError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = error.message;
    details = error.details;
  } else if (error instanceof AuthenticationError) {
    statusCode = 401;
    errorCode = error.code || 'AUTHENTICATION_ERROR';
    message = error.message;
  } else if (error instanceof AuthorizationError) {
    statusCode = 403;
    errorCode = error.code || 'AUTHORIZATION_ERROR';
    message = error.message;
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    errorCode = error.code || 'NOT_FOUND_ERROR';
    message = error.message;
  } else if (error instanceof ConflictError) {
    statusCode = 409;
    errorCode = error.code || 'CONFLICT_ERROR';
    message = error.message;
  } else if (error instanceof RateLimitError) {
    statusCode = 429;
    errorCode = error.code || 'RATE_LIMIT_ERROR';
    message = error.message;
  } else if (error instanceof DatabaseError) {
    statusCode = 500;
    errorCode = error.code || 'DATABASE_ERROR';
    message = error.message;
  } else if (error instanceof EmailError) {
    statusCode = 500;
    errorCode = error.code || 'EMAIL_ERROR';
    message = error.message;
  } else if (error instanceof TokenError) {
    statusCode = 401;
    errorCode = error.code || 'TOKEN_ERROR';
    message = error.message;
  } else if (error instanceof SessionError) {
    statusCode = 401;
    errorCode = error.code || 'SESSION_ERROR';
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = error.issues.map((err: ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message,
      value: err.input
    }));
  } else if (error instanceof InternalServerError) {
    statusCode = error.statusCode;
    errorCode = error.code || 'APP_ERROR';
    message = error.message;
    details = {};
  }

  // Log error details
  const errorResponse: ErrorResponse = {
    success: false,
    error: errorCode,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    details
  };

  // Log based on error severity
  if (statusCode >= 500) {
    logger.error('Server error:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.userId
    });
  } else if (statusCode >= 400) {
    logger.warn('Client error:', {
      error: error.message,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.userId
    });
  }

  // Don't send error details in production for security
  if (process.env['NODE_ENV'] === 'production' && statusCode >= 500) {
    errorResponse.message = 'Internal server error';
    errorResponse.details = {};
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: 'NOT_FOUND_ERROR',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  logger.warn('Route not found:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error handler for unhandled promise rejections
 */
export const handleUnhandledRejection = (reason: any, promise: Promise<any>): void => {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise
  });

  // In production, you might want to exit the process
  if (process.env['NODE_ENV'] === 'production') {
    process.exit(1);
  }
};

/**
 * Error handler for uncaught exceptions
 */
export const handleUncaughtException = (error: Error): void => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack
  });

  // In production, you might want to exit the process
  if (process.env['NODE_ENV'] === 'production') {
    process.exit(1);
  }
};

/**
 * Setup global error handlers
 */
export const setupErrorHandlers = (): void => {
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);
};

/**
 * Custom error factory for common errors
 */
export const createError = {
  validation: (message: string, details?: any) => new AppValidationError(message, details),
  authentication: (message: string, code?: string) => new AuthenticationError(message, code),
  authorization: (message: string, code?: string) => new AuthorizationError(message, code),
  notFound: (message: string, code?: string) => new NotFoundError(message, code),
  conflict: (message: string, code?: string) => new ConflictError(message, code),
  rateLimit: (message: string, code?: string) => new RateLimitError(message, code),
  database: (message: string, code?: string) => new DatabaseError(message, code),
  email: (message: string, code?: string) => new EmailError(message, code),
  token: (message: string, code?: string) => new TokenError(message, code),
  session: (message: string, code?: string) => new SessionError(message, code),
  internal: (message?: string) => new InternalServerError(message)
};