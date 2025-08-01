// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  details?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: Record<string, any>;
}

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EMAIL_ERROR = 'EMAIL_ERROR',
  TOKEN_ERROR = 'TOKEN_ERROR',
  SESSION_ERROR = 'SESSION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export enum ErrorCode {
  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_MISSING = 'TOKEN_MISSING',
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_INVALID = 'SESSION_INVALID',
  TOO_MANY_LOGIN_ATTEMPTS = 'TOO_MANY_LOGIN_ATTEMPTS',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',
  TWO_FACTOR_INVALID = 'TWO_FACTOR_INVALID',
  
  // Authorization Errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ROLE_REQUIRED = 'ROLE_REQUIRED',
  ADMIN_ACCESS_REQUIRED = 'ADMIN_ACCESS_REQUIRED',
  
  // Validation Errors
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  INVALID_USERNAME = 'INVALID_USERNAME',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS = 'USERNAME_ALREADY_EXISTS',
  INVALID_TOKEN_FORMAT = 'INVALID_TOKEN_FORMAT',
  
  // Resource Errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  NOTIFICATION_NOT_FOUND = 'NOTIFICATION_NOT_FOUND',
  EMAIL_VERIFICATION_EXPIRED = 'EMAIL_VERIFICATION_EXPIRED',
  PASSWORD_RESET_EXPIRED = 'PASSWORD_RESET_EXPIRED',
  
  // Rate Limiting Errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Database Errors
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  DATABASE_TRANSACTION_ERROR = 'DATABASE_TRANSACTION_ERROR',
  
  // Email Errors
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  EMAIL_TEMPLATE_ERROR = 'EMAIL_TEMPLATE_ERROR',
  EMAIL_CONFIGURATION_ERROR = 'EMAIL_CONFIGURATION_ERROR',
  
  // Security Errors
  CSRF_TOKEN_MISSING = 'CSRF_TOKEN_MISSING',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
  REQUEST_ORIGIN_INVALID = 'REQUEST_ORIGIN_INVALID',
  
  // General Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  BAD_REQUEST = 'BAD_REQUEST',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  SOCIAL_ACCOUNT_ALREADY_LINKED = 'SOCIAL_ACCOUNT_ALREADY_LINKED',
  SOCIAL_ACCOUNT_NOT_FOUND = 'SOCIAL_ACCOUNT_NOT_FOUND',
  INVALID_SOCIAL_TOKEN = 'INVALID_SOCIAL_TOKEN',
}

// Custom Error Classes
export class AppValidationError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;
  public details?: Record<string, any>;

  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'AppValidationError';
    this.statusCode = 400;
    this.isOperational = true;
    this.code = ErrorCode.BAD_REQUEST;
    if (details) {
      this.details = details;
    }
  }
}

export class AuthenticationError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, code: string = ErrorCode.INVALID_CREDENTIALS) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
    this.isOperational = true;
    this.code = code;
  }
}

export class AuthorizationError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, code: string = ErrorCode.INSUFFICIENT_PERMISSIONS) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
    this.isOperational = true;
    this.code = code;
  }
}

export class NotFoundError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, code: string = ErrorCode.USER_NOT_FOUND) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.isOperational = true;
    this.code = code;
  }
}

export class ConflictError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, code: string = ErrorCode.EMAIL_ALREADY_EXISTS) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.isOperational = true;
    this.code = code;
  }
}

export class RateLimitError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, code: string = ErrorCode.RATE_LIMIT_EXCEEDED) {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
    this.isOperational = true;
    this.code = code;
  }
}

export class DatabaseError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, code: string = ErrorCode.DATABASE_QUERY_ERROR) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
    this.isOperational = true;
    this.code = code;
  }
}

export class EmailError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, code: string = ErrorCode.EMAIL_SEND_FAILED) {
    super(message);
    this.name = 'EmailError';
    this.statusCode = 500;
    this.isOperational = true;
    this.code = code;
  }
}

export class TokenError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, code: string = ErrorCode.TOKEN_INVALID) {
    super(message);
    this.name = 'TokenError';
    this.statusCode = 401;
    this.isOperational = true;
    this.code = code;
  }
}

export class SessionError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string, code: string = ErrorCode.SESSION_INVALID) {
    super(message);
    this.name = 'SessionError';
    this.statusCode = 401;
    this.isOperational = true;
    this.code = code;
  }
}

export class InternalServerError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code: string;

  constructor(message: string = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
    this.statusCode = 500;
    this.isOperational = false;
    this.code = ErrorCode.INTERNAL_SERVER_ERROR;
  }
} 