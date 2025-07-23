import { Router } from 'express';
import userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  createUserSchema, 
  updateUserSchema, 
  loginSchema, 
  changePasswordSchema, 
  getUsersQuerySchema, 
  objectIdSchema 
} from '../schemas/userSchema';
import { z } from 'zod';
import {
  authRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  emailVerificationRateLimiter,
  profileUpdateRateLimiter,
  adminRateLimiter
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

// Protected routes (require authentication)
router.use(authenticate);

// Current user routes
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

router.post('/me/deactivate', userController.deactivateCurrentUser);

// Admin routes (for managing other users) with admin rate limiting
router.get(
  '/',
  adminRateLimiter, // 100 admin operations per hour
  validate({ query: getUsersQuerySchema }),
  userController.getUsers
);

router.get(
  '/:id',
  adminRateLimiter, // 100 admin operations per hour
  validate({ params: z.object({ id: objectIdSchema }) }),
  userController.getUserById
);

router.put(
  '/:id',
  adminRateLimiter, // 100 admin operations per hour
  validate({ 
    params: z.object({ id: objectIdSchema }),
    body: updateUserSchema 
  }),
  userController.updateUser
);

router.delete(
  '/:id',
  adminRateLimiter, // 100 admin operations per hour
  validate({ params: z.object({ id: objectIdSchema }) }),
  userController.deleteUser
);

export default router;