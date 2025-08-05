import { PrismaClient, MessageCategory, MessageStatus, MessagePriority, MessageSource } from '@prisma/client';
import { 
  CreateContactMessageRequest, 
  UpdateContactMessageRequest, 
  CreateMessageTemplateRequest,
  UpdateMessageTemplateRequest,
  MessageFilters,
  MessageStats,
  ContactMessage,
  MessageTemplate
} from '../types/messages';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class MessageService {
  // Contact Messages
  async createContactMessage(data: CreateContactMessageRequest, ipAddress?: string, userAgent?: string): Promise<ContactMessage> {
    try {
      const message = await prisma.contactMessage.create({
        data: {
          ...data,
          ipAddress: ipAddress || data.ipAddress,
          userAgent: userAgent || data.userAgent,
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      logger.info(`Contact message created: ${message.id}`);
      return message;
    } catch (error) {
      logger.error('Error creating contact message:', error);
      throw error;
    }
  }

  async getContactMessages(filters: MessageFilters, page: number = 1, limit: number = 20): Promise<{ messages: ContactMessage[]; total: number; totalPages: number }> {
    try {
      const where: any = {};

      // Apply filters - handle string values and convert to proper enum types
      if (filters.status && filters.status !== 'all') {
        where.status = filters.status as MessageStatus;
      }
      if (filters.priority && filters.priority !== 'all') {
        where.priority = filters.priority as MessagePriority;
      }
      if (filters.category && filters.category !== 'all') {
        where.category = filters.category as MessageCategory;
      }
      if (filters.source && filters.source !== 'all') {
        where.source = filters.source as MessageSource;
      }
      if (filters.assignedTo) where.assignedTo = filters.assignedTo;
      if (filters.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
      }
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
      }

      // Apply search
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { subject: { contains: filters.search, mode: 'insensitive' } },
          { message: { contains: filters.search, mode: 'insensitive' } },
          { tags: { hasSome: [filters.search] } },
        ];
      }

      // Build orderBy clause
      const orderBy: any = {};
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'desc';
      orderBy[sortBy] = sortOrder;

      const [messages, total] = await Promise.all([
        prisma.contactMessage.findMany({
          where,
          include: {
            assignedUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.contactMessage.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return { messages, total, totalPages };
    } catch (error) {
      logger.error('Error fetching contact messages:', error);
      throw error;
    }
  }

  async getContactMessageById(id: string): Promise<ContactMessage | null> {
    try {
      const message = await prisma.contactMessage.findUnique({
        where: { id },
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      // Mark as read if not already read
      if (message && message.status === 'UNREAD') {
        await this.updateContactMessage(id, { status: 'READ' });
        message.status = 'READ';
        message.readAt = new Date();
      }

      return message;
    } catch (error) {
      logger.error('Error fetching contact message:', error);
      throw error;
    }
  }

  async updateContactMessage(id: string, data: UpdateContactMessageRequest): Promise<ContactMessage> {
    try {
      const updateData: any = { ...data };

      // Set readAt timestamp when marking as read
      if (data.status === 'READ') {
        updateData.readAt = new Date();
      }

      // Set repliedAt timestamp when marking as replied
      if (data.status === 'REPLIED') {
        updateData.repliedAt = new Date();
      }

      const message = await prisma.contactMessage.update({
        where: { id },
        data: updateData,
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      logger.info(`Contact message updated: ${id}`);
      return message;
    } catch (error) {
      logger.error('Error updating contact message:', error);
      throw error;
    }
  }

  async deleteContactMessage(id: string): Promise<void> {
    try {
      await prisma.contactMessage.delete({
        where: { id },
      });

      logger.info(`Contact message deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting contact message:', error);
      throw error;
    }
  }

  async bulkUpdateMessages(messageIds: string[], updates: UpdateContactMessageRequest): Promise<number> {
    try {
      const updateData: any = { ...updates };

      // Set readAt timestamp when marking as read
      if (updates.status === 'READ') {
        updateData.readAt = new Date();
      }

      // Set repliedAt timestamp when marking as replied
      if (updates.status === 'REPLIED') {
        updateData.repliedAt = new Date();
      }

      const result = await prisma.contactMessage.updateMany({
        where: { id: { in: messageIds } },
        data: updateData,
      });

      logger.info(`Bulk updated ${result.count} messages`);
      return result.count;
    } catch (error) {
      logger.error('Error bulk updating messages:', error);
      throw error;
    }
  }

  async bulkDeleteMessages(messageIds: string[]): Promise<number> {
    try {
      const result = await prisma.contactMessage.deleteMany({
        where: { id: { in: messageIds } },
      });

      logger.info(`Bulk deleted ${result.count} messages`);
      return result.count;
    } catch (error) {
      logger.error('Error bulk deleting messages:', error);
      throw error;
    }
  }

  // Message Templates
  async createMessageTemplate(data: CreateMessageTemplateRequest, userId?: string): Promise<MessageTemplate> {
    try {
      // If this template is set as default, unset other defaults in the same category
      if (data.isDefault) {
        await prisma.messageTemplate.updateMany({
          where: { 
            category: data.category,
            isDefault: true 
          },
          data: { isDefault: false },
        });
      }

      const template = await prisma.messageTemplate.create({
        data: {
          ...data,
          createdBy: userId,
        },
        include: {
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Message template created: ${template.id}`);
      return template;
    } catch (error) {
      logger.error('Error creating message template:', error);
      throw error;
    }
  }

  async getMessageTemplates(category?: MessageCategory): Promise<MessageTemplate[]> {
    try {
      const where = category ? { category } : {};

      const templates = await prisma.messageTemplate.findMany({
        where,
        include: {
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: [
          { isDefault: 'desc' },
          { name: 'asc' },
        ],
      });

      return templates;
    } catch (error) {
      logger.error('Error fetching message templates:', error);
      throw error;
    }
  }

  async getMessageTemplateById(id: string): Promise<MessageTemplate | null> {
    try {
      const template = await prisma.messageTemplate.findUnique({
        where: { id },
        include: {
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return template;
    } catch (error) {
      logger.error('Error fetching message template:', error);
      throw error;
    }
  }

  async updateMessageTemplate(id: string, data: UpdateMessageTemplateRequest): Promise<MessageTemplate> {
    try {
      // If this template is being set as default, unset other defaults in the same category
      if (data.isDefault) {
        const template = await this.getMessageTemplateById(id);
        if (template) {
          await prisma.messageTemplate.updateMany({
            where: { 
              category: template.category,
              isDefault: true,
              id: { not: id }
            },
            data: { isDefault: false },
          });
        }
      }

      const updatedTemplate = await prisma.messageTemplate.update({
        where: { id },
        data,
        include: {
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Message template updated: ${id}`);
      return updatedTemplate;
    } catch (error) {
      logger.error('Error updating message template:', error);
      throw error;
    }
  }

  async deleteMessageTemplate(id: string): Promise<void> {
    try {
      await prisma.messageTemplate.delete({
        where: { id },
      });

      logger.info(`Message template deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting message template:', error);
      throw error;
    }
  }

  // Statistics
  async getMessageStats(dateFrom?: Date, dateTo?: Date): Promise<MessageStats> {
    try {
      const where: any = {};
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const [
        total,
        unread,
        urgent,
        replied,
        byCategory,
        byPriority,
        byStatus,
      ] = await Promise.all([
        prisma.contactMessage.count({ where }),
        prisma.contactMessage.count({ where: { ...where, status: 'UNREAD' } }),
        prisma.contactMessage.count({ where: { ...where, priority: 'URGENT' } }),
        prisma.contactMessage.count({ where: { ...where, status: 'REPLIED' } }),
        prisma.contactMessage.groupBy({
          by: ['category'],
          where,
          _count: { category: true },
        }),
        prisma.contactMessage.groupBy({
          by: ['priority'],
          where,
          _count: { priority: true },
        }),
        prisma.contactMessage.groupBy({
          by: ['status'],
          where,
          _count: { status: true },
        }),
      ]);

      const stats: MessageStats = {
        total,
        unread,
        urgent,
        replied,
        byCategory: {
          GENERAL: 0,
          SUPPORT: 0,
          MENTORSHIP: 0,
          BILLING: 0,
          TECHNICAL: 0,
          FEEDBACK: 0,
        },
        byPriority: {
          LOW: 0,
          MEDIUM: 0,
          HIGH: 0,
          URGENT: 0,
        },
        byStatus: {
          UNREAD: 0,
          READ: 0,
          REPLIED: 0,
          ARCHIVED: 0,
        },
      };

      // Populate category stats
      byCategory.forEach((item) => {
        stats.byCategory[item.category] = item._count.category;
      });

      // Populate priority stats
      byPriority.forEach((item) => {
        stats.byPriority[item.priority] = item._count.priority;
      });

      // Populate status stats
      byStatus.forEach((item) => {
        stats.byStatus[item.status] = item._count.status;
      });

      return stats;
    } catch (error) {
      logger.error('Error fetching message stats:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService(); 