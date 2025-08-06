import { Router, RequestHandler } from 'express';
import subscriberController from '../controllers/subscriberController';
import { authenticateWithAutoRefresh, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createSubscriberSchema,
  updateSubscriberSchema,
  getSubscribersQuerySchema,
  unsubscribeSchema,
  bulkSubscriberOperationSchema
} from '../schemas/subscriberSchema';

const router = Router();

// Public routes (no authentication required)
router.post('/subscribe', validate({ body: createSubscriberSchema }), subscriberController.createSubscriber as RequestHandler);
router.post('/unsubscribe', validate({ body: unsubscribeSchema }), subscriberController.unsubscribeSubscriber as RequestHandler);
router.get('/check/:email', subscriberController.checkSubscriptionStatus as RequestHandler);

// Admin routes (authentication and admin role required)
router.get('/', 
  authenticateWithAutoRefresh as RequestHandler, 
  authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, 
  validate({ query: getSubscribersQuerySchema }), 
  subscriberController.getSubscribers as RequestHandler
);

router.get('/stats', 
  authenticateWithAutoRefresh as RequestHandler, 
  authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, 
  subscriberController.getSubscriberStats as RequestHandler
);

router.get('/:id', 
  authenticateWithAutoRefresh as RequestHandler, 
  authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, 
  subscriberController.getSubscriberById as RequestHandler
);

router.put('/:id', 
  authenticateWithAutoRefresh as RequestHandler, 
  authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, 
  validate({ body: updateSubscriberSchema }), 
  subscriberController.updateSubscriber as RequestHandler
);

router.delete('/:id', 
  authenticateWithAutoRefresh as RequestHandler, 
  authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, 
  subscriberController.deleteSubscriber as RequestHandler
);

router.post('/resubscribe/:email', 
  authenticateWithAutoRefresh as RequestHandler, 
  authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, 
  subscriberController.resubscribeSubscriber as RequestHandler
);

router.post('/bulk', 
  authenticateWithAutoRefresh as RequestHandler, 
  authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, 
  validate({ body: bulkSubscriberOperationSchema }), 
  subscriberController.bulkSubscriberOperation as RequestHandler
);

router.get('/export', 
  authenticateWithAutoRefresh as RequestHandler, 
  authorize('ADMIN', 'SUPER_ADMIN') as RequestHandler, 
  subscriberController.exportSubscribers as RequestHandler
);

export default router; 