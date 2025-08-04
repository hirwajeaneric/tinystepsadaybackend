import { Router, RequestHandler } from 'express';
import { messageController } from '../controllers/messageController';
import { authenticateWithAutoRefresh, authorize } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimit';

const router = Router();

// Rate limiters
const contactFormLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many contact form submissions from this user, please try again later.',
  errorCode: 'CONTACT_FORM_RATE_LIMIT_EXCEEDED',
  skipSuccessfulRequests: false
});

// Public routes (no authentication required)
router.post(
  '/contact', 
  contactFormLimiter, 
  messageController.createContactMessage.bind(messageController) as RequestHandler
);

// Protected routes (authentication required)
router.use(authenticateWithAutoRefresh as RequestHandler);

// Contact Messages
router.get(
  '/messages', 
  authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, 
  messageController.getContactMessages.bind(messageController) as RequestHandler
);
router.get(
  '/messages/:id', 
  authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, 
  messageController.getContactMessageById.bind(messageController) as RequestHandler
);
router.put(
  '/messages/:id', 
  authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, 
  messageController.updateContactMessage.bind(messageController) as RequestHandler
);
router.delete(
  '/messages/:id', 
  authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, 
  messageController.deleteContactMessage.bind(messageController) as RequestHandler
);

// Bulk operations
router.post(
  '/messages/bulk/update', 
  authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, 
  messageController.bulkUpdateMessages.bind(messageController) as RequestHandler
);
router.post(
  '/messages/bulk/delete', 
  authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, 
  messageController.bulkDeleteMessages.bind(messageController) as RequestHandler
);

// Statistics
router.get(
  '/messages/stats', 
  authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, 
  messageController.getMessageStats.bind(messageController) as RequestHandler
);

// Message templates
router.post(
  '/templates', 
  authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR') as RequestHandler, 
  messageController.createMessageTemplate.bind(messageController) as RequestHandler
);
router.get(
  '/templates', 
  authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, 
  messageController.getMessageTemplates.bind(messageController) as RequestHandler
);
router.get(
  '/templates/:id', 
  authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, 
  messageController.getMessageTemplateById.bind(messageController) as RequestHandler
);
router.put(
  '/templates/:id', 
  authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR') as RequestHandler, 
  messageController.updateMessageTemplate.bind(messageController) as RequestHandler
);
router.delete(
  '/templates/:id', 
  authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, 
  messageController.deleteMessageTemplate.bind(messageController) as RequestHandler
);

export default router; 