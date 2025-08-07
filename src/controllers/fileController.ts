import { Response } from 'express';
import fileService from '../services/fileService';
import { AuthenticatedRequest } from '../types';
import {
  CreateFileData,
  UpdateFileData,
  BulkFileOperationData,
  FileUploadData,
} from '../schemas/fileSchema';

class FileController {
  /**
   * Create a new file record
   */
  async createFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const fileData = req.body as CreateFileData;
      const userId = req.user!.userId;
      
      const result = await fileService.createFile(fileData, userId);

      res.status(201).json({
        success: true,
        message: 'File created successfully',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create file'
      });
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'INVALID_INPUT',
          message: 'File ID is required'
        });
        return;
      }
      const file = await fileService.getFileById(id);

      res.status(200).json({
        success: true,
        message: 'File retrieved successfully',
        data: file
      });
    } catch (error: any) {
      if (error.message === 'File not found') {
        res.status(404).json({
          success: false,
          error: 'FILE_NOT_FOUND',
          message: 'File not found'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve file'
      });
    }
  }

  /**
   * Get files with pagination and filtering
   */
  async getFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query = req.query as any;
      const result = await fileService.getFiles(query);

      res.status(200).json({
        success: true,
        message: 'Files retrieved successfully',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve files'
      });
    }
  }

  /**
   * Update file
   */
  async updateFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'INVALID_INPUT',
          message: 'File ID is required'
        });
        return;
      }
      const updateData = req.body as UpdateFileData;
      
      const result = await fileService.updateFile(id, updateData);

      res.status(200).json({
        success: true,
        message: 'File updated successfully',
        data: result
      });
    } catch (error: any) {
      if (error.message === 'File not found') {
        res.status(404).json({
          success: false,
          error: 'FILE_NOT_FOUND',
          message: 'File not found'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update file'
      });
    }
  }

  /**
   * Delete file
   */
  async deleteFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'INVALID_INPUT',
          message: 'File ID is required'
        });
        return;
      }
      const result = await fileService.deleteFile(id);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        data: result
      });
    } catch (error: any) {
      if (error.message === 'File not found') {
        res.status(404).json({
          success: false,
          error: 'FILE_NOT_FOUND',
          message: 'File not found'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete file'
      });
    }
  }

  /**
   * Bulk file operations
   */
  async bulkFileOperation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const operationData = req.body as BulkFileOperationData;
      const result = await fileService.bulkFileOperation(operationData);

      res.status(200).json({
        success: true,
        message: `Bulk operation '${operationData.operation}' completed successfully`,
        data: result
      });
    } catch (error: any) {
      if (error.message === 'Tags are required for addTags operation' || 
          error.message === 'Tags are required for removeTags operation') {
        res.status(400).json({
          success: false,
          error: 'INVALID_INPUT',
          message: error.message
        });
        return;
      }

      if (error.message === 'Invalid operation') {
        res.status(400).json({
          success: false,
          error: 'INVALID_OPERATION',
          message: 'Invalid operation specified'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to perform bulk operation'
      });
    }
  }

  /**
   * Get file statistics
   */
  async getFileStatistics(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const statistics = await fileService.getFileStatistics();

      res.status(200).json({
        success: true,
        message: 'File statistics retrieved successfully',
        data: statistics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve file statistics'
      });
    }
  }

  /**
   * Get files by type
   */
  async getFilesByType(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 10;
      
      const files = await fileService.getFilesByType(type as any, limit);

      res.status(200).json({
        success: true,
        message: `Files of type '${type}' retrieved successfully`,
        data: files
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve files by type'
      });
    }
  }

  /**
   * Search files
   */
  async searchFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 20;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          error: 'INVALID_INPUT',
          message: 'Search query is required'
        });
        return;
      }

      const files = await fileService.searchFiles(q, limit);

      res.status(200).json({
        success: true,
        message: 'Files search completed successfully',
        data: files
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to search files'
      });
    }
  }

  /**
   * Get files uploaded by current user
   */
  async getMyFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 20;
      
      const files = await fileService.getFilesByUser(userId, limit);

      res.status(200).json({
        success: true,
        message: 'Your files retrieved successfully',
        data: files
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve your files'
      });
    }
  }

  /**
   * Get files uploaded by a specific user (admin only)
   */
  async getFilesByUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'INVALID_INPUT',
          message: 'User ID is required'
        });
        return;
      }
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string) : 20;
      
      const files = await fileService.getFilesByUser(userId, limit);

      res.status(200).json({
        success: true,
        message: `Files uploaded by user ${userId} retrieved successfully`,
        data: files
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve user files'
      });
    }
  }

  /**
   * Get presigned URL for direct upload (placeholder for cloud storage integration)
   */
  async getUploadUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uploadData = req.body as FileUploadData;
      // const _userId = req.user!.userId; // Unused variable - placeholder for future use

      // This is a placeholder - in a real implementation, you would:
      // 1. Generate a presigned URL for your cloud storage provider
      // 2. Return the URL and any necessary metadata
      // 3. The frontend would upload directly to the cloud storage
      // 4. Then call createFile with the final URL

      const uploadUrl = `https://your-cloud-storage.com/upload?token=${Date.now()}`;
      const presignedUrl = `https://your-cloud-storage.com/presigned?file=${uploadData.originalName}`;

      res.status(200).json({
        success: true,
        message: 'Upload URL generated successfully',
        data: {
          uploadUrl,
          presignedUrl,
          uploadData
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate upload URL'
      });
    }
  }
}

export default new FileController();
