import { z } from 'zod';

// Base user schema
const userSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
});

// Create user schema
export const createUserSchema = userSchema;

// Update user schema (all fields optional except password requirements)
export const updateUserSchema = z.object({
  email: userSchema.shape.email.optional(),
  username: userSchema.shape.username.optional(),
  firstName: userSchema.shape.firstName.optional(),
  lastName: userSchema.shape.lastName.optional(),
  isActive: z.boolean().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: userSchema.shape.email,
  password: z.string().min(1, 'Password is required'),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: userSchema.shape.password,
});

// Query parameters schema for getting users
export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(100, 'Search term must be less than 100 characters').optional(),
  role: z.enum(['USER', 'MODERATOR', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
  isActive: z.coerce.boolean().optional(),
  isEmailVerified: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'lastLogin', 'email', 'username']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// MongoDB ObjectId schema
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Email verification schema
export const emailVerificationSchema = z.object({
  email: userSchema.shape.email,
  verificationCode: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only digits'),
});

// Resend verification email schema
export const resendVerificationSchema = z.object({
  email: userSchema.shape.email,
});

// Role management schema
export const changeUserRoleSchema = z.object({
  role: z.enum(['USER', 'MODERATOR', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional()
});

// Account activation/deactivation schema
export const toggleAccountStatusSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional()
});

// Bulk operations schema
export const bulkUserOperationSchema = z.object({
  userIds: z.array(z.string().min(1, 'User ID is required')).min(1, 'At least one user ID is required').max(50, 'Maximum 50 users per operation'),
  operation: z.enum(['activate', 'deactivate', 'change_role', 'delete']),
  role: z.enum(['USER', 'MODERATOR', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional()
});

// User search and filter schema
export const userSearchSchema = z.object({
  search: z.string().max(100, 'Search term must be less than 100 characters').optional(),
  role: z.enum(['USER', 'MODERATOR', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']).optional(),
  isActive: z.coerce.boolean().optional(),
  isEmailVerified: z.coerce.boolean().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  lastLoginAfter: z.string().datetime().optional(),
  lastLoginBefore: z.string().datetime().optional()
});

// Account deactivation schema (requires password verification)
export const deactivateAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional()
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: userSchema.shape.email,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  email: userSchema.shape.email,
  resetToken: z
    .string()
    .length(6, 'Reset token must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Reset token must contain only digits'),
  newPassword: userSchema.shape.password,
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Validation helper types
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type GetUsersQueryData = z.infer<typeof getUsersQuerySchema>;
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;
export type ResendVerificationData = z.infer<typeof resendVerificationSchema>;
export type ChangeUserRoleData = z.infer<typeof changeUserRoleSchema>;
export type ToggleAccountStatusData = z.infer<typeof toggleAccountStatusSchema>;
export type BulkUserOperationData = z.infer<typeof bulkUserOperationSchema>;
export type UserSearchData = z.infer<typeof userSearchSchema>;
export type DeactivateAccountData = z.infer<typeof deactivateAccountSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type RefreshTokenData = z.infer<typeof refreshTokenSchema>;