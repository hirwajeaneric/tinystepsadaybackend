import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, createErrorFromPrisma } from '../utils/errors';
import { ErrorResponse } from '../types';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

const handleZodError = (error: ZodError): AppError => {
  const message = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join('; ');
  return new AppError(message, 400, 'VALIDATION_ERROR' as any);
};

const handlePrismaError = (error: any): AppError => {
  return createErrorFromPrisma(error);
};

const handlePrismaValidationError = (_error: any): AppError => {
  return new AppError('Invalid data provided', 400, 'VALIDATION_ERROR' as any);
};

const handleJWTError = (): AppError => {
  return new AppError('Invalid token', 401, 'AUTHENTICATION_ERROR' as any);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Token expired', 401, 'AUTHENTICATION_ERROR' as any);
};

const sendErrorDev = (err: AppError, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: err.message,
    statusCode: err.statusCode,
    timestamp: new Date().toISOString(),
    path: res.req.path,
    stack: err.stack,
  } as any;

  res.status(err.statusCode).json(errorResponse);
};

const sendErrorProd = (err: AppError, res: Response): void => {
  // Only send operational errors to client in production
  if (err.isOperational) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: err.message,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
      path: res.req.path,
    };

    res.status(err.statusCode).json(errorResponse);
  } else {
    // Log error and send generic message
    logger.error('Programming error:', err);
    
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'Something went wrong',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: res.req.path,
    };

    res.status(500).json(errorResponse);
  }
};

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err as AppError;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle specific error types
  if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = handlePrismaValidationError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (!(err instanceof AppError)) {
    // Convert unknown errors to AppError
    error = new AppError(
      'Something went wrong',
      500,
      'INTERNAL_SERVER_ERROR' as any,
      false
    );
  }

  // Send error response
if (process.env['NODE_ENV'] === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default globalErrorHandler;