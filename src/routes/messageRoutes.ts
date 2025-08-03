import { Router, RequestHandler } from 'express';
import { messageController } from '../controllers/messageController';
import { authenticate, authorize } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rateLimit';

const router = Router();

// Rate limiting for contact form submissions
const contactFormLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many contact form submissions from this IP, please try again later.',
  errorCode: 'CONTACT_FORM_RATE_LIMIT_EXCEEDED',
  skipSuccessfulRequests: false,
});

// Public routes (no authentication required)
router.post('/contact', contactFormLimiter, messageController.createContactMessage.bind(messageController));

// Contact Messages - Management routes (Protected)
router.get('/messages', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, messageController.getContactMessages.bind(messageController) as RequestHandler);
router.get('/messages/stats', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, messageController.getMessageStats.bind(messageController) as RequestHandler);
router.get('/messages/:id', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, messageController.getContactMessageById.bind(messageController) as RequestHandler);
router.put('/messages/:id', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, messageController.updateContactMessage.bind(messageController) as RequestHandler);
router.delete('/messages/:id', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, messageController.deleteContactMessage.bind(messageController) as RequestHandler);

// Bulk operations (Protected)
router.put('/messages/bulk/update', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, messageController.bulkUpdateMessages.bind(messageController) as RequestHandler);
router.delete('/messages/bulk/delete', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, messageController.bulkDeleteMessages.bind(messageController) as RequestHandler);

// Message Templates - Management routes (Protected)
router.get('/templates', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, messageController.getMessageTemplates.bind(messageController) as RequestHandler);
router.get('/templates/:id', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'MODERATOR') as RequestHandler, messageController.getMessageTemplateById.bind(messageController) as RequestHandler);
router.post('/templates', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR') as RequestHandler, messageController.createMessageTemplate.bind(messageController) as RequestHandler);
router.put('/templates/:id', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR') as RequestHandler, messageController.updateMessageTemplate.bind(messageController) as RequestHandler);
router.delete('/templates/:id', authenticate as RequestHandler, authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, messageController.deleteMessageTemplate.bind(messageController) as RequestHandler);

export default router; 