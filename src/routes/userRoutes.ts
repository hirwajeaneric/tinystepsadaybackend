import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

// GET /api/users - Get all users
router.get('/', UserController.getUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', UserController.getUserById);

// POST /api/users - Create new user
router.post('/', UserController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', UserController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', UserController.deleteUser);

// GET /api/users/:id/stats - Get user statistics
router.get('/:id/stats', UserController.getUserStats);

export default router; 