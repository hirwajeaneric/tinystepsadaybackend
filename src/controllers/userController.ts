import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { successResponse, paginatedResponse } from '../utils';
import { UserRole } from '../types';

export class UserController {
  // Get all users
  static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { users, total } = await UserService.getUsers(page, limit);

      res.json(
        paginatedResponse(users, page, limit, total)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      res.json(successResponse(user, 'User retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Create new user
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name, role } = req.body;

      // Validate required fields
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      const user = await UserService.createUser({
        email,
        name,
        role: role as UserRole
      });

      res.status(201).json(
        successResponse(user, 'User created successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  // Update user
  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, role } = req.body;

      const user = await UserService.updateUser(id, {
        name,
        role: role as UserRole
      });

      res.json(successResponse(user, 'User updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);

      res.json(successResponse(null, 'User deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get user statistics
  static async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await UserService.getUserStats(id);

      res.json(successResponse(result, 'User statistics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
} 