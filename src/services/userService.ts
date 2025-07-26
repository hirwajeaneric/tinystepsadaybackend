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
import { GetUsersQueryData, EmailVerificationData, ResendVerificationData } from '../schemas/userSchema';
import logger from '../utils/logger';
import { generateAndSendVerificationCode } from './mail.service';

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
        await generateAndSendVerificationCode(
          user.email,
          userName,
          `${process.env['FRONTEND_URL']}/verify-email?email=${user.email}`,
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
      const { page, limit, search, isActive } = query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      // Get users and total count
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

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

      // Generate a secure refresh token
      const { CryptoUtils } = await import('../utils/security');
      const refreshToken = CryptoUtils.randomString(64);

      // Update last login and create a new session
      const [, session] = await Promise.all([
        this.prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        }),
        this.prisma.userSession.create({
          data: {
            userId: user.id,
            refreshToken: refreshToken,
            deviceInfo: userDeviceInfo || null,
            ipAddress: userIpAddress,
            userAgent: userAgent || null,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        })
      ]);

      // Generate token
      const { TokenUtils } = await import('../utils/security');
      const { jwtConfig } = await import('../config/security');
      const token = TokenUtils.generateToken({
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

      logger.info('User authenticated successfully:', { userId: user.id, email: user.email });
      
      return {
        user: this.toUserResponse(user),
        token,
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
      await generateAndSendVerificationCode(
        user.email,
        userName,
        `${process.env['FRONTEND_URL']}/verify-email?email=${user.email}`,
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