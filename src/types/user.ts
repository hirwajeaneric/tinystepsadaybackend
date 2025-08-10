import { UserRole } from '@prisma/client';

// User Management Types
export interface UserQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastLogin' | 'email' | 'username';
  sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  usersByRole: Record<UserRole, number>;
  recentRegistrations: number;
}

export interface UserActivity {
  userId: string;
  action: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// User Profile Types
export interface UserProfileResponse {
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
  stats?: {
    totalSessions: number;
    activeSessions: number;
    notificationsCount: number;
    unreadNotificationsCount: number;
  };
}

// User Session Management
export interface SessionManagementResponse {
  id: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  currentSession: boolean;
}

export interface RevokeSessionRequest {
  sessionId: string;
}

export interface RevokeAllSessionsRequest {
  keepCurrent?: boolean;
}

// User Account Management
export interface DeactivateAccountRequest {
  password: string;
  reason?: string;
}

export interface ReactivateAccountRequest {
  email: string;
  token: string;
}

export interface DeleteAccountRequest {
  password: string;
  confirmation: string;
}

// User Search and Filter
export interface UserSearchFilters {
  query: string;
  fields?: ('email' | 'username' | 'firstName' | 'lastName')[];
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  limit?: number;
}

export interface UserSearchResult {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

// User Bulk Operations
export interface BulkUserOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'changeRole';
  data?: {
    role?: UserRole;
    reason?: string;
  };
}

export interface BulkOperationResult {
  success: boolean;
  message: string;
  results: {
    userId: string;
    success: boolean;
    error?: string;
  }[];
}

// User Import/Export
export interface UserExportOptions {
  format: 'csv' | 'json';
  fields: ('id' | 'email' | 'username' | 'firstName' | 'lastName' | 'role' | 'isActive' | 'isEmailVerified' | 'createdAt' | 'lastLogin')[];
  filters?: UserQueryFilters;
}

export interface UserImportData {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  password?: string;
}

export interface UserImportResult {
  success: boolean;
  message: string;
  results: {
    row: number;
    email: string;
    success: boolean;
    userId?: string;
    error?: string;
  }[];
} 