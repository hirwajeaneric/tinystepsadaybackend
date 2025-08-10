import { Router, RequestHandler } from 'express';
import userController from '../controllers/userController';
import adminController from '../controllers/adminController';
import {
  authenticateWithAutoRefresh,
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
import socialAuthController from '../controllers/socialAuthController';

const router = Router();

// Public routes with specific rate limiting
router.post(
  '/register', 
  registrationRateLimiter, 
  validate({ body: createUserSchema }), 
  userController.createUser as RequestHandler
);
router.post(
  '/login', 
  authRateLimiter, 
  validate({ body: loginSchema }), 
  userController.loginUser as RequestHandler
);

// Email verification routes (public)
router.post(
  '/verify-email', 
  emailVerificationRateLimiter, 
  validate({ body: emailVerificationSchema }), 
  userController.verifyEmail as RequestHandler
);
router.post(
  '/resend-verification', 
  emailVerificationRateLimiter, 
  validate({ body: resendVerificationSchema }), 
  userController.resendVerificationEmail as RequestHandler
);
// Password reset routes (public)
router.post(
  '/forgot-password', 
  passwordResetRateLimiter, 
  validate({ body: forgotPasswordSchema }), 
  userController.forgotPassword as RequestHandler
);
router.post(
  '/reset-password', 
  passwordResetRateLimiter, 
  validate({ body: resetPasswordSchema }), 
  userController.resetPassword as RequestHandler
);

// Token refresh route (public)
router.post(
  '/refresh-token', 
  authRateLimiter, 
  validate({ body: refreshTokenSchema }), 
  userController.refreshToken as RequestHandler
);

// OAuth callback routes (public)
router.get(
  '/auth/google/callback', 
  socialAuthController.googleCallback as RequestHandler
);
router.get(
  '/auth/apple/callback', 
  socialAuthController.appleCallback as RequestHandler
);

// Social auth verification route (public)
router.post(
  '/auth/google/verify', 
  socialAuthController.verifyGoogleToken as RequestHandler
);

/**
 * *********************************************************************
 * Protected routes (require authentication)
 * *********************************************************************
 */
router.use(authenticateWithAutoRefresh as RequestHandler);

// Current user routes (users can only access their own data)
router.get(
  '/me',
  userController.getCurrentUser as RequestHandler
);
router.put(
  '/me',
  profileUpdateRateLimiter,
  validate({ body: updateUserSchema }),
  userController.updateCurrentUser as RequestHandler
);
router.post(
  '/me/change-password',
  passwordResetRateLimiter,
  validate({ body: changePasswordSchema }),
  userController.changePassword as RequestHandler
);

router.post(
  '/me/deactivate',
  validate({ body: deactivateAccountSchema }),
  userController.deactivateCurrentUser as RequestHandler
);

// Social auth management routes (require authentication)
router.post(
  '/auth/social/link',
  socialAuthController.linkSocialAccount as RequestHandler
);
router.delete(
  '/auth/social/unlink/:provider',
  socialAuthController.unlinkSocialAccount as RequestHandler
);
router.get(
  '/auth/social/accounts',
  socialAuthController.getLinkedSocialAccounts as RequestHandler
);

/**
 * *********************************************************************
 * Admin routes (for managing other users) with role-based authorization
 * *********************************************************************
 */
router.get(
  '/',
  adminRateLimiter,
  requireModerator as RequestHandler,
  validate({ query: getUsersQuerySchema }),
  userController.getUsers as RequestHandler
);
router.get(
  '/:id',
  adminRateLimiter,
  requireModerator as RequestHandler,
  validate({ params: z.object({ id: objectIdSchema }) }),
  userController.getUserById as RequestHandler
);
router.put(
  '/:id',
  adminRateLimiter,
  requireModerator as RequestHandler,
  validate({ params: z.object({ id: objectIdSchema }), body: updateUserSchema }),
  userController.updateUser as RequestHandler
);

router.delete(
  '/:id',
  adminRateLimiter,
  requireAdmin as RequestHandler,
  validate({ params: z.object({ id: objectIdSchema }) }),
  userController.deleteUser as RequestHandler
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
  requireAdmin as RequestHandler, 
  validate({ params: z.object({ userId: objectIdSchema }), body: changeUserRoleSchema }), 
  adminController.changeUserRole as RequestHandler
);
// Account activation/deactivation
router.patch(
  '/:userId/status', 
  adminRateLimiter, 
  requireAdmin as RequestHandler, 
  validate({ params: z.object({ userId: objectIdSchema }), body: toggleAccountStatusSchema }), 
  adminController.toggleAccountStatus as RequestHandler
);
// Bulk operations
router.post(
  '/bulk', 
  adminRateLimiter, 
  requireAdmin as RequestHandler, 
  validate({ body: bulkUserOperationSchema }), 
  adminController.bulkUserOperation as RequestHandler
);

export default router;