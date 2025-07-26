import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import { AuthenticatedRequest, ApiResponse, UpdateUserData } from '../types';
import { GetUsersQueryData } from '../schemas/userSchema';

class UserController {
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body;
      const user = await userService.createUser(userData);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id as string);
      
      const response: ApiResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Use validated query data if available, otherwise fall back to req.query
      const query: GetUsersQueryData = (req as any).validatedQuery || req.query as unknown as GetUsersQueryData;

      const result = await userService.getUsers(query);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = await userService.updateUser(id as string, updateData);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await userService.deleteUser(id as string);
      
      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginData = req.body;

      const userIpAddress = req.ip;
      const userAgent = req.headers['user-agent'];
      const userDeviceInfo = req.headers['x-device-info'];
      const result = await userService.authenticateUser(loginData, userIpAddress || '', userAgent || '', userDeviceInfo as string | undefined);
      
      const response: ApiResponse = {
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
        message: 'Login successful',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserById(req.user!.userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Current user retrieved successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updateData: UpdateUserData = req.body;
      const user = await userService.updateUser(req.user!.userId, updateData);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Profile updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      await userService.changePassword(req.user!.userId, currentPassword, newPassword);
      
      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deactivateCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updateData: UpdateUserData = { isActive: false };
      await userService.updateUser(req.user!.userId, updateData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Account deactivated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const verificationData = req.body;
      const user = await userService.verifyEmail(verificationData);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Email verified successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resendData = req.body;
      await userService.resendVerificationEmail(resendData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Verification email sent successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();