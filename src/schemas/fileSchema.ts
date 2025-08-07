import { z } from 'zod';
import { FileType } from '@prisma/client';

// Base file schema
const fileSchema = z.object({
  url: z
    .string()
    .url('Invalid URL format')
    .max(2048, 'URL must be less than 2048 characters'),
  alt: z
    .string()
    .max(255, 'Alt text must be less than 255 characters')
    .optional(),
  type: z.nativeEnum(FileType),
  caption: z
    .string()
    .max(500, 'Caption must be less than 500 characters')
    .optional(),
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename must be less than 255 characters'),
  originalName: z
    .string()
    .min(1, 'Original name is required')
    .max(255, 'Original name must be less than 255 characters'),
  mimeType: z
    .string()
    .min(1, 'MIME type is required')
    .max(100, 'MIME type must be less than 100 characters'),
  size: z
    .number()
    .int()
    .positive('File size must be positive')
    .max(100 * 1024 * 1024, 'File size must be less than 100MB'), // 100MB limit
  width: z
    .number()
    .int()
    .positive('Width must be positive')
    .optional(),
  height: z
    .number()
    .int()
    .positive('Height must be positive')
    .optional(),
  duration: z
    .number()
    .int()
    .positive('Duration must be positive')
    .optional(),
  isPublic: z
    .boolean()
    .default(true),
  tags: z
    .array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(20, 'Maximum 20 tags allowed')
    .default([]),
  metadata: z
    .record(z.string(), z.any())
    .optional(),
});

// Create file schema
export const createFileSchema = fileSchema;

// Update file schema (only updatable fields)
export const updateFileSchema = z.object({
  alt: fileSchema.shape.alt.optional(),
  caption: fileSchema.shape.caption.optional(),
  isPublic: fileSchema.shape.isPublic.optional(),
  tags: fileSchema.shape.tags.optional(),
  metadata: fileSchema.shape.metadata.optional(),
});

// Query parameters schema for getting files
export const getFilesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(100, 'Search term must be less than 100 characters').optional(),
  type: z.union([
    z.nativeEnum(FileType),
    z.literal('all')
  ]).optional(),
  uploadedBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format').optional(),
  isPublic: z.string().transform(val => {
    if (val === 'all') return 'all';
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }).optional(),
  tags: z.string().transform(val => val ? val.split(',').map(tag => tag.trim()) : []).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'filename', 'size', 'originalName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// MongoDB ObjectId schema for files
export const fileObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Bulk file operations schema
export const bulkFileOperationSchema = z.object({
  fileIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')).min(1, 'At least one file ID is required'),
  operation: z.enum(['delete', 'makePublic', 'makePrivate', 'addTags', 'removeTags']),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
});

// File upload schema (for direct uploads)
export const fileUploadSchema = z.object({
  originalName: z.string().min(1, 'Original name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().int().positive('File size must be positive'),
  type: z.nativeEnum(FileType),
  alt: z.string().max(255).optional(),
  caption: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string().max(50)).max(20).default([]),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Export types
export type CreateFileData = z.infer<typeof createFileSchema>;
export type UpdateFileData = z.infer<typeof updateFileSchema>;
export type GetFilesQueryData = z.infer<typeof getFilesQuerySchema>;
export type BulkFileOperationData = z.infer<typeof bulkFileOperationSchema>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;
