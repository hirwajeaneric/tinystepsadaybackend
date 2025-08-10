import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodIssue } from 'zod';
import logger from '../utils/logger';
import { ParamsDictionary } from 'express-serve-static-core';
import {
  notificationQuerySchema,
  markNotificationReadSchema,
  markAllNotificationsReadSchema,
  deleteNotificationSchema,
  deleteAllNotificationsSchema
} from '../schemas/notificationSchema';
import {
  deactivateAccountSchema,
  reactivateAccountSchema,
  deleteAccountSchema
} from '../schemas/accountSchema';

// Validation schema configuration
interface ValidationConfig {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

// Generic validation middleware factory
export const validate = (config: ValidationConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (config.body && req.body && Object.keys(req.body).length > 0) {
        req.body = config.body.parse(req.body);
      }

      // Validate query parameters
      if (config.query && req.query && Object.keys(req.query).length > 0) {
        const validatedQuery = config.query.parse(req.query);
        // Store validated query in a custom property instead of overwriting req.query
        (req as any).validatedQuery = validatedQuery;
      }

      // Validate URL parameters
      if (config.params && req.params && Object.keys(req.params).length > 0) {
        req.params = config.params.parse(req.params) as ParamsDictionary;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input
        }));

        logger.warn('Validation error', {
          errors: validationErrors,
          url: req.url,
          method: req.method,
          ip: req.ip
        });

        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: validationErrors
        });
      } else {
        logger.error('Unexpected validation error:', error);
        res.status(500).json({
          success: false,
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Validation error occurred'
        });
      }
    }
  };
};

// Specific validation middlewares for notifications and account management
export const validateNotificationQuery = validate({ query: notificationQuerySchema });
export const validateMarkNotificationRead = validate({ body: markNotificationReadSchema });
export const validateMarkAllNotificationsRead = validate({ body: markAllNotificationsReadSchema });
export const validateDeleteNotification = validate({ body: deleteNotificationSchema });
export const validateDeleteAllNotifications = validate({ body: deleteAllNotificationsSchema });
export const validateDeactivateAccount = validate({ body: deactivateAccountSchema });
export const validateReactivateAccount = validate({ body: reactivateAccountSchema });
export const validateDeleteAccount = validate({ body: deleteAccountSchema });