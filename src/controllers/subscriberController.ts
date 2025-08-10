import { Request, Response } from 'express';
import subscriberService from '../services/subscriberService';
import { AuthenticatedRequest } from '../types';
import { 
  CreateSubscriberData, 
  UpdateSubscriberData, 
  GetSubscribersQueryData,
  UnsubscribeData
} from '../schemas/subscriberSchema';

class SubscriberController {
  /**
   * Create a new subscriber (public endpoint)
   */
  async createSubscriber(req: Request, res: Response): Promise<void> {
    try {
      const subscriberData = req.body as CreateSubscriberData;
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const result = await subscriberService.createSubscriber(subscriberData, ipAddress, userAgent);

      res.status(201).json({
        success: true,
        message: 'Successfully subscribed to newsletter',
        data: {
          id: result.id,
          email: result.email,
          subscribingTo: result.subscribingTo,
          isActive: result.isActive
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to subscribe to newsletter'
      });
    }
  }

  /**
   * Get all subscribers (admin only)
   */
  async getSubscribers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query = (req as any).validatedQuery || req.query as unknown as GetSubscribersQueryData;
      const result = await subscriberService.getSubscribers(query);

      res.status(200).json({
        success: true,
        message: 'Subscribers retrieved successfully',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve subscribers'
      });
    }
  }

  /**
   * Get subscriber by ID (admin only)
   */
  async getSubscriberById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'MISSING_ID',
          message: 'Subscriber ID is required'
        });
        return;
      }
      const subscriber = await subscriberService.getSubscriberById(id);

      if (!subscriber) {
        res.status(404).json({
          success: false,
          error: 'SUBSCRIBER_NOT_FOUND',
          message: 'Subscriber not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Subscriber retrieved successfully',
        data: subscriber
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve subscriber'
      });
    }
  }

  /**
   * Update subscriber (admin only)
   */
  async updateSubscriber(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'MISSING_ID',
          message: 'Subscriber ID is required'
        });
        return;
      }
      const updateData = req.body as UpdateSubscriberData;

      const result = await subscriberService.updateSubscriber(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Subscriber updated successfully',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update subscriber'
      });
    }
  }

  /**
   * Delete subscriber (admin only)
   */
  async deleteSubscriber(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'MISSING_ID',
          message: 'Subscriber ID is required'
        });
        return;
      }
      await subscriberService.deleteSubscriber(id);

      res.status(200).json({
        success: true,
        message: 'Subscriber deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete subscriber'
      });
    }
  }

  /**
   * Unsubscribe a subscriber (public endpoint)
   */
  async unsubscribeSubscriber(req: Request, res: Response): Promise<void> {
    try {
      const unsubscribeData = req.body as UnsubscribeData;
      const result = await subscriberService.unsubscribeSubscriber(unsubscribeData);

      res.status(200).json({
        success: true,
        message: 'Successfully unsubscribed from newsletter',
        data: {
          id: result.id,
          email: result.email,
          isActive: result.isActive,
          unsubscribedAt: result.unsubscribedAt
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to unsubscribe from newsletter'
      });
    }
  }

  /**
   * Get subscriber statistics (admin only)
   */
  async getSubscriberStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await subscriberService.getSubscriberStats();

      res.status(200).json({
        success: true,
        message: 'Subscriber statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve subscriber statistics'
      });
    }
  }

  /**
   * Check if email is subscribed (public endpoint)
   */
  async checkSubscriptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      if (!email) {
        res.status(400).json({
          success: false,
          error: 'MISSING_EMAIL',
          message: 'Email is required'
        });
        return;
      }
      const subscriber = await subscriberService.getSubscriberByEmail(email);

      if (!subscriber) {
        res.status(200).json({
          success: true,
          message: 'Email not subscribed',
          data: {
            isSubscribed: false,
            email
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Subscription status retrieved successfully',
        data: {
          isSubscribed: subscriber.isActive,
          email: subscriber.email,
          subscribingTo: subscriber.subscribingTo,
          isActive: subscriber.isActive,
          subscribedAt: subscriber.createdAt
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check subscription status'
      });
    }
  }

  /**
   * Resubscribe a subscriber (admin only)
   */
  async resubscribeSubscriber(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      if (!email) {
        res.status(400).json({
          success: false,
          error: 'MISSING_EMAIL',
          message: 'Email is required'
        });
        return;
      }
      const result = await subscriberService.resubscribeSubscriber(email);

      res.status(200).json({
        success: true,
        message: 'Subscriber resubscribed successfully',
        data: result
      });
    } catch (error: any) {
      if (error.message === 'Subscriber not found') {
        res.status(404).json({
          success: false,
          error: 'SUBSCRIBER_NOT_FOUND',
          message: 'Subscriber not found'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to resubscribe subscriber'
      });
    }
  }

  /**
   * Bulk operations on subscribers (admin only)
   */
  async bulkSubscriberOperation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { subscriberIds, operation } = req.body;
      const result = await subscriberService.bulkSubscriberOperation({ subscriberIds, operation });

      res.status(200).json({
        success: true,
        message: 'Bulk operation completed successfully',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to perform bulk operation'
      });
    }
  }

  /**
   * Export subscribers (admin only)
   */
  async exportSubscribers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { subscribingTo } = req.query;
      const subscribers = await subscriberService.exportSubscribers(subscribingTo as any);

      res.status(200).json({
        success: true,
        message: 'Subscribers exported successfully',
        data: subscribers
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to export subscribers'
      });
    }
  }
}

export default new SubscriberController(); 