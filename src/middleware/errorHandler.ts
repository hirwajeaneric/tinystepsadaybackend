import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { errorResponse } from '../utils';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const message = 'Database operation failed';
    error = new AppError(message, 400);
  }

  if (err.name === 'PrismaClientValidationError') {
    const message = 'Invalid data provided';
    error = new AppError(message, 400);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Default error
  const statusCode = (error as AppError).statusCode || 500;
  const message = error.message || 'Server Error';

  res.status(statusCode).json(
    errorResponse(
      message,
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    )
  );
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route not found - ${req.originalUrl}`, 404);
  next(error);
}; 