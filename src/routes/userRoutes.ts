import { Router } from 'express';
import userController from '../controllers/userController';
import adminController from '../controllers/adminController';
import { 
  authenticate, 
  requireAdmin, 
  requireModerator
} from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  createUserSchema, 
  updateUserSchema, 
  loginSchema, 
  changePasswordSchema, 
  getUsersQuerySchema,
  objectIdSchema,
  emailVerificationSchema,
  resendVerificationSchema,
  changeUserRoleSchema,
  toggleAccountStatusSchema,
  bulkUserOperationSchema,
  deactivateAccountSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema
} from '../schemas/userSchema';
import { z } from 'zod';
import {
  authRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  profileUpdateRateLimiter,
  adminRateLimiter,
  emailVerificationRateLimiter
} from '../middleware/rateLimit';

const router = Router();

// Public routes with specific rate limiting
router.post(
  '/register',
  registrationRateLimiter, // 3 registration attempts per hour
  validate({ body: createUserSchema }),
  userController.createUser
);

router.post(
  '/login',
  authRateLimiter, // 5 auth attempts per 15 minutes
  validate({ body: loginSchema }),
  userController.loginUser
);

// Email verification routes (public)
router.post(
  '/verify-email',
  emailVerificationRateLimiter, // Rate limit for verification attempts
  validate({ body: emailVerificationSchema }),
  userController.verifyEmail
);

router.post(
  '/resend-verification',
  emailVerificationRateLimiter, // Rate limit for resending verification
  validate({ body: resendVerificationSchema }),
  userController.resendVerificationEmail
);

// Password reset routes (public)
router.post(
  '/forgot-password',
  passwordResetRateLimiter, // 3 password reset requests per hour
  validate({ body: forgotPasswordSchema }),
  userController.forgotPassword
);

router.post(
  '/reset-password',
  passwordResetRateLimiter, // 3 password reset attempts per hour
  validate({ body: resetPasswordSchema }),
  userController.resetPassword
);

// Token refresh route (public)
router.post(
  '/refresh-token',
  authRateLimiter, // 5 refresh attempts per 15 minutes
  validate({ body: refreshTokenSchema }),
  userController.refreshToken
);

/**
 * *********************************************************************
 * Protected routes (require authentication)
 * *********************************************************************
 */
router.use(authenticate);

// Current user routes (users can only access their own data)
router.get('/me', userController.getCurrentUser);

router.put(
  '/me',
  profileUpdateRateLimiter, // 10 profile updates per 15 minutes
  validate({ body: updateUserSchema }),
  userController.updateCurrentUser
);

router.post(
  '/me/change-password',
  passwordResetRateLimiter, // 3 password changes per hour
  validate({ body: changePasswordSchema }),
  userController.changePassword
);

router.post('/me/deactivate', 
  validate({ body: deactivateAccountSchema }),
  userController.deactivateCurrentUser
);

/**
 * *********************************************************************
 * Admin routes (for managing other users) with role-based authorization
 * *********************************************************************
 */
router.get(
  '/',
  adminRateLimiter, // 100 admin operations per hour
  requireModerator, // MODERATOR and above can read users
  validate({ query: getUsersQuerySchema }),
  userController.getUsers
);

router.get(
  '/:id',
  adminRateLimiter, // 100 admin operations per hour
  requireModerator, // MODERATOR and above can read specific users
  validate({ params: z.object({ id: objectIdSchema }) }),
  userController.getUserById
);

router.put(
  '/:id',
  adminRateLimiter, // 100 admin operations per hour
  requireModerator, // MODERATOR and above can update users
  validate({ 
    params: z.object({ id: objectIdSchema }),
    body: updateUserSchema 
  }),
  userController.updateUser
);

router.delete(
  '/:id',
  adminRateLimiter, // 100 admin operations per hour
  requireAdmin, // Only ADMIN and SUPER_ADMIN can delete users
  validate({ params: z.object({ id: objectIdSchema }) }),
  userController.deleteUser
);

/**
 * *********************************************************************
 * Advanced Admin Management Routes (ADMIN and SUPER_ADMIN only)
 * *********************************************************************
 */

// Role management
router.patch(
  '/:userId/role',
  adminRateLimiter,
  requireAdmin, // Only ADMIN and SUPER_ADMIN can change roles
  validate({ 
    params: z.object({ userId: objectIdSchema }),
    body: changeUserRoleSchema 
  }),
  adminController.changeUserRole
);

// Account activation/deactivation
router.patch(
  '/:userId/status',
  adminRateLimiter,
  requireAdmin, // Only ADMIN and SUPER_ADMIN can toggle account status
  validate({ 
    params: z.object({ userId: objectIdSchema }),
    body: toggleAccountStatusSchema 
  }),
  adminController.toggleAccountStatus
);

// Bulk operations
router.post(
  '/bulk',
  adminRateLimiter,
  requireAdmin, // Only ADMIN and SUPER_ADMIN can perform bulk operations
  validate({ body: bulkUserOperationSchema }),
  adminController.bulkUserOperation
);

export default router;