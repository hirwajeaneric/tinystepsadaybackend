import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { jwtConfig } from '../config/security';
import {
  AuthenticatedRequest,
  AccessTokenPayload,
  TokenPayload
} from '../types/auth';
import {
  AuthenticationError,
  TokenError
} from '../utils/errors';
import logger from '../utils/logger';
import database from '../utils/database';

/**
 * Extract token from Authorization header
 */
const extractToken = (req: Request): string | undefined | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Verify JWT token and extract payload
 */
const verifyToken = (token: string): AccessTokenPayload => {
  try {
    const payload = jwt.verify(token, jwtConfig.secret) as TokenPayload;

    // Verify token type
    if (payload.type !== 'access') {
      throw new TokenError('Invalid token type', 'TOKEN_INVALID');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role,
      sessionId: payload.sessionId
    };
  } catch (error) {
    if (error instanceof TokenError) {
      throw error;
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenError('Token expired', 'TOKEN_EXPIRED');
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new TokenError('Invalid token', 'TOKEN_INVALID');
    }

    throw new TokenError('Token verification failed', 'TOKEN_INVALID');
  }
};

/**
 * Verify session is still valid
 */
const verifySession = async (sessionId: string): Promise<boolean> => {
  try {
    const session = await database.prisma.userSession.findUnique({
      where: { id: sessionId },
      select: { isActive: true, expiresAt: true }
    });

    if (!session) {
      return false;
    }

    if (!session.isActive) {
      return false;
    }

    if (new Date() > session.expiresAt) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error verifying session:', error);
    return false;
  }
};

/**
 * Main authentication middleware
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AuthenticationError('No token provided', 'TOKEN_MISSING');
    }

    const payload = verifyToken(token);

    // Verify session is still valid
    const isSessionValid = await verifySession(payload.sessionId);
    if (!isSessionValid) {
      throw new AuthenticationError('Session expired or invalid', 'SESSION_EXPIRED');
    }

    // Attach user info to request
    req.user = payload;
    req.sessionId = payload.sessionId;

    next();
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof TokenError) {
      res.status(401).json({
        success: false,
        error: error.code || 'AUTHENTICATION_ERROR',
        message: error.message
      });
    } else {
      logger.error('Authentication middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication failed'
      });
    }
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    const payload = verifyToken(token);

    // Verify session is still valid
    const isSessionValid = await verifySession(payload.sessionId);
    if (!isSessionValid) {
      return next();
    }

    // Attach user info to request
    req.user = payload;
    req.sessionId = payload.sessionId;

    next();
  } catch (error) {
    // For optional auth, we just continue without user info
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.url,
        method: req.method
      });

      res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions to access this resource'
      });
      return;
    }

    next();
  };
};

/**
 * Admin-only authorization middleware
 */
export const requireAdmin = authorize(UserRole.ADMIN);

/**
 * Instructor or Admin authorization middleware
 */
export const requireInstructor = authorize(UserRole.INSTRUCTOR, UserRole.ADMIN);

/**
 * Moderator or Admin authorization middleware
 */
export const requireModerator = authorize(UserRole.MODERATOR, UserRole.ADMIN);

/**
 * Self or Admin authorization middleware (user can access their own data or admin can access any)
 */
export const requireSelfOrAdmin = (paramName: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required'
      });
      return;
    }

    const targetUserId = req.params[paramName] || req.body[paramName];

    if (!targetUserId) {
      res.status(400).json({
        success: false,
        error: 'MISSING_USER_ID',
        message: 'User ID is required'
      });
      return;
    }

    // Admin can access any user's data
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // User can only access their own data
    if (req.user.userId === targetUserId) {
      return next();
    }

    logger.warn('Unauthorized access attempt to user data', {
      userId: req.user.userId,
      targetUserId,
      url: req.url,
      method: req.method
    });

    res.status(403).json({
      success: false,
      error: 'INSUFFICIENT_PERMISSIONS',
      message: 'You can only access your own data'
    });
  };
};

/**
 * Verify email verification middleware
 */
export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'Authentication required'
    });
    return;
  }

  // Check if user's email is verified
  database.prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { isEmailVerified: true }
  }).then(user => {
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({
        success: false,
        error: 'EMAIL_NOT_VERIFIED',
        message: 'Email verification required'
      });
      return;
    }

    next();
  }).catch(error => {
    logger.error('Error checking email verification:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Error checking email verification status'
    });
  });
};

/**
 * Two-factor authentication middleware
 */
export const requireTwoFactor = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'Authentication required'
    });
    return;
  }

  // Check if user has 2FA enabled
  database.prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { twoFactorEnabled: true }
  }).then(user => {
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
      return;
    }

    if (user.twoFactorEnabled) {
      // Check if 2FA code is provided in request
      const twoFactorCode = req.headers['x-2fa-code'] || req.body.twoFactorCode;

      if (!twoFactorCode) {
        res.status(403).json({
          success: false,
          error: 'TWO_FACTOR_REQUIRED',
          message: 'Two-factor authentication code required'
        });
        return;
      }

      // TODO: Implement 2FA verification logic
      // For now, we'll just continue
    }

    next();
  }).catch(error => {
    logger.error('Error checking two-factor authentication:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Error checking two-factor authentication status'
    });
  });
};

/**
 * Generate JWT tokens
 */
export const generateTokens = (payload: Omit<TokenPayload, 'type'>) => {
  const accessTokenPayload: TokenPayload = {
    ...payload,
    type: 'access'
  };

  const refreshTokenPayload: TokenPayload = {
    ...payload,
    type: 'refresh'
  };

  const accessToken = jwt.sign(accessTokenPayload, jwtConfig.secret, {
    algorithm: 'HS256',
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    expiresIn: '15m' // Short-lived access token
  });

  const refreshToken = jwt.sign(refreshTokenPayload, jwtConfig.secret, {
    algorithm: 'HS256',
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    expiresIn: '7d' // Long-lived refresh token
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 // 15 minutes in seconds
  };
};

/**
 * Refresh token middleware
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'REFRESH_TOKEN_MISSING',
        message: 'Refresh token is required'
      });
      return;
    }

    // Verify refresh token
    const payload = jwt.verify(token, jwtConfig.secret, {
      algorithms: ['HS256'],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }) as TokenPayload;

    if (payload.type !== 'refresh') {
      res.status(401).json({
        success: false,
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token'
      });
      return;
    }

    // Verify session is still valid
    const isSessionValid = await verifySession(payload.sessionId);
    if (!isSessionValid) {
      res.status(401).json({
        success: false,
        error: 'SESSION_EXPIRED',
        message: 'Session expired'
      });
      return;
    }

    // Generate new tokens
    const newTokens = generateTokens({
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role,
      sessionId: payload.sessionId
    });

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: newTokens
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'REFRESH_TOKEN_EXPIRED',
        message: 'Refresh token expired'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token'
      });
    } else {
      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error refreshing tokens'
      });
    }
  }
};