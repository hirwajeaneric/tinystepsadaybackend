import { Request, Response } from 'express';
import { messageService } from '../services/messageService';
import { 
  createContactMessageSchema, 
  updateContactMessageSchema, 
  contactMessageIdSchema,
  createMessageTemplateSchema,
  updateMessageTemplateSchema,
  messageTemplateIdSchema,
  messageFiltersSchema,
  messageStatsSchema,
  bulkUpdateMessagesSchema,
  bulkDeleteMessagesSchema,
} from '../schemas/messageSchema';
import logger from '../utils/logger';
import { MessageResponse, MessagesResponse, MessageTemplatesResponse, MessageTemplateResponse, MessageStatsResponse } from '../types/messages';

export class MessageController {
  // Contact Messages
  async createContactMessage(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createContactMessageSchema.parse(req.body);
      
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const message = await messageService.createContactMessage(validatedData, ipAddress, userAgent);

      const response: MessageResponse = {
        success: true,
        message: 'Contact message created successfully',
        data: message,
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Error creating contact message:', error);
      
      const response: MessageResponse = {
        success: false,
        message: 'Failed to create contact message',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  async getContactMessages(req: Request, res: Response): Promise<void> {
    try {
      const validatedFilters = messageFiltersSchema.parse(req.query);
      
      const dateFrom = validatedFilters.dateFrom ? new Date(validatedFilters.dateFrom) : undefined;
      const dateTo = validatedFilters.dateTo ? new Date(validatedFilters.dateTo) : undefined;
      
      // Handle "all" values for enum filters
      const filters = {
        ...validatedFilters,
        status: validatedFilters.status === 'all' ? undefined : validatedFilters.status,
        priority: validatedFilters.priority === 'all' ? undefined : validatedFilters.priority,
        category: validatedFilters.category === 'all' ? undefined : validatedFilters.category,
        source: validatedFilters.source === 'all' ? undefined : validatedFilters.source,
        dateFrom,
        dateTo
      };
      
      const { messages, total, totalPages } = await messageService.getContactMessages(
        filters,
        validatedFilters.page,
        validatedFilters.limit
      );

      const response: MessagesResponse = {
        success: true,
        message: 'Contact messages retrieved successfully',
        data: {
          messages,
          total,
          page: validatedFilters.page,
          limit: validatedFilters.limit,
          totalPages,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error fetching contact messages:', error);
      
      const response: MessagesResponse = {
        success: false,
        message: 'Failed to retrieve contact messages',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  async getContactMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = contactMessageIdSchema.parse(req.params);
      
      const message = await messageService.getContactMessageById(id);

      if (!message) {
        const response: MessageResponse = {
          success: false,
          message: 'Contact message not found',
          error: 'Message with the specified ID does not exist',
        };
        res.status(404).json(response);
        return;
      }

      const response: MessageResponse = {
        success: true,
        message: 'Contact message retrieved successfully',
        data: message,
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error fetching contact message:', error);
      
      const response: MessageResponse = {
        success: false,
        message: 'Failed to retrieve contact message',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  async updateContactMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = contactMessageIdSchema.parse(req.params);
      const validatedData = updateContactMessageSchema.parse(req.body);
      
      const message = await messageService.updateContactMessage(id, validatedData);

      const response: MessageResponse = {
        success: true,
        message: 'Contact message updated successfully',
        data: message,
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error updating contact message:', error);
      
      const response: MessageResponse = {
        success: false,
        message: 'Failed to update contact message',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  async deleteContactMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = contactMessageIdSchema.parse(req.params);
      
      await messageService.deleteContactMessage(id);

      const response: MessageResponse = {
        success: true,
        message: 'Contact message deleted successfully',
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error deleting contact message:', error);
      
      const response: MessageResponse = {
        success: false,
        message: 'Failed to delete contact message',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  async bulkUpdateMessages(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = bulkUpdateMessagesSchema.parse(req.body);
      
      const updatedCount = await messageService.bulkUpdateMessages(
        validatedData.messageIds,
        validatedData.updates
      );

      const response: MessageResponse = {
        success: true,
        message: `Successfully updated ${updatedCount} messages`,
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error bulk updating messages:', error);
      
      const response: MessageResponse = {
        success: false,
        message: 'Failed to bulk update messages',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  async bulkDeleteMessages(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = bulkDeleteMessagesSchema.parse(req.body);
      
      const deletedCount = await messageService.bulkDeleteMessages(validatedData.messageIds);

      const response: MessageResponse = {
        success: true,
        message: `Successfully deleted ${deletedCount} messages`,
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error bulk deleting messages:', error);
      
      const response: MessageResponse = {
        success: false,
        message: 'Failed to bulk delete messages',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  // Message Templates
  async createMessageTemplate(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createMessageTemplateSchema.parse(req.body);
      const userId = (req as any).user?.id; // From auth middleware
      
      const template = await messageService.createMessageTemplate(validatedData, userId);

      const response: MessageTemplateResponse = {
        success: true,
        message: 'Message template created successfully',
        data: template,
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Error creating message template:', error);
      
      const response: MessageTemplateResponse = {
        success: false,
        message: 'Failed to create message template',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  async getMessageTemplates(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query['category'] as string;
      
      const templates = await messageService.getMessageTemplates(category as any);

      const response: MessageTemplatesResponse = {
        success: true,
        message: 'Message templates retrieved successfully',
        data: templates,
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error fetching message templates:', error);
      
      const response: MessageTemplatesResponse = {
        success: false,
        message: 'Failed to retrieve message templates',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  async getMessageTemplateById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = messageTemplateIdSchema.parse(req.params);
      
      const template = await messageService.getMessageTemplateById(id);

      if (!template) {
        const response: MessageTemplateResponse = {
          success: false,
          message: 'Message template not found',
          error: 'Template with the specified ID does not exist',
        };
        res.status(404).json(response);
        return;
      }

      const response: MessageTemplateResponse = {
        success: true,
        message: 'Message template retrieved successfully',
        data: template,
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error fetching message template:', error);
      
      const response: MessageTemplateResponse = {
        success: false,
        message: 'Failed to retrieve message template',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  async updateMessageTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = messageTemplateIdSchema.parse(req.params);
      const validatedData = updateMessageTemplateSchema.parse(req.body);
      
      const template = await messageService.updateMessageTemplate(id, validatedData);

      const response: MessageTemplateResponse = {
        success: true,
        message: 'Message template updated successfully',
        data: template,
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error updating message template:', error);
      
      const response: MessageTemplateResponse = {
        success: false,
        message: 'Failed to update message template',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  async deleteMessageTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = messageTemplateIdSchema.parse(req.params);
      
      await messageService.deleteMessageTemplate(id);

      const response: MessageTemplateResponse = {
        success: true,
        message: 'Message template deleted successfully',
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error deleting message template:', error);
      
      const response: MessageTemplateResponse = {
        success: false,
        message: 'Failed to delete message template',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }

  // Statistics
  async getMessageStats(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = messageStatsSchema.parse(req.query);
      
      const dateFrom = validatedData.dateFrom ? new Date(validatedData.dateFrom) : undefined;
      const dateTo = validatedData.dateTo ? new Date(validatedData.dateTo) : undefined;
      
      const stats = await messageService.getMessageStats(dateFrom, dateTo);

      const response: MessageStatsResponse = {
        success: true,
        message: 'Message statistics retrieved successfully',
        data: stats,
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error fetching message stats:', error);
      
      const response: MessageStatsResponse = {
        success: false,
        message: 'Failed to retrieve message statistics',
        error: error.message || 'Internal server error',
      };

      res.status(400).json(response);
    }
  }
}

export const messageController = new MessageController(); 