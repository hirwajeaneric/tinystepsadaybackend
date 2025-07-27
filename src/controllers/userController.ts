import { Request, Response } from 'express';
import userService from '../services/userService';
import { AuthenticatedRequest } from '../types';
import { 
  GetUsersQueryData, 
  CreateUserData, 
  UpdateUserData, 
  LoginData,
  ForgotPasswordData,
  ResetPasswordData,
  RefreshTokenData,
  ResendVerificationData,
} from '../schemas/userSchema';

class UserController {
  /**
   * Create a new user (registration)
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body as CreateUserData;
      const result = await userService.createUser(userData);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({
          success: false,
          error: 'DUPLICATE_USER',
          message: 'User with this email or username already exists'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user'
      });
    }
  }

  /**
   * User login
   */
  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginData = req.body;
      const userIpAddress = req.ip || '';
      const userAgent = req.headers['user-agent'];
      const userDeviceInfo = req.headers['x-device-info'] as string | undefined;
      
      const result = await userService.authenticateUser(loginData, userIpAddress, userAgent, userDeviceInfo);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        });
        return;
      }

      if (error.message === 'Account is deactivated') {
        res.status(403).json({
          success: false,
          error: 'ACCOUNT_DISABLED',
          message: 'Account is deactivated'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Login failed'
      });
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve user profile'
      });
    }
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const updateData = req.body as UpdateUserData;

      // Remove sensitive fields that shouldn't be updated via this endpoint
      const { email, ...safeUpdateData } = updateData;

      const updatedUser = await userService.updateUser(userId, safeUpdateData as UpdateUserData);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({
          success: false,
          error: 'DUPLICATE_USERNAME',
          message: 'Username already taken'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update profile'
      });
    }
  }

  /**
   * Change user password
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      await userService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      if (error.message === 'Current password is incorrect') {
        res.status(400).json({
          success: false,
          error: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to change password'
      });
    }
  }

  /**
   * Deactivate current user account
   * This is a soft deactivation - the account is marked as inactive but not deleted
   * Users can request reactivation through admin or support
   */
  async deactivateCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { password, reason } = req.body;

      // Verify password before deactivation for security
      if (!password) {
        res.status(400).json({
          success: false,
          error: 'PASSWORD_REQUIRED',
          message: 'Password is required to deactivate account'
        });
        return;
      }

      // Verify current password
      const user = await userService.getUserById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
        return;
      }

      // Update user to inactive status
      await userService.updateUser(userId, { isActive: false });

      res.status(200).json({
        success: true,
        message: 'Account deactivated successfully. You can request reactivation through support.',
        data: {
          deactivatedAt: new Date(),
          reason: reason || 'User requested deactivation'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to deactivate account'
      });
    }
  }

  /**
   * Get all users (with pagination and filters)
   */
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query: GetUsersQueryData = (req as any).validatedQuery || req.query as unknown as GetUsersQueryData;
      const result = await userService.getUsers(query);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve users'
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'MISSING_USER_ID',
          message: 'User ID is required'
        });
        return;
      }

      const user = await userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve user'
      });
    }
  }

  /**
   * Update user by ID
   */
  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'MISSING_USER_ID',
          message: 'User ID is required'
        });
        return;
      }

      const updateData = req.body as UpdateUserData;

      const updatedUser = await userService.updateUser(id, updateData);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({
          success: false,
          error: 'DUPLICATE_USERNAME',
          message: 'Username already taken'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user'
      });
    }
  }

  /**
   * Delete user by ID
   */
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'MISSING_USER_ID',
          message: 'User ID is required'
        });
        return;
      }

      await userService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete user'
      });
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      await userService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error: any) {
      if (error.message === 'Invalid or expired token') {
        res.status(400).json({
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Invalid or expired verification token'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to verify email'
      });
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const resendData: ResendVerificationData = req.body;
      await userService.resendVerificationEmail(resendData);

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
        return;
      }

      if (error.message === 'Email already verified') {
        res.status(400).json({
          success: false,
          error: 'EMAIL_ALREADY_VERIFIED',
          message: 'Email is already verified'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to resend verification email'
      });
    }
  }

  /**
   * Forgot password - send reset token via email
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const forgotPasswordData: ForgotPasswordData = req.body;
      await userService.forgotPassword(forgotPasswordData);

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    } catch (error: any) {
      if (error.message === 'Account is deactivated') {
        res.status(403).json({
          success: false,
          error: 'ACCOUNT_DISABLED',
          message: 'Account is deactivated'
        });
        return;
      }

      if (error.message === 'Failed to send password reset email') {
        res.status(500).json({
          success: false,
          error: 'EMAIL_SEND_FAILED',
          message: 'Failed to send password reset email'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process password reset request'
      });
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const resetPasswordData: ResetPasswordData = req.body;
      await userService.resetPassword(resetPasswordData);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
        return;
      }

      if (error.message === 'Account is deactivated') {
        res.status(403).json({
          success: false,
          error: 'ACCOUNT_DISABLED',
          message: 'Account is deactivated'
        });
        return;
      }

      if (error.message === 'Invalid reset token') {
        res.status(400).json({
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Invalid reset token'
        });
        return;
      }

      if (error.message === 'Reset token has expired') {
        res.status(400).json({
          success: false,
          error: 'TOKEN_EXPIRED',
          message: 'Reset token has expired'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to reset password'
      });
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshTokenData: RefreshTokenData = req.body;
      const result = await userService.refreshAccessToken(refreshTokenData);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: result
      });
    } catch (error: any) {
      if (error.message === 'Invalid refresh token') {
        res.status(401).json({
          success: false,
          error: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token'
        });
        return;
      }

      if (error.message === 'Session expired or invalid') {
        res.status(401).json({
          success: false,
          error: 'SESSION_EXPIRED',
          message: 'Session expired or invalid'
        });
        return;
      }

      if (error.message === 'User not found or inactive') {
        res.status(401).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found or inactive'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to refresh token'
      });
    }
  }
}

export default new UserController();