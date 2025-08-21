import { PrismaClient, Subscriber, SubscribeType } from '@prisma/client';
import { 
  CreateSubscriberData, 
  UpdateSubscriberData, 
  GetSubscribersQueryData,
  UnsubscribeData,
  BulkSubscriberOperationData
} from '../schemas/subscriberSchema';
import { sendWelcomeNewsletterEmail, sendUnsubscribeConfirmationEmail } from './emailServices/newsletterEmailService';
import { sendUnsubscribeNotificationToAdmins, getAdminEmails } from './emailServices/adminNotificationEmailService';
import logger from '../utils/logger';

const prisma = new PrismaClient();

class SubscriberService {
  /**
   * Create a new subscriber
   */
  async createSubscriber(data: CreateSubscriberData, ipAddress?: string, userAgent?: string): Promise<Subscriber> {
    try {
      // Check if subscriber already exists
      const existingSubscriber = await prisma.subscriber.findUnique({
        where: { email: data.email }
      });

      if (existingSubscriber) {
        // If subscriber exists but is inactive, reactivate them
        if (!existingSubscriber.isActive) {
          return await prisma.subscriber.update({
            where: { id: existingSubscriber.id },
            data: {
              isActive: true,
              subscribingTo: data.subscribingTo,
              itemName: data.item?.name,
              itemId: data.item?.id,
              unsubscribedAt: null,
              ipAddress,
              userAgent,
              updatedAt: new Date()
            }
          });
        }

        // If subscriber is already active, update their subscription preferences
        return await prisma.subscriber.update({
          where: { id: existingSubscriber.id },
          data: {
            subscribingTo: data.subscribingTo,
            itemName: data.item?.name,
            itemId: data.item?.id,
            ipAddress,
            userAgent,
            updatedAt: new Date()
          }
        });
      }

      // Create new subscriber
      const newSubscriber = await prisma.subscriber.create({
        data: {
          email: data.email,
          subscribingTo: data.subscribingTo,
          itemName: data.item?.name,
          itemId: data.item?.id,
          ipAddress,
          userAgent
        }
      });

      // Send welcome email
      try {
        await sendWelcomeNewsletterEmail(
          data.email,
          undefined, // No name provided in current implementation
          data.subscribingTo
        );
      } catch (emailError) {
        logger.error('Error sending welcome email:', emailError);
        // Don't fail the subscription if email fails
      }

      return newSubscriber;
    } catch (error) {
      logger.error('Error creating subscriber:', error);
      throw new Error('Failed to create subscriber');
    }
  }

  /**
   * Get subscriber by ID
   */
  async getSubscriberById(id: string): Promise<Subscriber | null> {
    try {
      return await prisma.subscriber.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error('Error getting subscriber by ID:', error);
      throw new Error('Failed to get subscriber');
    }
  }

  /**
   * Get subscriber by email
   */
  async getSubscriberByEmail(email: string): Promise<Subscriber | null> {
    try {
      return await prisma.subscriber.findUnique({
        where: { email }
      });
    } catch (error) {
      logger.error('Error getting subscriber by email:', error);
      throw new Error('Failed to get subscriber');
    }
  }

  /**
   * Get all subscribers with pagination and filtering
   */
  async getSubscribers(query: GetSubscribersQueryData): Promise<{
    subscribers: Subscriber[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page, limit, search, subscribingTo, isActive, dateRange, startDate, endDate, sortBy, sortOrder } = query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.email = {
          contains: search,
          mode: 'insensitive' as any
        };
      }

      if (subscribingTo && subscribingTo !== 'all') {
        where.subscribingTo = subscribingTo;
      }

      if (isActive !== 'all' && isActive !== undefined) {
        where.isActive = isActive;
      }

      // Handle date range filtering
      if (dateRange && dateRange !== 'all') {
        const now = new Date();
        let start: Date;
        let end: Date = now;

        switch (dateRange) {
          case 'today':
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            start = new Date(now.getFullYear(), quarter * 3, 1);
            break;
          case 'year':
            start = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            start = new Date(0);
        }

        where.createdAt = {
          gte: start,
          lte: end
        };
      } else if (startDate || endDate) {
        // Custom date range
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate);
        }
      }

      // Get total count
      const total = await prisma.subscriber.count({ where });

      // Get subscribers
      const subscribers = await prisma.subscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        }
      });

      return {
        subscribers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting subscribers:', error);
      throw new Error('Failed to get subscribers');
    }
  }

  /**
   * Update subscriber
   */
  async updateSubscriber(id: string, data: UpdateSubscriberData): Promise<Subscriber> {
    try {
      return await prisma.subscriber.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating subscriber:', error);
      throw new Error('Failed to update subscriber');
    }
  }

  /**
   * Delete subscriber
   */
  async deleteSubscriber(id: string): Promise<void> {
    try {
      await prisma.subscriber.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error deleting subscriber:', error);
      throw new Error('Failed to delete subscriber');
    }
  }

  /**
   * Unsubscribe a subscriber
   */
  async unsubscribeSubscriber(data: UnsubscribeData): Promise<Subscriber> {
    try {
      const { email, subscribingTo, unsubscribeReason } = data;

      const subscriber = await prisma.subscriber.findUnique({
        where: { email }
      });

      if (!subscriber) {
        throw new Error('Subscriber not found');
      }

      // If specific subscription type is provided, only unsubscribe from that
      if (subscribingTo) {
        if (subscriber.subscribingTo === subscribingTo) {
          const updatedSubscriber = await prisma.subscriber.update({
            where: { id: subscriber.id },
            data: {
              isActive: false,
              unsubscribedAt: new Date(),
              unsubscribeReason,
              updatedAt: new Date()
            }
          });

          // Send emails
          await this.sendUnsubscribeEmails(subscriber, subscribingTo, unsubscribeReason);

          return updatedSubscriber;
        } else {
          throw new Error('Subscriber is not subscribed to this type');
        }
      }

      // Otherwise, unsubscribe from all
      const updatedSubscriber = await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: {
          isActive: false,
          unsubscribedAt: new Date(),
          unsubscribeReason,
          updatedAt: new Date()
        }
      });

      // Send emails
      await this.sendUnsubscribeEmails(subscriber, subscriber.subscribingTo, unsubscribeReason);

      return updatedSubscriber;
    } catch (error) {
      logger.error('Error unsubscribing subscriber:', error);
      throw error;
    }
  }

  /**
   * Send unsubscribe confirmation and admin notification emails
   */
  private async sendUnsubscribeEmails(
    subscriber: Subscriber, 
    subscriptionType: string, 
    unsubscribeReason?: string
  ): Promise<void> {
    try {
      // Send unsubscribe confirmation email to subscriber
      await sendUnsubscribeConfirmationEmail(
        subscriber.email,
        undefined // No name provided in current implementation
      );

      // Get current stats for admin notification
      const stats = await this.getSubscriberStats();
      
      // Send notification to admins
      const adminEmails = getAdminEmails();
      if (adminEmails.length > 0) {
        await sendUnsubscribeNotificationToAdmins(
          adminEmails,
          'Admin', // Generic admin name
          subscriber.email,
          subscriptionType,
          unsubscribeReason,
          stats.total,
          stats.active
        );
      }
    } catch (emailError) {
      logger.error('Error sending unsubscribe emails:', emailError);
      // Don't fail the unsubscribe if emails fail
    }
  }

  /**
   * Get subscriber statistics
   */
  async getSubscriberStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<SubscribeType, number>;
    recentSubscriptions: number;
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        total,
        active,
        inactive,
        recentSubscriptions,
        footerCount,
        modalCount,
        bookPublishCount
      ] = await Promise.all([
        prisma.subscriber.count(),
        prisma.subscriber.count({ where: { isActive: true } }),
        prisma.subscriber.count({ where: { isActive: false } }),
        prisma.subscriber.count({
          where: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }),
        prisma.subscriber.count({ where: { subscribingTo: 'FOOTER' } }),
        prisma.subscriber.count({ where: { subscribingTo: 'MODAL' } }),
        prisma.subscriber.count({ where: { subscribingTo: 'BOOK_PUBLISH' } })
      ]);

      return {
        total,
        active,
        inactive,
        byType: {
          FOOTER: footerCount,
          MODAL: modalCount,
          BOOK_PUBLISH: bookPublishCount
        },
        recentSubscriptions
      };
    } catch (error) {
      logger.error('Error getting subscriber stats:', error);
      throw new Error('Failed to get subscriber statistics');
    }
  }

  /**
   * Resubscribe a subscriber
   */
  async resubscribeSubscriber(email: string): Promise<Subscriber> {
    try {
      const subscriber = await prisma.subscriber.findUnique({
        where: { email }
      });

      if (!subscriber) {
        throw new Error('Subscriber not found');
      }

      return await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: {
          isActive: true,
          unsubscribedAt: null,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error resubscribing subscriber:', error);
      throw error;
    }
  }

  /**
   * Bulk operations on subscribers
   */
  async bulkSubscriberOperation(data: BulkSubscriberOperationData): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const { subscriberIds, operation } = data;
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const id of subscriberIds) {
        try {
          switch (operation) {
            case 'activate':
              await prisma.subscriber.update({
                where: { id },
                data: {
                  isActive: true,
                  unsubscribedAt: null,
                  updatedAt: new Date()
                }
              });
              break;
            case 'deactivate':
              await prisma.subscriber.update({
                where: { id },
                data: {
                  isActive: false,
                  unsubscribedAt: new Date(),
                  updatedAt: new Date()
                }
              });
              break;
            case 'delete':
              await prisma.subscriber.delete({
                where: { id }
              });
              break;
          }
          success++;
        } catch (error) {
          failed++;
          errors.push(`Failed to ${operation} subscriber ${id}: ${error}`);
        }
      }

      return { success, failed, errors };
    } catch (error) {
      logger.error('Error in bulk subscriber operation:', error);
      throw new Error('Failed to perform bulk operation');
    }
  }

  /**
   * Export subscribers for a specific type
   */
  async exportSubscribers(subscribingTo?: SubscribeType): Promise<Subscriber[]> {
    try {
      const where: any = {};
      if (subscribingTo) {
        where.subscribingTo = subscribingTo;
      }

      return await prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error exporting subscribers:', error);
      throw new Error('Failed to export subscribers');
    }
  }
}

export default new SubscriberService(); 