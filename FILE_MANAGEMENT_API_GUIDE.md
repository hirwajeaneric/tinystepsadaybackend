# File Management API Guide

This guide provides comprehensive documentation for the File Management API endpoints, which allow you to manage images, videos, documents, and other files in the system.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [File Types](#file-types)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Testing Guide](#testing-guide)

## Overview

The File Management API provides comprehensive functionality for:
- Creating file records with metadata
- Retrieving files with pagination and filtering
- Updating file metadata
- Deleting files
- Bulk operations on multiple files
- File search and statistics
- Direct upload URL generation for cloud storage

### Key Features

- **File Types**: Support for IMAGE, VIDEO, DOCUMENT, AUDIO, and OTHER file types
- **Metadata Management**: Store URL, alt text, caption, tags, and custom metadata
- **Access Control**: Public/private file visibility
- **User Attribution**: Track who uploaded each file
- **Search & Filtering**: Advanced search with multiple criteria
- **Bulk Operations**: Perform operations on multiple files simultaneously
- **Statistics**: Comprehensive file analytics and usage statistics

## Authentication

All file management endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Types

The system supports the following file types:

- `IMAGE` - Images (JPG, PNG, GIF, WebP, etc.)
- `VIDEO` - Video files (MP4, AVI, MOV, etc.)
- `DOCUMENT` - Documents (PDF, DOC, TXT, etc.)
- `AUDIO` - Audio files (MP3, WAV, etc.)
- `OTHER` - Any other file type

## API Endpoints

### 1. Create File Record

**POST** `/api/files`

Creates a new file record in the database.

**Request Body:**
```json
{
  "url": "https://example.com/image.jpg",
  "alt": "Alternative text for accessibility",
  "type": "IMAGE",
  "caption": "A beautiful sunset image",
  "filename": "sunset_123456.jpg",
  "originalName": "sunset.jpg",
  "mimeType": "image/jpeg",
  "size": 1024000,
  "width": 1920,
  "height": 1080,
  "isPublic": true,
  "tags": ["nature", "sunset", "landscape"],
  "metadata": {
    "location": "California",
    "camera": "iPhone 12"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "File created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "url": "https://example.com/image.jpg",
    "alt": "Alternative text for accessibility",
    "type": "IMAGE",
    "caption": "A beautiful sunset image",
    "filename": "sunset_123456.jpg",
    "originalName": "sunset.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "width": 1920,
    "height": 1080,
    "uploadedBy": "507f1f77bcf86cd799439012",
    "isPublic": true,
    "tags": ["nature", "sunset", "landscape"],
    "metadata": {
      "location": "California",
      "camera": "iPhone 12"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "uploadedByUser": {
      "id": "507f1f77bcf86cd799439012",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### 2. Get Files (Paginated)

**GET** `/api/files`

Retrieves files with pagination and filtering options.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `search` (string) - Search term for filename, originalName, caption, or alt
- `type` (string) - Filter by file type (IMAGE, VIDEO, DOCUMENT, AUDIO, OTHER, or 'all')
- `uploadedBy` (string) - Filter by user ID who uploaded the file
- `isPublic` (string) - Filter by visibility ('true', 'false', or 'all')
- `tags` (string) - Comma-separated list of tags to filter by
- `sortBy` (string) - Sort field (createdAt, updatedAt, filename, size, originalName)
- `sortOrder` (string) - Sort direction (asc, desc)

**Example Request:**
```
GET /api/files?page=1&limit=20&type=IMAGE&isPublic=true&sortBy=createdAt&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": {
    "files": [
      {
        "id": "507f1f77bcf86cd799439011",
        "url": "https://example.com/image.jpg",
        "alt": "Alternative text",
        "type": "IMAGE",
        "caption": "A beautiful sunset",
        "filename": "sunset_123456.jpg",
        "originalName": "sunset.jpg",
        "mimeType": "image/jpeg",
        "size": 1024000,
        "width": 1920,
        "height": 1080,
        "uploadedBy": "507f1f77bcf86cd799439012",
        "isPublic": true,
        "tags": ["nature", "sunset"],
        "metadata": {},
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "uploadedByUser": {
          "id": "507f1f77bcf86cd799439012",
          "username": "john_doe",
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    },
    "analytics": {
      "totalFiles": 150,
      "totalSize": 157286400,
      "filesByType": {
        "IMAGE": 100,
        "VIDEO": 30,
        "DOCUMENT": 15,
        "AUDIO": 3,
        "OTHER": 2
      },
      "publicFiles": 120,
      "privateFiles": 30
    }
  }
}
```

### 3. Get File by ID

**GET** `/api/files/:id`

Retrieves a specific file by its ID.

**Response:**
```json
{
  "success": true,
  "message": "File retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "url": "https://example.com/image.jpg",
    "alt": "Alternative text",
    "type": "IMAGE",
    "caption": "A beautiful sunset",
    "filename": "sunset_123456.jpg",
    "originalName": "sunset.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "width": 1920,
    "height": 1080,
    "uploadedBy": "507f1f77bcf86cd799439012",
    "isPublic": true,
    "tags": ["nature", "sunset"],
    "metadata": {},
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "uploadedByUser": {
      "id": "507f1f77bcf86cd799439012",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### 4. Update File

**PUT** `/api/files/:id`

Updates file metadata.

**Request Body:**
```json
{
  "alt": "Updated alternative text",
  "caption": "Updated caption",
  "isPublic": false,
  "tags": ["nature", "sunset", "updated"],
  "metadata": {
    "location": "California",
    "camera": "iPhone 12",
    "updated": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "File updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "url": "https://example.com/image.jpg",
    "alt": "Updated alternative text",
    "type": "IMAGE",
    "caption": "Updated caption",
    "filename": "sunset_123456.jpg",
    "originalName": "sunset.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "width": 1920,
    "height": 1080,
    "uploadedBy": "507f1f77bcf86cd799439012",
    "isPublic": false,
    "tags": ["nature", "sunset", "updated"],
    "metadata": {
      "location": "California",
      "camera": "iPhone 12",
      "updated": true
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z",
    "uploadedByUser": {
      "id": "507f1f77bcf86cd799439012",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### 5. Delete File

**DELETE** `/api/files/:id`

Deletes a file record from the database.

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "success": true,
    "message": "File deleted successfully",
    "deletedFileId": "507f1f77bcf86cd799439011"
  }
}
```

### 6. Search Files

**GET** `/api/files/search`

Searches files by filename, originalName, caption, alt text, or tags.

**Query Parameters:**
- `q` (string, required) - Search query
- `limit` (number, default: 20) - Maximum number of results

**Example Request:**
```
GET /api/files/search?q=sunset&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Files search completed successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "url": "https://example.com/sunset.jpg",
      "alt": "Sunset over mountains",
      "type": "IMAGE",
      "caption": "Beautiful sunset",
      "filename": "sunset_123456.jpg",
      "originalName": "sunset.jpg",
      "mimeType": "image/jpeg",
      "size": 1024000,
      "width": 1920,
      "height": 1080,
      "uploadedBy": "507f1f77bcf86cd799439012",
      "isPublic": true,
      "tags": ["nature", "sunset"],
      "metadata": {},
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "uploadedByUser": {
        "id": "507f1f77bcf86cd799439012",
        "username": "john_doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

### 7. Get File Statistics

**GET** `/api/files/statistics`

Retrieves comprehensive file statistics.

**Response:**
```json
{
  "success": true,
  "message": "File statistics retrieved successfully",
  "data": {
    "totalFiles": 150,
    "totalSize": 157286400,
    "filesByType": {
      "IMAGE": 100,
      "VIDEO": 30,
      "DOCUMENT": 15,
      "AUDIO": 3,
      "OTHER": 2
    },
    "publicFiles": 120,
    "privateFiles": 30,
    "averageFileSize": 1048576,
    "largestFile": {
      "id": "507f1f77bcf86cd799439013",
      "url": "https://example.com/large-video.mp4",
      "type": "VIDEO",
      "filename": "large-video.mp4",
      "size": 52428800,
      "uploadedBy": "507f1f77bcf86cd799439012"
    },
    "mostRecentFile": {
      "id": "507f1f77bcf86cd799439014",
      "url": "https://example.com/recent-image.jpg",
      "type": "IMAGE",
      "filename": "recent-image.jpg",
      "size": 512000,
      "uploadedBy": "507f1f77bcf86cd799439012"
    }
  }
}
```

### 8. Get My Files

**GET** `/api/files/my-files`

Retrieves files uploaded by the current authenticated user.

**Query Parameters:**
- `limit` (number, default: 20) - Maximum number of results

**Response:**
```json
{
  "success": true,
  "message": "Your files retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "url": "https://example.com/my-image.jpg",
      "alt": "My image",
      "type": "IMAGE",
      "caption": "A personal photo",
      "filename": "my-image_123456.jpg",
      "originalName": "my-image.jpg",
      "mimeType": "image/jpeg",
      "size": 512000,
      "width": 1280,
      "height": 720,
      "uploadedBy": "507f1f77bcf86cd799439012",
      "isPublic": true,
      "tags": ["personal"],
      "metadata": {},
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "uploadedByUser": {
        "id": "507f1f77bcf86cd799439012",
        "username": "john_doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

### 9. Get Files by Type

**GET** `/api/files/type/:type`

Retrieves files of a specific type.

**Path Parameters:**
- `type` (string) - File type (IMAGE, VIDEO, DOCUMENT, AUDIO, OTHER)

**Query Parameters:**
- `limit` (number, default: 10) - Maximum number of results

**Example Request:**
```
GET /api/files/type/IMAGE?limit=20
```

### 10. Bulk File Operations (Moderator+)

**POST** `/api/files/bulk`

Performs bulk operations on multiple files.

**Request Body:**
```json
{
  "fileIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "operation": "makePublic",
  "tags": ["bulk-updated"]
}
```

**Available Operations:**
- `delete` - Delete multiple files
- `makePublic` - Make files public
- `makePrivate` - Make files private
- `addTags` - Add tags to files (requires tags array)
- `removeTags` - Remove tags from files (requires tags array)

**Response:**
```json
{
  "success": true,
  "message": "Bulk operation 'makePublic' completed successfully",
  "data": {
    "affectedCount": 2,
    "affectedFileIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
  }
}
```

### 11. Get Upload URL (Cloud Storage Integration)

**POST** `/api/files/upload-url`

Generates upload URLs for direct cloud storage uploads.

**Request Body:**
```json
{
  "originalName": "new-image.jpg",
  "mimeType": "image/jpeg",
  "size": 1024000,
  "type": "IMAGE",
  "alt": "New image",
  "caption": "A new image",
  "isPublic": true,
  "tags": ["new"],
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Upload URL generated successfully",
  "data": {
    "uploadUrl": "https://your-cloud-storage.com/upload?token=123456789",
    "presignedUrl": "https://your-cloud-storage.com/presigned?file=new-image.jpg",
    "uploadData": {
      "originalName": "new-image.jpg",
      "mimeType": "image/jpeg",
      "size": 1024000,
      "type": "IMAGE",
      "alt": "New image",
      "caption": "A new image",
      "isPublic": true,
      "tags": ["new"],
      "metadata": {}
    }
  }
}
```

### 12. Get Files by User (Admin Only)

**GET** `/api/files/user/:userId`

Retrieves files uploaded by a specific user (admin only).

**Path Parameters:**
- `userId` (string) - User ID

**Query Parameters:**
- `limit` (number, default: 20) - Maximum number of results

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

**Common Error Codes:**
- `FILE_NOT_FOUND` - File with specified ID not found
- `INVALID_INPUT` - Invalid request data
- `INVALID_OPERATION` - Invalid bulk operation
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **File Operations**: 100 requests per 15 minutes
- **File Uploads**: 20 requests per hour
- **File Search**: 50 requests per 5 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit` - Request limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset time

## Testing Guide

### Prerequisites
1. Ensure the backend server is running
2. Have a valid JWT token for authentication
3. MongoDB database is connected

### Test Scenarios

#### 1. Create File Record
```bash
curl -X POST http://localhost:3000/api/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/test-image.jpg",
    "alt": "Test image",
    "type": "IMAGE",
    "caption": "A test image",
    "filename": "test-image.jpg",
    "originalName": "test-image.jpg",
    "mimeType": "image/jpeg",
    "size": 512000,
    "width": 1280,
    "height": 720,
    "isPublic": true,
    "tags": ["test", "image"]
  }'
```

#### 2. Get Files with Pagination
```bash
curl -X GET "http://localhost:3000/api/files?page=1&limit=10&type=IMAGE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Search Files
```bash
curl -X GET "http://localhost:3000/api/files/search?q=test&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Update File
```bash
curl -X PUT http://localhost:3000/api/files/FILE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Updated caption",
    "tags": ["test", "updated"]
  }'
```

#### 5. Delete File
```bash
curl -X DELETE http://localhost:3000/api/files/FILE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 6. Bulk Operations
```bash
curl -X POST http://localhost:3000/api/files/bulk \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileIds": ["FILE_ID_1", "FILE_ID_2"],
    "operation": "makePublic"
  }'
```

### Expected Test Results

1. **Create File**: Should return 201 with file data
2. **Get Files**: Should return 200 with paginated results
3. **Search**: Should return 200 with matching files
4. **Update**: Should return 200 with updated file data
5. **Delete**: Should return 200 with deletion confirmation
6. **Bulk Operations**: Should return 200 with operation results

### Error Testing

Test error scenarios:
- Invalid file ID (should return 404)
- Invalid file type (should return 400)
- Missing required fields (should return 400)
- Unauthorized access (should return 401)
- Rate limit exceeded (should return 429)

## Integration Notes

### Frontend Integration

When integrating with the frontend:

1. **File Upload Flow**:
   - Call `/api/files/upload-url` to get upload credentials
   - Upload file directly to cloud storage
   - Call `/api/files` to create file record with final URL

2. **File Display**:
   - Use `/api/files` for paginated file lists
   - Use `/api/files/search` for search functionality
   - Use `/api/files/type/:type` for type-specific displays

3. **User Files**:
   - Use `/api/files/my-files` for user's own files
   - Use `/api/files/user/:userId` for admin user management

### Cloud Storage Integration

The API is designed to work with cloud storage providers:

1. **Google Cloud Storage**: Use presigned URLs for direct uploads
2. **AWS S3**: Use presigned URLs for direct uploads
3. **Azure Blob Storage**: Use shared access signatures
4. **Custom Storage**: Implement custom upload URL generation

### Security Considerations

1. **File Validation**: Validate file types and sizes on both frontend and backend
2. **Access Control**: Use public/private flags for file visibility
3. **Rate Limiting**: Implement appropriate rate limits for file operations
4. **Authentication**: Require authentication for all file operations
5. **Authorization**: Use role-based access for admin operations

## Support

For questions or issues with the File Management API:

1. Check the error responses for specific error codes
2. Verify authentication and authorization
3. Check rate limiting headers
4. Review the request/response examples
5. Test with the provided curl commands

The File Management API provides a robust foundation for managing files in your application with comprehensive features for file organization, search, and access control.
