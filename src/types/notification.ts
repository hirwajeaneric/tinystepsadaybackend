import { NotificationType } from '@prisma/client';

// Notification Types
export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, any>;
}

export interface NotificationQueryFilters {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  sortBy?: 'createdAt' | 'isRead';
  sortOrder?: 'asc' | 'desc';
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

export interface MarkNotificationReadRequest {
  notificationId: string;
}

export interface MarkAllNotificationsReadRequest {
  type?: NotificationType;
}

export interface DeleteNotificationRequest {
  notificationId: string;
}

export interface DeleteAllNotificationsRequest {
  type?: NotificationType;
  isRead?: boolean;
}

// Notification Templates
export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface NotificationTemplateData {
  [key: string]: string | number | boolean | Date;
} 