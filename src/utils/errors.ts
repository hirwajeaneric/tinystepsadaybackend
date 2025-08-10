import { ErrorType } from '../types';
import { Response } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly type: ErrorType;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number,
    type: ErrorType,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = isOperational;
    this.code = code || type;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', code?: string) {
    super(message, 400, ErrorType.VALIDATION_ERROR, code);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', code?: string) {
    super(message, 500, ErrorType.DATABASE_ERROR, code);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 401, ErrorType.AUTHENTICATION_ERROR, code);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Authorization failed', code?: string) {
    super(message, 403, ErrorType.AUTHORIZATION_ERROR, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, ErrorType.NOT_FOUND_ERROR, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', code?: string) {
    super(message, 409, ErrorType.CONFLICT_ERROR, code);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', code?: string) {
    super(message, 500, ErrorType.INTERNAL_SERVER_ERROR, code);
  }
}

export class TokenError extends AppError {
  constructor(message: string = 'Token error', code?: string) {
    super(message, 401, ErrorType.AUTHENTICATION_ERROR, code);
  }
}

export const createErrorFromPrisma = (error: any): AppError => {
  if (error.code === 'P2002') {
    return new ConflictError('Resource already exists', 'EMAIL_ALREADY_EXISTS');
  }
  
  if (error.code === 'P2025') {
    return new NotFoundError('Resource not found', 'USER_NOT_FOUND');
  }
  
  if (error.code === 'P2003') {
    return new ValidationError('Foreign key constraint failed', 'VALIDATION_ERROR');
  }
  
  return new DatabaseError(error.message || 'Database operation failed', 'DATABASE_ERROR');
};

export const handleError = (error: any, res: Response) => {
  console.error('Error:', error);
  
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.code,
      message: error.message
    });
  }
  
  if (error.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: error.errors
    });
  }
  
  return res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
};