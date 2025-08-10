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
 * Role hierarchy - higher roles inherit permissions from lower roles
 */
const ROLE_HIERARCHY = {
  USER: 1,
  MODERATOR: 2,
  INSTRUCTOR: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5
} as const;

/**
 * Check if a user's role has sufficient permissions
 */
const hasRolePermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Enhanced role-based authorization middleware
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

    // Check if user has any of the required roles
    const hasPermission = roles.some(role => hasRolePermission(req.user!.role, role));

    if (!hasPermission) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.url,
        method: req.method,
        ip: req.ip
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
 * Super Admin only authorization middleware
 */
export const requireSuperAdmin = authorize(UserRole.SUPER_ADMIN);

/**
 * Admin or Super Admin authorization middleware
 */
export const requireAdmin = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/**
 * Instructor, Admin, or Super Admin authorization middleware
 */
export const requireInstructor = authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN);

/**
 * Moderator, Instructor, Admin, or Super Admin authorization middleware
 */
export const requireModerator = authorize(UserRole.MODERATOR, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN);

/**
 * Enhanced self or admin authorization middleware
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

    // Super Admin and Admin can access any user's data
    if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.ADMIN) {
      return next();
    }

    // User can only access their own data
    if (req.user.userId === targetUserId) {
      return next();
    }

    logger.warn('Unauthorized access attempt to user data', {
      userId: req.user.userId,
      targetUserId,
      userRole: req.user.role,
      url: req.url,
      method: req.method,
      ip: req.ip
    });

    res.status(403).json({
      success: false,
      error: 'INSUFFICIENT_PERMISSIONS',
      message: 'You can only access your own data'
    });
  };
};

/**
 * Resource ownership authorization middleware
 */
export const requireResourceOwnership = (resourceType: string, idParam: string = 'id') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required'
      });
      return;
    }

    const resourceId = req.params[idParam];

    if (!resourceId) {
      res.status(400).json({
        success: false,
        error: 'MISSING_RESOURCE_ID',
        message: `${resourceType} ID is required`
      });
      return;
    }

    // Super Admin and Admin can access any resource
    if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.ADMIN) {
      return next();
    }

    try {
      // Check if the resource belongs to the user
      // Note: This is a generic approach and may need to be customized for specific resources
      const resource = await (database.prisma as any)[resourceType].findUnique({
        where: { id: resourceId },
        select: { userId: true }
      });

      if (!resource) {
        res.status(404).json({
          success: false,
          error: 'RESOURCE_NOT_FOUND',
          message: `${resourceType} not found`
        });
        return;
      }

      if (resource.userId !== req.user.userId) {
        logger.warn('Unauthorized access attempt to resource', {
          userId: req.user.userId,
          resourceId,
          resourceType,
          url: req.url,
          method: req.method,
          ip: req.ip
        });

        res.status(403).json({
          success: false,
          error: 'INSUFFICIENT_PERMISSIONS',
          message: `You can only access your own ${resourceType}`
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error checking resource ownership:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Error checking resource ownership'
      });
    }
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

/**
 * Enhanced authentication middleware with automatic token refresh
 * This middleware will automatically refresh expired access tokens if the refresh token is still valid
 */
export const authenticateWithAutoRefresh = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AuthenticationError('No token provided', 'TOKEN_MISSING');
    }

    try {
      // Try to verify the access token
      const payload = verifyToken(token);
      
      // Verify session is still valid
      const isSessionValid = await verifySession(payload.sessionId);
      if (!isSessionValid) {
        throw new AuthenticationError('Session expired or invalid', 'SESSION_EXPIRED');
      }

      // Token is valid, attach user info to request
      req.user = payload;
      req.sessionId = payload.sessionId;
      
      next();
      return;
    } catch (tokenError) {
      // If token is expired, try to refresh it
      if (tokenError instanceof TokenError && tokenError.code === 'TOKEN_EXPIRED') {
        const refreshToken = req.headers['x-refresh-token'] as string;
        
        if (!refreshToken) {
          throw new AuthenticationError('Access token expired and no refresh token provided', 'TOKEN_EXPIRED');
        }

        try {
          // Verify refresh token
          const refreshPayload = jwt.verify(refreshToken, jwtConfig.secret, {
            algorithms: ['HS256'],
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
          }) as TokenPayload;

          if (refreshPayload.type !== 'refresh') {
            throw new AuthenticationError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
          }

          // Verify session is still valid
          const isSessionValid = await verifySession(refreshPayload.sessionId);
          if (!isSessionValid) {
            throw new AuthenticationError('Session expired or invalid', 'SESSION_EXPIRED');
          }

          // Generate new tokens
          const newTokens = generateTokens({
            userId: refreshPayload.userId,
            email: refreshPayload.email,
            username: refreshPayload.username,
            role: refreshPayload.role,
            sessionId: refreshPayload.sessionId
          });

          // Attach new tokens to response headers
          res.setHeader('X-New-Access-Token', newTokens.accessToken);
          res.setHeader('X-New-Refresh-Token', newTokens.refreshToken);
          res.setHeader('X-Token-Expires-In', newTokens.expiresIn.toString());

          // Attach user info to request
          req.user = {
            userId: refreshPayload.userId,
            email: refreshPayload.email,
            username: refreshPayload.username,
            role: refreshPayload.role,
            sessionId: refreshPayload.sessionId
          };
          req.sessionId = refreshPayload.sessionId;

          logger.info('Token automatically refreshed for user:', { 
            userId: refreshPayload.userId, 
            sessionId: refreshPayload.sessionId 
          });

          next();
          return;
        } catch (refreshError) {
          logger.error('Token refresh failed:', refreshError);
          throw new AuthenticationError('Token refresh failed', 'REFRESH_FAILED');
        }
      }

      // If it's not a token expiration error, re-throw it
      throw tokenError;
    }
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
 * Standard authentication middleware (existing implementation)
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