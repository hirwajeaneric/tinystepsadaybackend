import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import database from '../utils/database';
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

      // Check if target user exists
      const targetUser = await database.prisma.user.findUnique({
        where: { id: userId! },
        select: { id: true, role: true, email: true, username: true }
      });

      if (!targetUser) {
        res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
        return;
      }

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

      // Update user role
      const updatedUser = await database.prisma.user.update({
        where: { id: userId! },
        data: { 
          role: data.role,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          updatedAt: true
        }
      });

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
    } catch (error) {
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

      // Check if target user exists
      const targetUser = await database.prisma.user.findUnique({
        where: { id: userId! },
        select: { id: true, role: true, email: true, username: true, isActive: true }
      });

      if (!targetUser) {
        res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
        return;
      }

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

      // Update account status
      const updatedUser = await database.prisma.user.update({
        where: { id: userId! },
        data: { 
          isActive: data.isActive,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          updatedAt: true
        }
      });

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
    } catch (error) {
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

      // Get all target users
      const targetUsers = await database.prisma.user.findMany({
        where: { id: { in: data.userIds } },
        select: { id: true, role: true, email: true, username: true, isActive: true }
      });

      if (targetUsers.length !== data.userIds.length) {
        res.status(400).json({
          success: false,
          error: 'INVALID_USER_IDS',
          message: 'Some user IDs are invalid'
        });
        return;
      }

      // Check for SUPER_ADMIN users if current user is ADMIN
      if (currentUser.role === 'ADMIN') {
        const superAdminUsers = targetUsers.filter(user => user.role === 'SUPER_ADMIN');
        if (superAdminUsers.length > 0) {
          res.status(403).json({
            success: false,
            error: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admins cannot modify super-admin accounts',
            data: {
              superAdminUsers: superAdminUsers.map(u => ({ id: u.id, email: u.email }))
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

      let affectedCount = 0;

      switch (data.operation) {
        case 'activate':
          const activateResult = await database.prisma.user.updateMany({
            where: { id: { in: data.userIds } },
            data: { isActive: true, updatedAt: new Date() }
          });
          affectedCount = activateResult.count;
          break;

        case 'deactivate':
          const deactivateResult = await database.prisma.user.updateMany({
            where: { id: { in: data.userIds } },
            data: { isActive: false, updatedAt: new Date() }
          });
          affectedCount = deactivateResult.count;
          break;

        case 'change_role':
          if (!data.role) {
            res.status(400).json({
              success: false,
              error: 'MISSING_ROLE',
              message: 'Role is required for change_role operation'
            });
            return;
          }
          const roleResult = await database.prisma.user.updateMany({
            where: { id: { in: data.userIds } },
            data: { role: data.role, updatedAt: new Date() }
          });
          affectedCount = roleResult.count;
          break;

        case 'delete':
          const deleteResult = await database.prisma.user.deleteMany({
            where: { id: { in: data.userIds } }
          });
          affectedCount = deleteResult.count;
          break;

        default:
          res.status(400).json({
            success: false,
            error: 'INVALID_OPERATION',
            message: 'Invalid operation specified'
          });
          return;
      }

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
          affectedCount: affectedCount,
          affectedUserIds: data.userIds
        }
      });
    } catch (error) {
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