import bcrypt from 'bcryptjs';
import { User as PrismaUser } from '@prisma/client';
import database from '../utils/database';
import { 
  CreateUserData, 
  UpdateUserData, 
  UserResponse, 
  LoginData, 
  PaginatedResponse 
} from '../types';
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
  ForgotPasswordData,
  ResetPasswordData,
  RefreshTokenData
} from '../schemas/userSchema';
import logger from '../utils/logger';
import { generateAndSendVerificationEmail } from './mail.service';

class UserService {
  private prisma = database.prisma;

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

      logger.info('User created successfully:', { userId: user.id, email: user.email });
      return this.toUserResponse(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

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

  async getUsers(query: GetUsersQueryData): Promise<PaginatedResponse<UserResponse>> {
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

      // Add boolean filters
      if (isActive !== undefined) {
        where.isActive = Boolean(isActive);
      }

      if (isEmailVerified !== undefined) {
        where.isEmailVerified = Boolean(isEmailVerified);
      }

      // Add role filter
      if (role) {
        where.role = role;
      }

      // Build orderBy clause
      const orderBy: any = { [sortBy]: sortOrder };

      logger.info('Fetching users with filters:', {
        where,
        skip,
        take: limit,
        orderBy,
      });

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

      const userResponses = users.map((user: PrismaUser) => this.toUserResponse(user));
      const totalPages = Math.ceil(total / limit);

      logger.info('Users fetched successfully:', {
        total,
        returned: users.length,
        page,
        totalPages,
      });

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
      };
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

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

  async  authenticateUser(loginData: LoginData, userIpAddress: string, userAgent: string | undefined, userDeviceInfo: string | undefined): Promise<{ user: UserResponse; token: string; refreshToken: string; expiresIn: number }> {
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

      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);

      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
      }

      // Generate a secure refresh token string for database storage
      const { CryptoUtils } = await import('../utils/security');
      const refreshTokenString = CryptoUtils.randomString(64);

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
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        })
      ]);

      // Generate JWT tokens
      const { jwtConfig } = await import('../config/security');
      const jwt = await import('jsonwebtoken');
      
      // Generate access token
      const accessToken = jwt.sign({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        sessionId: session.id,
        type: 'access'
      }, jwtConfig.secret, {
        expiresIn: '15m',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      // Generate JWT refresh token
      const refreshToken = jwt.sign({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        sessionId: session.id,
        type: 'refresh'
      }, jwtConfig.secret, {
        expiresIn: '7d',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      logger.info('User authenticated successfully:', { userId: user.id, email: user.email });
      
      return {
        user: this.toUserResponse(user),
        token: accessToken,
        refreshToken,
        expiresIn: 15 * 60 // 15 minutes in seconds
      };
    } catch (error) {
      logger.error('Error authenticating user:', error);
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('User not found', ErrorCode.USER_NOT_FOUND);
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect', ErrorCode.INVALID_PASSWORD);
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      logger.info('Password changed successfully:', { userId });
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

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
   * Change user role (Admin functionality)
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
   * Toggle account activation/deactivation (Admin functionality)
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
   * Bulk user operations (Admin functionality)
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
   * Get user by ID with role information (for admin checks)
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
   * Forgot password - send reset token via email
   */
  async forgotPassword(forgotPasswordData: ForgotPasswordData): Promise<void> {
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
   * Reset password with token
   */
  async resetPassword(resetPasswordData: ResetPasswordData): Promise<void> {
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
   */
  async refreshAccessToken(refreshTokenData: RefreshTokenData): Promise<{ token: string; refreshToken: string; expiresIn: number }> {
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

      // Verify session is still valid
      const session = await this.prisma.userSession.findUnique({
        where: { id: payload.sessionId },
        select: { isActive: true, expiresAt: true }
      });

      if (!session || !session.isActive || new Date() > session.expiresAt) {
        throw new ValidationError('Session expired or invalid');
      }

      // Get user information
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, username: true, role: true, isActive: true }
      });

      if (!user || !user.isActive) {
        throw new ValidationError('User not found or inactive');
      }

      // Generate new access token
      const newAccessToken = jwt.sign({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        sessionId: payload.sessionId,
        type: 'access'
      }, jwtConfig.secret, {
        expiresIn: '15m',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      // Generate new refresh token
      const newRefreshToken = jwt.sign({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        sessionId: payload.sessionId,
        type: 'refresh'
      }, jwtConfig.secret, {
        expiresIn: '7d',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      logger.info('Access token refreshed successfully:', { userId: user.id, sessionId: payload.sessionId });

      return {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60 // 15 minutes in seconds
      };
    } catch (error) {
      logger.error('Error refreshing access token:', error);
      throw error;
    }
  }

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