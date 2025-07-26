import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodIssue } from 'zod';
import { validationConfig } from '../config/security';
import logger from '../utils/logger';
import { ParamsDictionary } from 'express-serve-static-core';

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(255, 'Email is too long');

export const usernameSchema = z
  .string()
  .min(validationConfig.username.minLength, `Username must be at least ${validationConfig.username.minLength} characters`)
  .max(validationConfig.username.maxLength, `Username must be no more than ${validationConfig.username.maxLength} characters`)
  .regex(validationConfig.username.pattern, 'Username can only contain letters, numbers, underscores, and hyphens');

export const passwordSchema = z
  .string()
  .min(validationConfig.password.minLength, `Password must be at least ${validationConfig.password.minLength} characters`)
  .max(validationConfig.password.maxLength, `Password must be no more than ${validationConfig.password.maxLength} characters`)
  .regex(validationConfig.password.pattern, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const firstNameSchema = z
  .string()
  .min(1, 'First name is required')
  .max(50, 'First name is too long')
  .optional();

export const lastNameSchema = z
  .string()
  .min(1, 'Last name is required')
  .max(50, 'Last name is too long')
  .optional();

// Authentication validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: passwordSchema
});

export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

export const resendVerificationSchema = z.object({
  email: emailSchema
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema
});

// User profile validation schemas
export const updateProfileSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  avatar: z.string().url('Invalid avatar URL').optional(),
  bio: z.string().max(500, 'Bio is too long').optional()
});

export const updateUserSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  avatar: z.string().url('Invalid avatar URL').optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
  role: z.enum(['USER', 'MODERATOR', 'INSTRUCTOR', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional()
});

// Session management validation schemas
export const revokeSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required')
});

export const revokeAllSessionsSchema = z.object({
  keepCurrent: z.boolean().optional()
});

// Two-factor authentication validation schemas
export const twoFactorSetupSchema = z.object({
  enable: z.boolean()
});

export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, 'Two-factor code must be 6 digits')
});





// Notification validation schemas
export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'AUTH_VERIFICATION', 'PASSWORD_RESET', 'ACCOUNT_UPDATE']).optional(),
  isRead: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'isRead']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const markNotificationReadSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required')
});

export const markAllNotificationsReadSchema = z.object({
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'AUTH_VERIFICATION', 'PASSWORD_RESET', 'ACCOUNT_UPDATE']).optional()
});

export const deleteNotificationSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required')
});

export const deleteAllNotificationsSchema = z.object({
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'AUTH_VERIFICATION', 'PASSWORD_RESET', 'ACCOUNT_UPDATE']).optional(),
  isRead: z.coerce.boolean().optional()
});

// Account management validation schemas
export const deactivateAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  reason: z.string().max(500).optional()
});

export const reactivateAccountSchema = z.object({
  email: emailSchema,
  token: z.string().min(1, 'Token is required')
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.string().min(1, 'Confirmation is required')
}).refine(data => data.password === data.confirmation, {
  message: 'Password confirmation does not match',
  path: ['confirmation']
});

// Validation schema configuration
interface ValidationConfig {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

// Generic validation middleware factory
export const validate = (config: ValidationConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (config.body && req.body && Object.keys(req.body).length > 0) {
        req.body = config.body.parse(req.body);
      }

      // Validate query parameters
      if (config.query && req.query && Object.keys(req.query).length > 0) {
        const validatedQuery = config.query.parse(req.query);
        // Store validated query in a custom property instead of overwriting req.query
        (req as any).validatedQuery = validatedQuery;
      }

      // Validate URL parameters
      if (config.params && req.params && Object.keys(req.params).length > 0) {
        req.params = config.params.parse(req.params) as ParamsDictionary;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input
        }));

        logger.warn('Validation error', {
          errors: validationErrors,
          url: req.url,
          method: req.method,
          ip: req.ip
        });

        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: validationErrors
        });
      } else {
        logger.error('Unexpected validation error:', error);
        res.status(500).json({
          success: false,
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Validation error occurred'
        });
      }
    }
  };
};

// Specific validation middlewares
export const validateLogin = validate({ body: loginSchema });
export const validateRegister = validate({ body: registerSchema });
export const validateRefreshToken = validate({ body: refreshTokenSchema });
export const validatePasswordResetRequest = validate({ body: passwordResetRequestSchema });
export const validatePasswordResetConfirm = validate({ body: passwordResetConfirmSchema });
export const validateEmailVerification = validate({ body: emailVerificationSchema });
export const validateResendVerification = validate({ body: resendVerificationSchema });
export const validateChangePassword = validate({ body: changePasswordSchema });
export const validateUpdateProfile = validate({ body: updateProfileSchema });
export const validateUpdateUser = validate({ body: updateUserSchema });
export const validateRevokeSession = validate({ body: revokeSessionSchema });
export const validateRevokeAllSessions = validate({ body: revokeAllSessionsSchema });
export const validateTwoFactorSetup = validate({ body: twoFactorSetupSchema });
export const validateTwoFactorVerify = validate({ body: twoFactorVerifySchema });


export const validateNotificationQuery = validate({ query: notificationQuerySchema });
export const validateMarkNotificationRead = validate({ body: markNotificationReadSchema });
export const validateMarkAllNotificationsRead = validate({ body: markAllNotificationsReadSchema });
export const validateDeleteNotification = validate({ body: deleteNotificationSchema });
export const validateDeleteAllNotifications = validate({ body: deleteAllNotificationsSchema });
export const validateDeactivateAccount = validate({ body: deactivateAccountSchema });
export const validateReactivateAccount = validate({ body: reactivateAccountSchema });
export const validateDeleteAccount = validate({ body: deleteAccountSchema });

// Custom validation functions
export const validateObjectId = (id: string): boolean => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

export const validatePagination = (page: number, limit: number): boolean => {
  return page > 0 && limit > 0 && limit <= 100;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// export const validateFileUpload = (file: Multer.File, allowedTypes: string[], maxSize: number): boolean => {  
//   if (!file) return false;
  
//   const isValidType = allowedTypes.includes(file.mimetype);
//   const isValidSize = file.size <= maxSize;
  
//   return isValidType && isValidSize;
// };