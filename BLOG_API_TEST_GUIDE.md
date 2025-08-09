# Blog Management API Test Guide

This guide provides comprehensive testing instructions for the Blog Management API endpoints.

## Base URL
```
http://localhost:3000/api/blog
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Public Endpoints (No Authentication Required)

### 1. Get Public Blog Posts
```http
GET /api/blog/public/posts?page=1&limit=10&search=test&category=mindfulness&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term for title, content, or excerpt
- `category` (optional): Filter by category slug
- `sortBy` (optional): Sort field (createdAt, updatedAt, publishedAt, title, views, likesCount, commentsCount)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "posts": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Finding Inner Peace in a Chaotic World",
      "slug": "finding-inner-peace",
      "excerpt": "Discover practical methods to maintain calm and balance...",
      "content": "<p>In today's fast-paced world...</p>",
      "status": "PUBLISHED",
      "featuredImage": "https://example.com/image.jpg",
      "readTime": 5,
      "views": 150,
      "likesCount": 45,
      "commentsCount": 12,
      "sharesCount": 8,
      "isFeatured": true,
      "isPublished": true,
      "publishedAt": "2025-01-15T10:00:00.000Z",
      "seoTitle": "Finding Inner Peace - Complete Guide",
      "seoDescription": "Learn how to find inner peace in today's chaotic world...",
      "seoKeywords": ["inner peace", "mindfulness", "stress management"],
      "author": {
        "id": "507f1f77bcf86cd799439012",
        "name": "Sarah Johnson",
        "avatar": "https://example.com/avatar.jpg"
      },
      "category": {
        "id": "507f1f77bcf86cd799439013",
        "name": "Mindfulness",
        "slug": "mindfulness",
        "color": "#3B82F6"
      },
      "tags": [
        {
          "id": "507f1f77bcf86cd799439014",
          "name": "meditation",
          "slug": "meditation",
          "color": "#10B981"
        }
      ],
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 2. Get Public Blog Post by Slug
```http
GET /api/blog/public/posts/finding-inner-peace
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Finding Inner Peace in a Chaotic World",
  "slug": "finding-inner-peace",
  "excerpt": "Discover practical methods to maintain calm and balance...",
  "content": "<p>In today's fast-paced world...</p>",
  "status": "PUBLISHED",
  "featuredImage": "https://example.com/image.jpg",
  "readTime": 5,
  "views": 151,
  "likesCount": 45,
  "commentsCount": 12,
  "sharesCount": 8,
  "isFeatured": true,
  "isPublished": true,
  "publishedAt": "2025-01-15T10:00:00.000Z",
  "seoTitle": "Finding Inner Peace - Complete Guide",
  "seoDescription": "Learn how to find inner peace in today's chaotic world...",
  "seoKeywords": ["inner peace", "mindfulness", "stress management"],
  "author": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Sarah Johnson",
    "avatar": "https://example.com/avatar.jpg"
  },
  "category": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Mindfulness",
    "slug": "mindfulness",
    "color": "#3B82F6"
  },
  "tags": [
    {
      "id": "507f1f77bcf86cd799439014",
      "name": "meditation",
      "slug": "meditation",
      "color": "#10B981"
    }
  ],
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

### 3. Get Public Comments
```http
GET /api/blog/public/comments?postId=507f1f77bcf86cd799439011&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `postId` (required): Blog post ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sortBy` (optional): Sort field (createdAt, updatedAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "comments": [
    {
      "id": "507f1f77bcf86cd799439015",
      "content": "Great article! I found the breathing techniques very helpful.",
      "isApproved": true,
      "isSpam": false,
      "postId": "507f1f77bcf86cd799439011",
      "author": {
        "id": "507f1f77bcf86cd799439016",
        "name": "John Doe",
        "avatar": "https://example.com/avatar2.jpg"
      },
      "parentId": null,
      "replies": [],
      "createdAt": "2025-01-16T10:00:00.000Z",
      "updatedAt": "2025-01-16T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "pages": 2
  }
}
```

## Protected Endpoints (Authentication Required)

### 1. Create Blog Post
```http
POST /api/blog/posts
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "title": "New Blog Post Title",
  "slug": "new-blog-post-title",
  "content": "<p>This is the content of the blog post...</p>",
  "excerpt": "A brief description of the blog post",
  "status": "DRAFT",
  "featuredImage": "https://example.com/image.jpg",
  "readTime": 5,
  "isFeatured": false,
  "isPublished": false,
  "seoTitle": "SEO Optimized Title",
  "seoDescription": "SEO description for search engines",
  "seoKeywords": ["keyword1", "keyword2"],
  "categoryId": "507f1f77bcf86cd799439013",
  "tagIds": ["507f1f77bcf86cd799439014"]
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439017",
  "title": "New Blog Post Title",
  "slug": "new-blog-post-title",
  "content": "<p>This is the content of the blog post...</p>",
  "excerpt": "A brief description of the blog post",
  "status": "DRAFT",
  "featuredImage": "https://example.com/image.jpg",
  "readTime": 5,
  "views": 0,
  "likesCount": 0,
  "commentsCount": 0,
  "sharesCount": 0,
  "isFeatured": false,
  "isPublished": false,
  "publishedAt": null,
  "seoTitle": "SEO Optimized Title",
  "seoDescription": "SEO description for search engines",
  "seoKeywords": ["keyword1", "keyword2"],
  "author": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Sarah Johnson",
    "avatar": "https://example.com/avatar.jpg"
  },
  "category": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Mindfulness",
    "slug": "mindfulness",
    "color": "#3B82F6"
  },
  "tags": [
    {
      "id": "507f1f77bcf86cd799439014",
      "name": "meditation",
      "slug": "meditation",
      "color": "#10B981"
    }
  ],
  "createdAt": "2025-01-17T10:00:00.000Z",
  "updatedAt": "2025-01-17T10:00:00.000Z"
}
```

### 2. Get Blog Posts (Protected)
```http
GET /api/blog/posts?page=1&limit=10&search=test&status=PUBLISHED&category=mindfulness&author=sarah&isFeatured=true&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term for title, content, or excerpt
- `status` (optional): Filter by status (DRAFT, PUBLISHED, ARCHIVED, SCHEDULED)
- `category` (optional): Filter by category slug
- `author` (optional): Filter by author name
- `isFeatured` (optional): Filter by featured status (true/false)
- `sortBy` (optional): Sort field (createdAt, updatedAt, publishedAt, title, views, likesCount, commentsCount)
- `sortOrder` (optional): Sort order (asc, desc)

### 3. Get Blog Post by ID
```http
GET /api/blog/posts/507f1f77bcf86cd799439011
Authorization: Bearer <your-jwt-token>
```

### 4. Update Blog Post
```http
PUT /api/blog/posts/507f1f77bcf86cd799439011
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "title": "Updated Blog Post Title",
  "content": "<p>Updated content...</p>",
  "status": "PUBLISHED",
  "isPublished": true
}
```

### 5. Delete Blog Post
```http
DELETE /api/blog/posts/507f1f77bcf86cd799439011
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true
}
```

## Blog Categories (Admin/Editor Only)

### 1. Create Category
```http
POST /api/blog/categories
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "New Category",
  "slug": "new-category",
  "description": "Description of the new category",
  "color": "#3B82F6",
  "isActive": true,
  "sortOrder": 1
}
```

### 2. Get Categories
```http
GET /api/blog/categories
Authorization: Bearer <your-jwt-token>
```

### 3. Get Category by ID
```http
GET /api/blog/categories/507f1f77bcf86cd799439013
Authorization: Bearer <your-jwt-token>
```

### 4. Update Category
```http
PUT /api/blog/categories/507f1f77bcf86cd799439013
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "Updated Category Name",
  "description": "Updated description"
}
```

### 5. Delete Category
```http
DELETE /api/blog/categories/507f1f77bcf86cd799439013
Authorization: Bearer <your-jwt-token>
```

## Blog Tags (Admin/Editor Only)

### 1. Create Tag
```http
POST /api/blog/tags
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "New Tag",
  "slug": "new-tag",
  "color": "#10B981",
  "isActive": true
}
```

### 2. Get Tags
```http
GET /api/blog/tags
Authorization: Bearer <your-jwt-token>
```

### 3. Get Tag by ID
```http
GET /api/blog/tags/507f1f77bcf86cd799439014
Authorization: Bearer <your-jwt-token>
```

### 4. Update Tag
```http
PUT /api/blog/tags/507f1f77bcf86cd799439014
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "Updated Tag Name",
  "color": "#EF4444"
}
```

### 5. Delete Tag
```http
DELETE /api/blog/tags/507f1f77bcf86cd799439014
Authorization: Bearer <your-jwt-token>
```

## Blog Comments

### 1. Create Comment
```http
POST /api/blog/comments
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "content": "This is a great article!",
  "postId": "507f1f77bcf86cd799439011",
  "parentId": null
}
```

### 2. Get Comments
```http
GET /api/blog/comments?postId=507f1f77bcf86cd799439011&page=1&limit=10&isApproved=true&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <your-jwt-token>
```

### 3. Update Comment
```http
PUT /api/blog/comments/507f1f77bcf86cd799439015
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "content": "Updated comment content",
  "isApproved": true
}
```

### 4. Delete Comment
```http
DELETE /api/blog/comments/507f1f77bcf86cd799439015
Authorization: Bearer <your-jwt-token>
```

## Blog Likes

### 1. Toggle Like
```http
POST /api/blog/likes
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "postId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "liked": true
}
```

### 2. Check Like Status
```http
GET /api/blog/likes/507f1f77bcf86cd799439011
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "liked": true
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Blog post not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Testing Checklist

### Public Endpoints
- [ ] Get public blog posts with pagination
- [ ] Get public blog posts with search
- [ ] Get public blog posts with category filter
- [ ] Get public blog posts with sorting
- [ ] Get public blog post by slug
- [ ] Get public comments for a post
- [ ] Verify only published posts are returned
- [ ] Verify only approved comments are returned

### Protected Endpoints
- [ ] Create blog post (authenticated)
- [ ] Get blog posts (authenticated)
- [ ] Get blog post by ID (authenticated)
- [ ] Update blog post (authenticated)
- [ ] Delete blog post (authenticated)
- [ ] Verify author can only edit their own posts
- [ ] Verify admin can edit any post

### Categories
- [ ] Create category (admin/editor only)
- [ ] Get categories
- [ ] Get category by ID
- [ ] Update category (admin/editor only)
- [ ] Delete category (admin/editor only)
- [ ] Verify non-admin cannot create/update/delete categories

### Tags
- [ ] Create tag (admin/editor only)
- [ ] Get tags
- [ ] Get tag by ID
- [ ] Update tag (admin/editor only)
- [ ] Delete tag (admin/editor only)
- [ ] Verify non-admin cannot create/update/delete tags

### Comments
- [ ] Create comment (authenticated)
- [ ] Get comments for a post
- [ ] Update comment (author only)
- [ ] Delete comment (author or admin)
- [ ] Verify comment author can only edit their own comments

### Likes
- [ ] Toggle like (authenticated)
- [ ] Check like status (authenticated)
- [ ] Verify like count updates correctly

### Error Handling
- [ ] Test with invalid JWT token
- [ ] Test with expired JWT token
- [ ] Test with insufficient permissions
- [ ] Test with invalid data
- [ ] Test with non-existent resources

## Performance Testing

### Load Testing
- [ ] Test with 100 concurrent users
- [ ] Test with 1000 concurrent users
- [ ] Monitor response times
- [ ] Monitor database performance
- [ ] Test pagination with large datasets

### Security Testing
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Test CSRF protection
- [ ] Test rate limiting
- [ ] Test input validation

## Integration Testing

### Frontend Integration
- [ ] Test blog post creation from frontend
- [ ] Test blog post editing from frontend
- [ ] Test comment system from frontend
- [ ] Test like system from frontend
- [ ] Test search and filtering from frontend

### Database Integration
- [ ] Test database connections
- [ ] Test transaction rollbacks
- [ ] Test data consistency
- [ ] Test foreign key constraints
- [ ] Test indexing performance
