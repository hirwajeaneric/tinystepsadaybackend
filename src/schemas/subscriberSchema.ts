import { z } from 'zod';

// Base subscriber schema
const subscriberSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  subscribingTo: z.enum(['FOOTER', 'MODAL', 'BOOK_PUBLISH']),
  item: z.object({
    name: z.string().min(1, 'Book name is required'),
    id: z.string().min(1, 'Book ID is required')
  }).optional()
});

// Create subscriber schema
export const createSubscriberSchema = subscriberSchema;

// Update subscriber schema
export const updateSubscriberSchema = z.object({
  email: subscriberSchema.shape.email.optional(),
  subscribingTo: subscriberSchema.shape.subscribingTo.optional(),
  item: subscriberSchema.shape.item.optional(),
  isActive: z.boolean().optional(),
});

// Query parameters schema for getting subscribers
export const getSubscribersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(100, 'Search term must be less than 100 characters').optional(),
  subscribingTo: z.enum(['FOOTER', 'MODAL', 'BOOK_PUBLISH', 'all']).optional(),
  isActive: z.string().transform(val => {
    if (val === 'all') return 'all';
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }).optional(),
  dateRange: z.enum(['all', 'today', 'week', 'month', 'quarter', 'year']).optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  sortBy: z.enum(['createdAt', 'updatedAt', 'email', 'subscribingTo']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Unsubscribe schema
export const unsubscribeSchema = z.object({
  email: subscriberSchema.shape.email,
  subscribingTo: subscriberSchema.shape.subscribingTo.optional(),
  unsubscribeReason: z.enum(['TOO_MANY_EMAILS', 'NOT_RELEVANT', 'SPAM', 'PRIVACY_CONCERNS', 'NO_LONGER_INTERESTED', 'OTHER']).optional(),
});

// Bulk operations schema
export const bulkSubscriberOperationSchema = z.object({
  subscriberIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')).min(1, 'At least one subscriber ID is required'),
  operation: z.enum(['activate', 'deactivate', 'delete']),
});

// Export types
export type CreateSubscriberData = z.infer<typeof createSubscriberSchema>;
export type UpdateSubscriberData = z.infer<typeof updateSubscriberSchema>;
export type GetSubscribersQueryData = z.infer<typeof getSubscribersQuerySchema>;
export type UnsubscribeData = z.infer<typeof unsubscribeSchema>;
export type BulkSubscriberOperationData = z.infer<typeof bulkSubscriberOperationSchema>; 