import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthTokenPayload } from '../types';
import { AuthenticationError } from '../utils/errors';
import logger from '../utils/logger';

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = jwt.verify(token, process.env['JWT_SECRET'] as string) as AuthTokenPayload;
    req.user = decoded;
    
    logger.debug('User authenticated:', { userId: decoded.userId, email: decoded.email });
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = jwt.verify(token, process.env['JWT_SECRET'] as string) as AuthTokenPayload;
      req.user = decoded;
      logger.debug('User authenticated (optional):', { userId: decoded.userId, email: decoded.email });
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    logger.debug('Optional auth failed:', error);
    next();
  }
};

const extractToken = (req: AuthenticatedRequest): string | null => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  return null;
};

export const generateToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, process.env['JWT_SECRET'] as string);
};