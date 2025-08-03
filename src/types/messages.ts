import { MessageStatus, MessagePriority, MessageCategory, MessageSource, ReplySender } from '@prisma/client';

// Base types
export interface BaseMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  priority: MessagePriority;
  category: MessageCategory;
  source: MessageSource;
  tags: string[];
  ipAddress: string | null;
  userAgent: string | null;
  readAt: Date | null;
  repliedAt: Date | null;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessage extends BaseMessage {
  replies: MessageReply[];
  assignedUser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

export interface MessageReply {
  id: string;
  messageId: string;
  content: string;
  sentBy: ReplySender;
  sentByUser: string | null;
  attachments: string[];
  createdAt: Date;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: MessageCategory;
  isDefault: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdByUser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

// Request/Response types
export interface CreateContactMessageRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: MessageCategory;
  priority?: MessagePriority;
  source?: MessageSource;
  tags?: string[];
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateContactMessageRequest {
  status?: MessageStatus;
  priority?: MessagePriority;
  category?: MessageCategory;
  assignedTo?: string;
  tags?: string[];
}

export interface CreateMessageReplyRequest {
  messageId: string;
  content: string;
  attachments?: string[];
}

export interface CreateMessageTemplateRequest {
  name: string;
  subject: string;
  content: string;
  category: MessageCategory;
  isDefault?: boolean;
}

export interface UpdateMessageTemplateRequest {
  name?: string;
  subject?: string;
  content?: string;
  category?: MessageCategory;
  isDefault?: boolean;
}

// Filter and search types
export interface MessageFilters {
  status?: MessageStatus | string;
  priority?: MessagePriority | string;
  category?: MessageCategory | string;
  source?: MessageSource | string;
  assignedTo?: string;
  search?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface MessageStats {
  total: number;
  unread: number;
  urgent: number;
  replied: number;
  byCategory: Record<MessageCategory, number>;
  byPriority: Record<MessagePriority, number>;
  byStatus: Record<MessageStatus, number>;
}

// API Response types
export interface MessagesResponse {
  success: boolean;
  message: string;
  data?: {
    messages: ContactMessage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
  data?: ContactMessage;
  error?: string;
}

export interface MessageRepliesResponse {
  success: boolean;
  message: string;
  data?: MessageReply[];
  error?: string;
}

export interface MessageReplyResponse {
  success: boolean;
  message: string;
  data?: MessageReply;
  error?: string;
}

export interface MessageTemplatesResponse {
  success: boolean;
  message: string;
  data?: MessageTemplate[];
  error?: string;
}

export interface MessageTemplateResponse {
  success: boolean;
  message: string;
  data?: MessageTemplate;
  error?: string;
}

export interface MessageStatsResponse {
  success: boolean;
  message: string;
  data?: MessageStats;
  error?: string;
}

// Email notification types
export interface MessageNotificationData {
  messageId: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  category: MessageCategory;
  priority: MessagePriority;
  managementUrl: string;
}

export interface MessageReplyNotificationData {
  messageId: string;
  replyId: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  replyContent: string;
  originalMessage: string;
} 