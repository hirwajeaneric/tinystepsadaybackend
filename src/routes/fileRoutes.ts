import { Router, RequestHandler } from 'express';
import { z } from 'zod';
import fileController from '../controllers/fileController';
import {
  authenticateWithAutoRefresh,
  requireAdmin,
  requireModerator
} from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createFileSchema,
  updateFileSchema,
  getFilesQuerySchema,
  fileObjectIdSchema,
  bulkFileOperationSchema,
  fileUploadSchema
} from '../schemas/fileSchema';
import {
  fileRateLimiter,
  fileUploadRateLimiter,
  fileSearchRateLimiter
} from '../middleware/rateLimit';

const router = Router();

// Apply authentication to all file routes
router.use(authenticateWithAutoRefresh as RequestHandler);

// File CRUD operations
router.post(
  '/',
  fileRateLimiter,
  validate({ body: createFileSchema }),
  fileController.createFile as RequestHandler
);

router.get(
  '/',
  fileRateLimiter,
  validate({ query: getFilesQuerySchema }),
  fileController.getFiles as RequestHandler
);

router.get(
  '/statistics',
  fileRateLimiter,
  fileController.getFileStatistics as RequestHandler
);

router.get(
  '/search',
  fileSearchRateLimiter,
  fileController.searchFiles as RequestHandler
);

router.get(
  '/my-files',
  fileRateLimiter,
  fileController.getMyFiles as RequestHandler
);

router.get(
  '/type/:type',
  fileRateLimiter,
  fileController.getFilesByType as RequestHandler
);

router.get(
  '/mime-type/:mimeType',
  fileRateLimiter,
  fileController.getFilesByMimeType as RequestHandler
);

router.get(
  '/size-range',
  fileRateLimiter,
  fileController.getFilesBySizeRange as RequestHandler
);

router.get(
  '/date-range',
  fileRateLimiter,
  fileController.getFilesByDateRange as RequestHandler
);

router.get(
  '/tags',
  fileRateLimiter,
  fileController.getFilesByTags as RequestHandler
);

router.get(
  '/:id',
  fileRateLimiter,
  validate({ params: z.object({ id: fileObjectIdSchema }) }),
  fileController.getFileById as RequestHandler
);

router.put(
  '/:id',
  fileRateLimiter,
  validate({ 
    params: z.object({ id: fileObjectIdSchema }),
    body: updateFileSchema 
  }),
  fileController.updateFile as RequestHandler
);

router.delete(
  '/:id',
  fileRateLimiter,
  validate({ params: z.object({ id: fileObjectIdSchema }) }),
  fileController.deleteFile as RequestHandler
);

// Bulk operations (admin/moderator only)
router.post(
  '/bulk',
  fileRateLimiter,
  requireModerator as RequestHandler,
  validate({ body: bulkFileOperationSchema }),
  fileController.bulkFileOperation as RequestHandler
);

// Upload URL generation (for direct cloud storage uploads)
router.post(
  '/upload-url',
  fileUploadRateLimiter,
  validate({ body: fileUploadSchema }),
  fileController.getUploadUrl as RequestHandler
);

// Admin-only routes
router.get(
  '/user/:userId',
  fileRateLimiter,
  requireAdmin as RequestHandler,
  validate({ params: z.object({ userId: fileObjectIdSchema }) }),
  fileController.getFilesByUser as RequestHandler
);

export default router;
