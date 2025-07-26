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

// Validation helper types
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type GetUsersQueryData = z.infer<typeof getUsersQuerySchema>;
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;
export type ResendVerificationData = z.infer<typeof resendVerificationSchema>;