import { Request } from 'express';
import { UserRole } from '@prisma/client';

// Authentication Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserResponse;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TwoFactorSetupRequest {
  enable: boolean;
}

export interface TwoFactorVerifyRequest {
  code: string;
}

// User Types
export interface UserResponse {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  avatar?: string;
  bio?: string;
  isActive?: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
}

// Session Types
export interface UserSessionResponse {
  id: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  expiresAt: Date;
  rememberMe: boolean;
  refreshCount: number;
  maxRefreshes: number;
  createdAt: Date;
}

export interface CreateSessionData {
  userId: string;
  refreshToken: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  rememberMe: boolean;
  refreshCount: number;
  maxRefreshes: number;
}

// Token Types
export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  sessionId: string;
  type: 'access' | 'refresh';
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  sessionId: string;
}

// Express Request Extensions
export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
  sessionId?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
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

export interface PaginatedResponseWithAnalytics<T> extends PaginatedResponse<T> {
  analytics: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    admins: number;
    moderators: number;
    instructors: number;
    superAdmins: number;
    regularUsers: number;
  };
}

// Security Types
export interface SecurityConfig {
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  passwordResetExpiry: string;
  emailVerificationExpiry: string;
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  maxSessionsPerUser: number;
  maxRefreshTokensWithoutRememberMe: number;
  maxRefreshTokensWithRememberMe: number;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
} 