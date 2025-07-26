import { z } from 'zod';

// Notification query parameters schema
export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'AUTH_VERIFICATION', 'PASSWORD_RESET', 'ACCOUNT_UPDATE']).optional(),
  isRead: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'isRead']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Mark notification as read schema
export const markNotificationReadSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required')
});

// Mark all notifications as read schema
export const markAllNotificationsReadSchema = z.object({
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'AUTH_VERIFICATION', 'PASSWORD_RESET', 'ACCOUNT_UPDATE']).optional()
});

// Delete notification schema
export const deleteNotificationSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required')
});

// Delete all notifications schema
export const deleteAllNotificationsSchema = z.object({
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'AUTH_VERIFICATION', 'PASSWORD_RESET', 'ACCOUNT_UPDATE']).optional(),
  isRead: z.coerce.boolean().optional()
});

// Validation helper types
export type NotificationQueryData = z.infer<typeof notificationQuerySchema>;
export type MarkNotificationReadData = z.infer<typeof markNotificationReadSchema>;
export type MarkAllNotificationsReadData = z.infer<typeof markAllNotificationsReadSchema>;
export type DeleteNotificationData = z.infer<typeof deleteNotificationSchema>;
export type DeleteAllNotificationsData = z.infer<typeof deleteAllNotificationsSchema>;
