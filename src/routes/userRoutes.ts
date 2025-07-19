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

const router = Router();

// Public routes
router.post(
  '/register',
  validate({ body: createUserSchema }),
  userController.createUser
);

router.post(
  '/login',
  validate({ body: loginSchema }),
  userController.loginUser
);

// Protected routes (require authentication)
router.use(authenticate);

// Current user routes
router.get('/me', userController.getCurrentUser);

router.put(
  '/me',
  validate({ body: updateUserSchema }),
  userController.updateCurrentUser
);

router.post(
  '/me/change-password',
  validate({ body: changePasswordSchema }),
  userController.changePassword
);

router.post('/me/deactivate', userController.deactivateCurrentUser);

// Admin routes (for managing other users)
router.get(
  '/',
  validate({ query: getUsersQuerySchema }),
  userController.getUsers
);

router.get(
  '/:id',
  validate({ params: z.object({ id: objectIdSchema }) }),
  userController.getUserById
);

router.put(
  '/:id',
  validate({ 
    params: z.object({ id: objectIdSchema }),
    body: updateUserSchema 
  }),
  userController.updateUser
);

router.delete(
  '/:id',
  validate({ params: z.object({ id: objectIdSchema }) }),
  userController.deleteUser
);

export default router;