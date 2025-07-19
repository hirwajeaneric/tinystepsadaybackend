import { ErrorType } from '../types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly type: ErrorType;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    type: ErrorType,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = isOperational;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, ErrorType.VALIDATION_ERROR);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, ErrorType.DATABASE_ERROR);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, ErrorType.AUTHENTICATION_ERROR);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Authorization failed') {
    super(message, 403, ErrorType.AUTHORIZATION_ERROR);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, ErrorType.NOT_FOUND_ERROR);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, ErrorType.CONFLICT_ERROR);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, ErrorType.INTERNAL_SERVER_ERROR);
  }
}

export const createErrorFromPrisma = (error: any): AppError => {
  if (error.code === 'P2002') {
    return new ConflictError('Resource already exists');
  }
  
  if (error.code === 'P2025') {
    return new NotFoundError('Resource not found');
  }
  
  if (error.code === 'P2003') {
    return new ValidationError('Foreign key constraint failed');
  }
  
  return new DatabaseError(error.message || 'Database operation failed');
};