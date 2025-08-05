import { z } from 'zod';
import { MessageStatus, MessagePriority, MessageCategory, MessageSource } from '@prisma/client';

// Enum schemas
const messageStatusSchema = z.nativeEnum(MessageStatus);
const messagePrioritySchema = z.nativeEnum(MessagePriority);
const messageCategorySchema = z.nativeEnum(MessageCategory);
const messageSourceSchema = z.nativeEnum(MessageSource);

// Contact Message Schemas
export const createContactMessageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message must be less than 5000 characters'),
  category: messageCategorySchema.optional().default('GENERAL'),
  priority: messagePrioritySchema.optional().default('MEDIUM'),
  source: messageSourceSchema.optional().default('CONTACT_FORM'),
  tags: z.array(z.string().min(1).max(50)).optional().default([]),
  ipAddress: z.string().optional(),
  userAgent: z.string().max(500).optional(),
});

export const updateContactMessageSchema = z.object({
  status: messageStatusSchema.optional(),
  priority: messagePrioritySchema.optional(),
  category: messageCategorySchema.optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
});

export const contactMessageIdSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
});

// Message Reply Schemas
export const createMessageReplySchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
  content: z.string().min(1, 'Reply content is required').max(5000, 'Reply must be less than 5000 characters'),
  attachments: z.array(z.string().url('Invalid attachment URL')).optional().default([]),
});

export const messageReplyIdSchema = z.object({
  id: z.string().min(1, 'Reply ID is required'),
});

// Message Template Schemas
export const createMessageTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters').max(100, 'Template name must be less than 100 characters'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000, 'Content must be less than 10000 characters'),
  category: messageCategorySchema,
  isDefault: z.boolean().optional().default(false),
});

export const updateMessageTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters').max(100, 'Template name must be less than 100 characters').optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000, 'Content must be less than 10000 characters').optional(),
  category: messageCategorySchema.optional(),
  isDefault: z.boolean().optional(),
});

export const messageTemplateIdSchema = z.object({
  id: z.string().min(1, 'Template ID is required'),
});

// Filter and Search Schemas - Updated to handle query parameters correctly
export const messageFiltersSchema = z.object({
  status: z.string().transform(val => {
    if (val === 'all') return 'all';
    return val; // Keep original value for enum validation
  }).optional(),
  priority: z.string().transform(val => {
    if (val === 'all') return 'all';
    return val; // Keep original value for enum validation
  }).optional(),
  category: z.string().transform(val => {
    if (val === 'all') return 'all';
    return val; // Keep original value for enum validation
  }).optional(),
  source: z.string().transform(val => {
    if (val === 'all') return 'all';
    return val; // Keep original value for enum validation
  }).optional(),
  assignedTo: z.string().optional(),
  search: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status', 'priority', 'category', 'source']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const messageStatsSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Bulk Operations Schema
export const bulkUpdateMessagesSchema = z.object({
  messageIds: z.array(z.string().min(1)).min(1, 'At least one message ID is required'),
  updates: updateContactMessageSchema,
});

export const bulkDeleteMessagesSchema = z.object({
  messageIds: z.array(z.string().min(1)).min(1, 'At least one message ID is required'),
});

// Export types
export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
export type UpdateContactMessageInput = z.infer<typeof updateContactMessageSchema>;
export type CreateMessageReplyInput = z.infer<typeof createMessageReplySchema>;
export type CreateMessageTemplateInput = z.infer<typeof createMessageTemplateSchema>;
export type UpdateMessageTemplateInput = z.infer<typeof updateMessageTemplateSchema>;
export type MessageFiltersInput = z.infer<typeof messageFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type BulkUpdateMessagesInput = z.infer<typeof bulkUpdateMessagesSchema>;
export type BulkDeleteMessagesInput = z.infer<typeof bulkDeleteMessagesSchema>; 