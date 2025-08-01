import bcrypt from 'bcryptjs';
import { User as PrismaUser } from '@prisma/client';
import database from '../utils/database';
import {
  UserResponse,
  CreateUserData,
  UpdateUserData,
  PaginatedResponseWithAnalytics,
} from '../types/auth';
import {
  NotFoundError,
  ConflictError,
  AuthenticationError,
  ValidationError,
} from '../utils/errors';
import { ErrorCode } from '../types/errors';
import {
  GetUsersQueryData,
  EmailVerificationData,
  ResendVerificationData,
  ChangeUserRoleData,
  ToggleAccountStatusData,
  BulkUserOperationData,
} from '../schemas/userSchema';
import logger from '../utils/logger';
import {
  generateAndSendVerificationEmail,
  generateAndSendPasswordChangedEmail,
  generateAndSendWelcomeEmail,
  generateAndSendRoleChangedEmail,
  generateAndSendAccountStatusChangedEmail
} from './mail.service';

class UserService {
  private prisma = database.prisma;

  /**
   * Create user
   * @param userData - The data for the user creation.
   * @returns The created user.
   */
  async createUser(userData: CreateUserData): Promise<UserResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { username: userData.username }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === userData.email) {
          throw new ConflictError('Email already exists', ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (existingUser.username === userData.username) {
          throw new ConflictError('Username already exists', ErrorCode.USERNAME_ALREADY_EXISTS);
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create user
      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          emailVerificationToken: verificationCode,
          emailVerificationExpires: verificationExpires,
        },
      });

      // Send verification email
      try {
        const userName = userData.firstName || userData.username;
        await generateAndSendVerificationEmail(
          user.email,
          userName,
          verificationCode
        );

        logger.info('Verification email sent successfully:', {
          userId: user.id,
          email: user.email,
          verificationCode
        });
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Don't fail user creation if email fails, but log it
      }

      // Send welcome email
      try {
        const userName = userData.firstName || userData.username;
        await generateAndSendWelcomeEmail(
          user.email,
          userName
        );

        logger.info('Welcome email sent successfully:', {
          userId: user.id,
          email: user.email
        });
      } catch (emailError) {
        logger.error('Failed to send welcome email:', emailError);
        // Don't fail user creation if email fails, but log it
      }

      logger.info('User created successfully:', { userId: user.id, email: user.email });
      return this.toUserResponse(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param id - The ID of the user to get.
   * @returns The user.
   */
  async getUserById(id: string): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      return this.toUserResponse(user);
    } catch (error) {
      logger.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   * @param email - The email of the user to get.
   * @returns The user.
   */
  async getUserByEmail(email: string): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      return this.toUserResponse(user);
    } catch (error) {
      logger.error('Error fetching user by email:', error);
      throw error;
    }
  }

  /**
   * Get users
   * @param query - The query for the users.
   * @returns The users.
   */
  async getUsers(query: GetUsersQueryData): Promise<PaginatedResponseWithAnalytics<UserResponse>> {
    try {
      const { page, limit, search, isActive, isEmailVerified, role, sortBy, sortOrder } = query;
      const skip = (page - 1) * limit;

      // Build where clause for filtering
      const where: any = {};

      // Add search functionality
      if (search && search.trim()) {
        const searchTerm = search.trim();
        where.OR = [
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { username: { contains: searchTerm, mode: 'insensitive' } },
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      // Add boolean filters - only apply if not "all" and not undefined
      if (isActive !== undefined && isActive !== "all") {
        where.isActive = Boolean(isActive);
      }

      if (isEmailVerified !== undefined && isEmailVerified !== "all") {
        where.isEmailVerified = Boolean(isEmailVerified);
      }

      // Add role filter - only apply if not "all" and not undefined
      if (role !== undefined && role !== "all") {
        where.role = role;
      }

      // Build orderBy clause
      const orderBy: any = { [sortBy]: sortOrder };

      // Get users and total count in parallel for better performance
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.user.count({ where }),
      ]);

      // Get analytics data for all users (not filtered)
      const analytics = await this.getUserAnalytics();

      const userResponses = users.map((user: PrismaUser) => this.toUserResponse(user));
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Users retrieved successfully',
        data: userResponses,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
        analytics,
      };
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param id - The ID of the user to update.
   * @param updateData - The data for the user update.
   * @returns The updated user.
   */
  async updateUser(id: string, updateData: UpdateUserData): Promise<UserResponse> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      // Check for conflicts if email or username is being updated
      if (updateData.email || updateData.username) {
        const conflictUser = await this.prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  updateData.email ? { email: updateData.email } : {},
                  updateData.username ? { username: updateData.username } : {},
                ].filter(condition => Object.keys(condition).length > 0)
              }
            ]
          }
        });

        if (conflictUser) {
          if (conflictUser.email === updateData.email) {
            throw new ConflictError('Email already exists', ErrorCode.EMAIL_ALREADY_EXISTS);
          }
          if (conflictUser.username === updateData.username) {
            throw new ConflictError('Username already exists', ErrorCode.USERNAME_ALREADY_EXISTS);
          }
        }
      }

      // Update user
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      logger.info('User updated successfully:', { userId: id });
      return this.toUserResponse(updatedUser);
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param id - The ID of the user to delete.
   * @returns A Promise that resolves when the operation is complete.
   */
  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      await this.prisma.user.delete({
        where: { id },
      });

      logger.info('User deleted successfully:', { userId: id });
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Authenticate user
   * @param loginData - The data for the user login.
   * @param userIpAddress - The IP address of the user.
   * @param userAgent - The user agent of the user.
   * @param userDeviceInfo - The device information of the user.
   * @returns The authenticated user.
   */
  async  authenticateUser(loginData: any, userIpAddress: string, userAgent: string | undefined, userDeviceInfo: string | undefined): Promise<{ user: UserResponse; token: string; refreshToken: string; expiresIn: number }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginData.email },
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
      }

      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated', ErrorCode.ACCOUNT_DISABLED);
      }

      const isPasswordValid = await bcrypt.compare(loginData.password, user.password || '');

      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
      }

      // Generate a secure refresh token string for database storage
      const { CryptoUtils } = await import('../utils/security');
      const refreshTokenString = CryptoUtils.randomString(64);

      // Determine remember me settings
      const rememberMe = loginData.rememberMe === true;
      const { securityConfig } = await import('../config/security');
      
      // Calculate max refreshes based on remember me choice
      const maxRefreshes = rememberMe 
        ? securityConfig.maxRefreshTokensWithRememberMe 
        : securityConfig.maxRefreshTokensWithoutRememberMe;

      // Calculate session expiry based on remember me choice
      const sessionExpiry = rememberMe 
        ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        : new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours (for 8 refreshes with 30-min tokens)

      // Update last login and create a new session
      const [, session] = await Promise.all([
        this.prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        }),
        this.prisma.userSession.create({
          data: {
            userId: user.id,
            refreshToken: refreshTokenString,
            deviceInfo: userDeviceInfo || null,
            ipAddress: userIpAddress,
            userAgent: userAgent || null,
            expiresAt: sessionExpiry,
            rememberMe: rememberMe,
            refreshCount: 0,
            maxRefreshes: maxRefreshes,
          },
        })
      ]);

      // Generate JWT tokens
      const { jwtConfig } = await import('../config/security');
      const jwt = await import('jsonwebtoken');

      // Generate access token (30 minutes)
      const accessToken = jwt.sign({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        sessionId: session.id,
        type: 'access'
      }, jwtConfig.secret, {
        expiresIn: '30m',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      // Generate JWT refresh token (14 days)
      const refreshToken = jwt.sign({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        sessionId: session.id,
        type: 'refresh'
      }, jwtConfig.secret, {
        expiresIn: '14d',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      logger.info('User authenticated successfully:', { 
        userId: user.id, 
        email: user.email, 
        rememberMe: rememberMe,
        maxRefreshes: maxRefreshes 
      });

      return {
        user: this.toUserResponse(user),
        token: accessToken,
        refreshToken,
        expiresIn: 30 * 60 // 30 minutes in seconds
      };
    } catch (error) {
      logger.error('Error authenticating user:', error);
      throw error;
    }
  }

  /**
   * Change password
   * @param userId - The ID of the user to change the password of.
   * @param currentPassword - The current password of the user.
   * @param newPassword - The new password of the user.
   * @returns A Promise that resolves when the operation is complete.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password || '');

      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect', ErrorCode.INVALID_PASSWORD);
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      // Send password change notification email
      try {
        const userName = user.firstName || user.username;
        const changeTime = new Date().toLocaleString();
        const ipAddress = 'Unknown'; // Could be passed from controller
        const deviceInfo = 'Unknown'; // Could be passed from controller

        await generateAndSendPasswordChangedEmail(
          user.email,
          userName,
          changeTime,
          ipAddress,
          deviceInfo
        );

        logger.info('Password change notification email sent successfully:', {
          userId: user.id,
          email: user.email
        });
      } catch (emailError) {
        logger.error('Failed to send password change notification email:', emailError);
        // Don't fail password change if email fails, but log it
      }

      logger.info('Password changed successfully:', { userId });
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Verify email
   * @param verificationData - The data for the email verification operation.
   * @returns The updated user.
   */
  async verifyEmail(verificationData: EmailVerificationData): Promise<UserResponse> {
    try {
      const { email, verificationCode } = verificationData;

      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      // Check if email is already verified
      if (user.isEmailVerified) {
        throw new ValidationError('Email is already verified', ErrorCode.EMAIL_ALREADY_EXISTS);
      }

      // Check if verification code matches
      if (user.emailVerificationToken !== verificationCode) {
        throw new ValidationError('Invalid verification code', ErrorCode.INVALID_TOKEN_FORMAT);
      }

      // Check if verification code has expired
      if (!user.emailVerificationExpires || new Date() > user.emailVerificationExpires) {
        throw new ValidationError('Verification code has expired', ErrorCode.EMAIL_VERIFICATION_EXPIRED);
      }

      // Update user to verified
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          isActive: true,
        },
      });

      logger.info('Email verified successfully:', { userId: user.id, email });
      return this.toUserResponse(updatedUser);
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw error;
    }
  }

  /**
   * Resend verification email
   * @param resendData - The data for the resend verification email operation.
   * @returns A Promise that resolves when the operation is complete.
   */
  async resendVerificationEmail(resendData: ResendVerificationData): Promise<void> {
    try {
      const { email } = resendData;

      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      // Check if email is already verified
      if (user.isEmailVerified) {
        throw new ValidationError('Email is already verified', ErrorCode.EMAIL_ALREADY_EXISTS);
      }

      // Generate new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update user with new verification code
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: verificationCode,
          emailVerificationExpires: verificationExpires,
        },
      });

      // Send verification email
      const userName = user.firstName || user.username;
      await generateAndSendVerificationEmail(
        user.email,
        userName,
        verificationCode
      );

      logger.info('Verification email resent successfully:', {
        userId: user.id,
        email: user.email,
        verificationCode
      });
    } catch (error) {
      logger.error('Error resending verification email:', error);
      throw error;
    }
  }

  /**
   * Change user role
   * @param userId - The ID of the user to change the role of.
   * @param roleData - The data for the role change.
   * @returns The updated user.
   */
  async changeUserRole(userId: string, roleData: ChangeUserRoleData): Promise<UserResponse> {
    try {
      // Check if target user exists
      const targetUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, email: true, username: true }
      });

      if (!targetUser) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      // Update user role
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          role: roleData.role,
          updatedAt: new Date()
        },
      });

      // Send role change notification email
      try {
        const userName = targetUser.username;
        const oldRole = targetUser.role;
        const newRole = roleData.role;
        const changedBy = 'Admin'; // Could be passed from controller
        const changeTime = new Date().toLocaleString();
        const reason = roleData.reason || 'No reason provided';

        await generateAndSendRoleChangedEmail(
          targetUser.email,
          userName,
          oldRole,
          newRole,
          changedBy,
          changeTime,
          reason
        );

        logger.info('Role change notification email sent successfully:', {
          userId: targetUser.id,
          email: targetUser.email,
          oldRole,
          newRole
        });
      } catch (emailError) {
        logger.error('Failed to send role change notification email:', emailError);
        // Don't fail role change if email fails, but log it
      }

      logger.info('User role changed', {
        targetUser: userId,
        oldRole: targetUser.role,
        newRole: roleData.role,
        reason: roleData.reason
      });

      return this.toUserResponse(updatedUser);
    } catch (error) {
      logger.error('Error changing user role:', error);
      throw error;
    }
  }

  /**
   * Toggle account activation/deactivation
   * @param userId - The ID of the user to toggle the account status of.
   * @param statusData - The data for the account status toggle.
   * @returns The updated user.
   */
  async toggleAccountStatus(userId: string, statusData: ToggleAccountStatusData): Promise<UserResponse> {
    try {
      // Check if target user exists
      const targetUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, email: true, username: true, isActive: true }
      });

      if (!targetUser) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      // Update account status
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          isActive: statusData.isActive,
          updatedAt: new Date()
        },
      });

      // Send account status change notification email
      try {
        const userName = targetUser.username;
        const previousStatus = targetUser.isActive ? 'Active' : 'Inactive';
        const newStatus = statusData.isActive ? 'Active' : 'Inactive';
        const changedBy = 'Admin'; // Could be passed from controller
        const changeTime = new Date().toLocaleString();
        const reason = statusData.reason || 'No reason provided';

        await generateAndSendAccountStatusChangedEmail(
          targetUser.email,
          userName,
          previousStatus,
          newStatus,
          changedBy,
          changeTime,
          reason,
          statusData.isActive
        );

        logger.info('Account status change notification email sent successfully:', {
          userId: targetUser.id,
          email: targetUser.email,
          previousStatus,
          newStatus
        });
      } catch (emailError) {
        logger.error('Failed to send account status change notification email:', emailError);
        // Don't fail status change if email fails, but log it
      }

      logger.info('User account status changed', {
        targetUser: userId,
        oldStatus: targetUser.isActive,
        newStatus: statusData.isActive,
        reason: statusData.reason
      });

      return this.toUserResponse(updatedUser);
    } catch (error) {
      logger.error('Error toggling account status:', error);
      throw error;
    }
  }

  /**
   * Bulk user operations
   * @param operationData - The data for the bulk user operation.
   * @returns The affected count and affected user IDs.
   */
  async bulkUserOperation(operationData: BulkUserOperationData): Promise<{ affectedCount: number; affectedUserIds: string[] }> {
    try {
      // Get all target users to validate they exist
      const targetUsers = await this.prisma.user.findMany({
        where: { id: { in: operationData.userIds } },
        select: { id: true, role: true, email: true, username: true, isActive: true }
      });

      if (targetUsers.length !== operationData.userIds.length) {
        throw new ValidationError('Some user IDs are invalid', ErrorCode.BAD_REQUEST);
      }

      let affectedCount = 0;

      switch (operationData.operation) {
        case 'activate':
          const activateResult = await this.prisma.user.updateMany({
            where: { id: { in: operationData.userIds } },
            data: { isActive: true, updatedAt: new Date() }
          });
          affectedCount = activateResult.count;
          break;

        case 'deactivate':
          const deactivateResult = await this.prisma.user.updateMany({
            where: { id: { in: operationData.userIds } },
            data: { isActive: false, updatedAt: new Date() }
          });
          affectedCount = deactivateResult.count;
          break;

        case 'change_role':
          if (!operationData.role) {
            throw new ValidationError('Role is required for change_role operation', ErrorCode.BAD_REQUEST);
          }
          const roleResult = await this.prisma.user.updateMany({
            where: { id: { in: operationData.userIds } },
            data: { role: operationData.role, updatedAt: new Date() }
          });
          affectedCount = roleResult.count;
          break;

        case 'delete':
          const deleteResult = await this.prisma.user.deleteMany({
            where: { id: { in: operationData.userIds } }
          });
          affectedCount = deleteResult.count;
          break;

        default:
          throw new ValidationError('Invalid operation specified', ErrorCode.BAD_REQUEST);
      }

      logger.info('Bulk user operation performed', {
        operation: operationData.operation,
        affectedUsers: operationData.userIds.length,
        role: operationData.role,
        reason: operationData.reason
      });

      return {
        affectedCount,
        affectedUserIds: operationData.userIds
      };
    } catch (error) {
      logger.error('Error performing bulk user operation:', error);
      throw error;
    }
  }

  /**
   * Get user by ID with role information
   * @param userId - The ID of the user to get the role information for.
   * @returns The user with role information.
   */
  async getUserByIdWithRole(userId: string): Promise<{ id: string; role: string; email: string; username: string; isActive?: boolean }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, email: true, username: true, isActive: true }
      });

      if (!user) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      logger.error('Error fetching user with role:', error);
      throw error;
    }
  }

  /**
   * Forgot password
   * @param forgotPasswordData - The data for the forgot password operation.
   * @returns A Promise that resolves when the operation is complete.
   */
  async forgotPassword(forgotPasswordData: any): Promise<void> {
    try {
      const { email } = forgotPasswordData;

      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        logger.info('Password reset requested for non-existent email:', { email });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated', ErrorCode.ACCOUNT_DISABLED);
      }

      // Generate reset token
      const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Update user with reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        },
      });

      // Send reset email
      try {
        const userName = user.firstName || user.username;
        await this.sendPasswordResetEmail(
          user.email,
          userName,
          resetToken
        );

        logger.info('Password reset email sent successfully:', {
          userId: user.id,
          email: user.email,
          resetToken
        });
      } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
        throw new ValidationError('Failed to send password reset email');
      }
    } catch (error) {
      logger.error('Error in forgot password:', error);
      throw error;
    }
  }

  /**
   * Reset password
   * @param resetPasswordData - The data for the reset password operation.
   * @returns A Promise that resolves when the operation is complete.
   */
  async resetPassword(resetPasswordData: any): Promise<void> {
    try {
      const { email, resetToken, newPassword } = resetPasswordData;

      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated', ErrorCode.ACCOUNT_DISABLED);
      }

      // Check if reset token matches
      if (user.passwordResetToken !== resetToken) {
        throw new ValidationError('Invalid reset token', ErrorCode.TOKEN_INVALID);
      }

      // Check if reset token has expired
      if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
        throw new ValidationError('Reset token has expired', ErrorCode.TOKEN_EXPIRED);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password and clear reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          updatedAt: new Date(),
        },
      });

      // Invalidate all existing sessions for security
      await this.prisma.userSession.updateMany({
        where: { userId: user.id },
        data: { isActive: false },
      });

      logger.info('Password reset successfully:', { userId: user.id, email });
    } catch (error) {
      logger.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param email - The email address of the user to send the password reset email to.
   * @param userName - The name of the user to personalize the email.
   * @param resetToken - The reset token to be included in the email for the user to reset their password.
   * @returns A Promise that resolves when the email is sent successfully.
   * @throws Will throw an error if sending the email fails.
   */
  private async sendPasswordResetEmail(email: string, userName: string, resetToken: string): Promise<void> {
    try {
      // Import email service dynamically to avoid circular dependencies
      const { generateAndSendPasswordResetEmail } = await import('./mail.service');

      await generateAndSendPasswordResetEmail(
        email,
        userName,
        resetToken
      );
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw new ValidationError('Failed to send password reset email');
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshTokenData - The data for the refresh access token operation.
   * @returns The new access token and refresh token.
   * @throws Will throw an error if the refresh token is invalid or expired.
   */
  async refreshAccessToken(refreshTokenData: any): Promise<{ token: string; refreshToken: string; expiresIn: number }> {
    try {
      const { refreshToken } = refreshTokenData;

      // Import JWT and config
      const jwt = await import('jsonwebtoken');
      const { jwtConfig } = await import('../config/security');

      // Verify refresh token
      const payload = jwt.verify(refreshToken, jwtConfig.secret, {
        algorithms: ['HS256'],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as any;

      if (payload.type !== 'refresh') {
        throw new ValidationError('Invalid refresh token');
      }

      // Verify session is still valid and check refresh limits
      const session = await this.prisma.userSession.findUnique({
        where: { id: payload.sessionId },
        select: { 
          isActive: true, 
          expiresAt: true, 
          refreshCount: true, 
          maxRefreshes: true,
          rememberMe: true 
        }
      });

      if (!session || !session.isActive || new Date() > session.expiresAt) {
        throw new ValidationError('Session expired or invalid');
      }

      // Check if refresh limit has been reached
      if (session.refreshCount >= session.maxRefreshes) {
        // Deactivate the session
        await this.prisma.userSession.update({
          where: { id: payload.sessionId },
          data: { isActive: false }
        });
        throw new ValidationError('Refresh token limit reached. Please log in again.');
      }

      // Get user information
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, username: true, role: true, isActive: true }
      });

      if (!user || !user.isActive) {
        throw new ValidationError('User not found or inactive');
      }

      // Increment refresh count
      await this.prisma.userSession.update({
        where: { id: payload.sessionId },
        data: { refreshCount: { increment: 1 } }
      });

      // Generate new access token (30 minutes)
      const newAccessToken = jwt.sign({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        sessionId: payload.sessionId,
        type: 'access'
      }, jwtConfig.secret, {
        expiresIn: '30m',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      // Generate new refresh token (14 days)
      const newRefreshToken = jwt.sign({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        sessionId: payload.sessionId,
        type: 'refresh'
      }, jwtConfig.secret, {
        expiresIn: '14d',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      logger.info('Access token refreshed successfully:', { 
        userId: user.id, 
        sessionId: payload.sessionId,
        refreshCount: session.refreshCount + 1,
        maxRefreshes: session.maxRefreshes,
        rememberMe: session.rememberMe
      });

      return {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 30 * 60 // 30 minutes in seconds
      };
    } catch (error) {
      logger.error('Error refreshing access token:', error);
      throw error;
    }
  }

  /**
   * Get user analytics data
   */
  private async getUserAnalytics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    admins: number;
    moderators: number;
    instructors: number;
    superAdmins: number;
    regularUsers: number;
  }> {
    try {
      // Get all counts in parallel for better performance
      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        admins,
        moderators,
        instructors,
        superAdmins,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { isEmailVerified: true } }),
        this.prisma.user.count({ where: { role: 'ADMIN' } }),
        this.prisma.user.count({ where: { role: 'MODERATOR' } }),
        this.prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
        this.prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
      ]);

      const inactiveUsers = totalUsers - activeUsers;
      const unverifiedUsers = totalUsers - verifiedUsers;
      const regularUsers = totalUsers - admins - moderators - instructors - superAdmins;

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        verifiedUsers,
        unverifiedUsers,
        admins,
        moderators,
        instructors,
        superAdmins,
        regularUsers,
      };
    } catch (error) {
      logger.error('Error fetching user analytics:', error);
      // Return default values if analytics fail
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        verifiedUsers: 0,
        unverifiedUsers: 0,
        admins: 0,
        moderators: 0,
        instructors: 0,
        superAdmins: 0,
        regularUsers: 0,
      };
    }
  }

  /**
   * Convert user to user response
   * @param user - The user to convert.
   * @returns The user response.
   */
  private toUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatar: user.avatar || undefined,
      bio: user.bio || undefined,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export default new UserService();