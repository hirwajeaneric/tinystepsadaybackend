import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import userService from '../services/userService';
import { 
  ChangeUserRoleData,
  ToggleAccountStatusData,
  BulkUserOperationData
} from '../schemas/userSchema';
import logger from '../utils/logger';

class AdminController {
  /**
   * Change user role (ADMIN and SUPER_ADMIN only)
   */
  async changeUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const data: ChangeUserRoleData = req.body;
      const currentUser = req.user!;

      // Check if target user exists and get their current role
      const targetUser = await userService.getUserByIdWithRole(userId!);

      // SUPER_ADMIN can change any role
      // ADMIN can change any role EXCEPT SUPER_ADMIN
      if (currentUser.role === 'ADMIN' && targetUser.role === 'SUPER_ADMIN') {
        res.status(403).json({
          success: false,
          error: 'INSUFFICIENT_PERMISSIONS',
          message: 'Admins cannot modify super-admin accounts'
        });
        return;
      }

      // Prevent changing to SUPER_ADMIN if current user is ADMIN
      if (currentUser.role === 'ADMIN' && data.role === 'SUPER_ADMIN') {
        res.status(403).json({
          success: false,
          error: 'INSUFFICIENT_PERMISSIONS',
          message: 'Admins cannot assign super-admin role'
        });
        return;
      }

      // Update user role using service
      const updatedUser = await userService.changeUserRole(userId!, data);

      // Log the role change
      logger.info('User role changed', {
        changedBy: currentUser.userId,
        targetUser: userId,
        oldRole: targetUser.role,
        newRole: data.role,
        reason: data.reason
      });

      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: updatedUser
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

      logger.error('Error changing user role:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to change user role'
      });
    }
  }

  /**
   * Toggle account activation/deactivation (ADMIN and SUPER_ADMIN only)
   */
  async toggleAccountStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const data: ToggleAccountStatusData = req.body;
      const currentUser = req.user!;

      // Check if target user exists and get their current role
      const targetUser = await userService.getUserByIdWithRole(userId!);

      // SUPER_ADMIN can modify any account
      // ADMIN can modify any account EXCEPT SUPER_ADMIN
      if (currentUser.role === 'ADMIN' && targetUser.role === 'SUPER_ADMIN') {
        res.status(403).json({
          success: false,
          error: 'INSUFFICIENT_PERMISSIONS',
          message: 'Admins cannot modify super-admin accounts'
        });
        return;
      }

      // Update account status using service
      const updatedUser = await userService.toggleAccountStatus(userId!, data);

      // Log the status change
      logger.info('User account status changed', {
        changedBy: currentUser.userId,
        targetUser: userId,
        oldStatus: targetUser.isActive,
        newStatus: data.isActive,
        reason: data.reason
      });

      res.status(200).json({
        success: true,
        message: `User account ${data.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedUser
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

      logger.error('Error toggling account status:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update account status'
      });
    }
  }

  /**
   * Bulk user operations (ADMIN and SUPER_ADMIN only)
   */
  async bulkUserOperation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data: BulkUserOperationData = req.body;
      const currentUser = req.user!;

      // Check for SUPER_ADMIN users if current user is ADMIN
      if (currentUser.role === 'ADMIN') {
        // Get all target users to check for SUPER_ADMIN
        const targetUsers = await userService.getUsers({ 
          page: 1, 
          limit: 1000, 
          search: '', 
          isActive: undefined, 
          isEmailVerified: undefined, 
          role: undefined, 
          sortBy: 'createdAt', 
          sortOrder: 'desc' 
        });

        const superAdminUsers = (targetUsers.data || []).filter((user: any) => 
          data.userIds.includes(user.id) && user.role === 'SUPER_ADMIN'
        );

        if (superAdminUsers.length > 0) {
          res.status(403).json({
            success: false,
            error: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admins cannot modify super-admin accounts',
            data: {
              superAdminUsers: superAdminUsers.map((u: any) => ({ id: u.id, email: u.email }))
            }
          });
          return;
        }

        // Prevent assigning SUPER_ADMIN role
        if (data.operation === 'change_role' && data.role === 'SUPER_ADMIN') {
          res.status(403).json({
            success: false,
            error: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admins cannot assign super-admin role'
          });
          return;
        }
      }

      // Perform bulk operation using service
      const result = await userService.bulkUserOperation(data);

      // Log the bulk operation
      logger.info('Bulk user operation performed', {
        performedBy: currentUser.userId,
        operation: data.operation,
        affectedUsers: data.userIds.length,
        role: data.role,
        reason: data.reason
      });

      res.status(200).json({
        success: true,
        message: `Bulk operation '${data.operation}' completed successfully`,
        data: {
          operation: data.operation,
          affectedCount: result.affectedCount,
          affectedUserIds: result.affectedUserIds
        }
      });
    } catch (error: any) {
      if (error.message === 'Some user IDs are invalid') {
        res.status(400).json({
          success: false,
          error: 'INVALID_USER_IDS',
          message: 'Some user IDs are invalid'
        });
        return;
      }

      if (error.message === 'Role is required for change_role operation') {
        res.status(400).json({
          success: false,
          error: 'MISSING_ROLE',
          message: 'Role is required for change_role operation'
        });
        return;
      }

      if (error.message === 'Invalid operation specified') {
        res.status(400).json({
          success: false,
          error: 'INVALID_OPERATION',
          message: 'Invalid operation specified'
        });
        return;
      }

      logger.error('Error performing bulk user operation:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to perform bulk operation'
      });
    }
  }
}

export default new AdminController(); 