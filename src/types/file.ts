import { FileType } from '@prisma/client';

// Base file response type
export interface FileResponse {
  id: string;
  url: string;
  alt?: string;
  type: FileType;
  caption?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  uploadedBy?: string;
  isPublic: boolean;
  tags: string[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  uploadedByUser?: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// Create file data type
export interface CreateFileData {
  url: string;
  alt?: string;
  type: FileType;
  caption?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  isPublic?: boolean;
  tags?: string[];
  metadata?: any;
}

// Update file data type
export interface UpdateFileData {
  alt?: string;
  caption?: string;
  isPublic?: boolean;
  tags?: string[];
  metadata?: any;
}

// File query parameters
export interface GetFilesQueryData {
  page?: number;
  limit?: number;
  search?: string;
  type?: FileType | 'all';
  uploadedBy?: string;
  isPublic?: boolean | 'all';
  tags?: string[];
  sortBy?: 'createdAt' | 'updatedAt' | 'filename' | 'size' | 'originalName';
  sortOrder?: 'asc' | 'desc';
}

// Paginated response for files
export interface PaginatedFileResponse {
  files: FileResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  analytics?: {
    totalFiles: number;
    totalSize: number;
    filesByType: Record<FileType, number>;
    publicFiles: number;
    privateFiles: number;
  };
}

// File upload response
export interface FileUploadResponse {
  file: FileResponse;
  uploadUrl?: string; // For direct upload to cloud storage
  presignedUrl?: string; // For presigned URLs
}

// File deletion response
export interface FileDeletionResponse {
  success: boolean;
  message: string;
  deletedFileId: string;
}

// File statistics
export interface FileStatistics {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<FileType, number>;
  publicFiles: number;
  privateFiles: number;
  averageFileSize: number;
  largestFile: FileResponse | null;
  mostRecentFile: FileResponse | null;
}
