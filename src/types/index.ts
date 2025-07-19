import { Request } from 'express';

// User types
export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  username: string;
}

// Express request extensions
export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
  body: any;
  headers: any;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error types
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

// Email verification types
export interface EmailVerificationData {
  email: string;
  code: string;
  expiresAt: Date;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  user?: UserResponse;
}