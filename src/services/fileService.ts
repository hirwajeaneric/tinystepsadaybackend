import { FileType } from '@prisma/client';
import database from '../utils/database';
import {
  FileResponse,
  CreateFileData,
  UpdateFileData,
  GetFilesQueryData,
  PaginatedFileResponse,
  FileDeletionResponse,
  FileStatistics,
} from '../types/file';
import {
  NotFoundError,
  ValidationError,
} from '../utils/errors';
import { ErrorCode } from '../types/errors';
import logger from '../utils/logger';
import { BulkFileOperationData } from '../schemas/fileSchema';

class FileService {
  private prisma = database.prisma;

  /**
   * Create a new file record
   */
  async createFile(fileData: CreateFileData, uploadedBy?: string): Promise<FileResponse> {
    try {
      // Generate a unique filename if not provided
      const filename = fileData.filename || this.generateUniqueFilename(fileData.originalName);

      const file = await this.prisma.file.create({
        data: {
          ...fileData,
          filename,
          uploadedBy,
        },
        include: {
          uploadedByUser: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      logger.info('File created successfully:', {
        fileId: file.id,
        filename: file.filename,
        type: file.type,
        uploadedBy,
      });

      return this.toFileResponse(file);
    } catch (error: any) {
      logger.error('Failed to create file:', error);
      throw new Error('Failed to create file');
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(id: string): Promise<FileResponse> {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundError('File not found', ErrorCode.FILE_NOT_FOUND);
    }

    return this.toFileResponse(file);
  }

  /**
   * Get files with pagination and filtering
   */
  async getFiles(query: GetFilesQueryData): Promise<PaginatedFileResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      uploadedBy,
      isPublic,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (uploadedBy) {
      where.uploadedBy = uploadedBy;
    }

    if (isPublic !== undefined && isPublic !== 'all') {
      where.isPublic = isPublic;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    // Get total count
    const total = await this.prisma.file.count({ where });

    // Get files
    const files = await this.prisma.file.findMany({
      where,
      include: {
        uploadedByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    // Get analytics
    const analytics = await this.getFileAnalytics();

    return {
      files: files.map(file => this.toFileResponse(file)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      analytics,
    };
  }

  /**
   * Update file
   */
  async updateFile(id: string, updateData: UpdateFileData): Promise<FileResponse> {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundError('File not found', ErrorCode.FILE_NOT_FOUND);
    }

    const updatedFile = await this.prisma.file.update({
      where: { id },
      data: updateData,
      include: {
        uploadedByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info('File updated successfully:', {
      fileId: id,
      updatedFields: Object.keys(updateData),
    });

    return this.toFileResponse(updatedFile);
  }

  /**
   * Delete file
   */
  async deleteFile(id: string): Promise<FileDeletionResponse> {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundError('File not found', ErrorCode.FILE_NOT_FOUND);
    }

    await this.prisma.file.delete({
      where: { id },
    });

    logger.info('File deleted successfully:', {
      fileId: id,
      filename: file.filename,
    });

    return {
      success: true,
      message: 'File deleted successfully',
      deletedFileId: id,
    };
  }

  /**
   * Bulk file operations
   */
  async bulkFileOperation(operationData: BulkFileOperationData): Promise<{ affectedCount: number; affectedFileIds: string[] }> {
    const { fileIds, operation, tags } = operationData;

    let affectedCount = 0;

    switch (operation) {
      case 'delete':
        const deleteResult = await this.prisma.file.deleteMany({
          where: { id: { in: fileIds } },
        });
        affectedCount = deleteResult.count;
        break;

      case 'makePublic':
        const publicResult = await this.prisma.file.updateMany({
          where: { id: { in: fileIds } },
          data: { isPublic: true },
        });
        affectedCount = publicResult.count;
        break;

      case 'makePrivate':
        const privateResult = await this.prisma.file.updateMany({
          where: { id: { in: fileIds } },
          data: { isPublic: false },
        });
        affectedCount = privateResult.count;
        break;

      case 'addTags':
        if (!tags || tags.length === 0) {
          throw new ValidationError('Tags are required for addTags operation', ErrorCode.BAD_REQUEST);
        }
        // For MongoDB, we need to update each file individually to add tags
        for (const fileId of fileIds) {
          await this.prisma.file.update({
            where: { id: fileId },
            data: {
              tags: {
                push: tags,
              },
            },
          });
        }
        affectedCount = fileIds.length;
        break;

      case 'removeTags':
        if (!tags || tags.length === 0) {
          throw new ValidationError('Tags are required for removeTags operation', ErrorCode.BAD_REQUEST);
        }
        // For MongoDB, we need to update each file individually to remove tags
        for (const fileId of fileIds) {
          const file = await this.prisma.file.findUnique({ where: { id: fileId } });
          if (file) {
            const updatedTags = file.tags.filter(tag => !tags.includes(tag));
            await this.prisma.file.update({
              where: { id: fileId },
              data: { tags: updatedTags },
            });
          }
        }
        affectedCount = fileIds.length;
        break;

      default:
        throw new ValidationError('Invalid operation', ErrorCode.BAD_REQUEST);
    }

    logger.info('Bulk file operation completed:', {
      operation,
      affectedCount,
      fileIds,
    });

    return {
      affectedCount,
      affectedFileIds: fileIds,
    };
  }

  /**
   * Get file statistics
   */
  async getFileStatistics(): Promise<FileStatistics> {
    const [
      totalFiles,
      totalSize,
      filesByType,
      publicFiles,
      privateFiles,
      largestFile,
      mostRecentFile,
    ] = await Promise.all([
      this.prisma.file.count(),
      this.prisma.file.aggregate({
        _sum: { size: true },
      }),
      this.prisma.file.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      this.prisma.file.count({ where: { isPublic: true } }),
      this.prisma.file.count({ where: { isPublic: false } }),
      this.prisma.file.findFirst({
        orderBy: { size: 'desc' },
        include: {
          uploadedByUser: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.file.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedByUser: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    const filesByTypeMap = filesByType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<FileType, number>);

    const averageFileSize = totalFiles > 0 ? (totalSize._sum.size || 0) / totalFiles : 0;

    return {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      filesByType: filesByTypeMap,
      publicFiles,
      privateFiles,
      averageFileSize,
      largestFile: largestFile ? this.toFileResponse(largestFile) : null,
      mostRecentFile: mostRecentFile ? this.toFileResponse(mostRecentFile) : null,
    };
  }

  /**
   * Get files by type
   */
  async getFilesByType(type: FileType, limit = 10): Promise<FileResponse[]> {
    const files = await this.prisma.file.findMany({
      where: { type },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return files.map(file => this.toFileResponse(file));
  }

  /**
   * Search files
   */
  async searchFiles(searchTerm: string, limit = 20): Promise<FileResponse[]> {
    const files = await this.prisma.file.findMany({
      where: {
        OR: [
          { filename: { contains: searchTerm, mode: 'insensitive' } },
          { originalName: { contains: searchTerm, mode: 'insensitive' } },
          { caption: { contains: searchTerm, mode: 'insensitive' } },
          { alt: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { has: searchTerm } },
        ],
      },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return files.map(file => this.toFileResponse(file));
  }

  /**
   * Get files uploaded by a specific user
   */
  async getFilesByUser(userId: string, limit = 20): Promise<FileResponse[]> {
    const files = await this.prisma.file.findMany({
      where: { uploadedBy: userId },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return files.map(file => this.toFileResponse(file));
  }

  /**
   * Private helper methods
   */
  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop() || '';
    return `${timestamp}_${randomString}.${extension}`;
  }

  private async getFileAnalytics(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<FileType, number>;
    publicFiles: number;
    privateFiles: number;
  }> {
    const [
      totalFiles,
      totalSize,
      filesByType,
      publicFiles,
      privateFiles,
    ] = await Promise.all([
      this.prisma.file.count(),
      this.prisma.file.aggregate({
        _sum: { size: true },
      }),
      this.prisma.file.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      this.prisma.file.count({ where: { isPublic: true } }),
      this.prisma.file.count({ where: { isPublic: false } }),
    ]);

    const filesByTypeMap = filesByType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<FileType, number>);

    return {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      filesByType: filesByTypeMap,
      publicFiles,
      privateFiles,
    };
  }

  private toFileResponse(file: any): FileResponse {
    return {
      id: file.id,
      url: file.url,
      alt: file.alt,
      type: file.type,
      caption: file.caption,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      width: file.width,
      height: file.height,
      duration: file.duration,
      uploadedBy: file.uploadedBy,
      isPublic: file.isPublic,
      tags: file.tags,
      metadata: file.metadata,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      uploadedByUser: file.uploadedByUser,
    };
  }
}

export default new FileService();
