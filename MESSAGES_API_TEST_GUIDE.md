# Messages API Test Guide

This document provides comprehensive test cases for the Messages and MessageTemplates API endpoints.

## Table of Contents
1. [API Base URL](#api-base-url)
2. [Authentication](#authentication)
3. [Contact Messages API](#contact-messages-api)
4. [Message Templates API](#message-templates-api)
5. [Statistics API](#statistics-api)
6. [Bulk Operations](#bulk-operations)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

## API Base URL
```
Base URL: http://localhost:3001/api/messages
```

## Authentication

### Required Headers for Protected Endpoints
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### User Roles
- `USER` - Basic user access
- `MODERATOR` - Can view and update messages
- `INSTRUCTOR` - Can view, update, and create templates
- `ADMIN` - Full access to all operations
- `SUPER_ADMIN` - Full access to all operations

---

## Contact Messages API

### 1. Create Contact Message (Public)
**Endpoint:** `POST /contact`

**Description:** Create a new contact message (no authentication required)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "subject": "General Inquiry",
  "message": "I have a question about your services.",
  "category": "GENERAL",
  "priority": "MEDIUM",
  "source": "CONTACT_FORM",
  "tags": ["inquiry", "general"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Contact message created successfully",
  "data": {
    "id": "msg_123456789",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject": "General Inquiry",
    "message": "I have a question about your services.",
    "status": "UNREAD",
    "priority": "MEDIUM",
    "category": "GENERAL",
    "source": "CONTACT_FORM",
    "tags": ["inquiry", "general"],
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Test Cases:**
- ✅ Valid message creation
- ✅ Missing required fields (name, email, subject, message)
- ✅ Invalid email format
- ✅ Message too short (< 10 characters)
- ✅ Subject too short (< 5 characters)
- ✅ Name too short (< 2 characters)
- ✅ Invalid category enum value
- ✅ Invalid priority enum value
- ✅ Invalid source enum value
- ✅ Rate limiting (5 requests per 15 minutes)

### 2. Get Contact Messages (Protected)
**Endpoint:** `GET /messages`

**Description:** Retrieve contact messages with filtering and pagination

**Query Parameters:**
```
?status=UNREAD&priority=HIGH&category=SUPPORT&search=urgent&page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contact messages retrieved successfully",
  "data": {
    "messages": [
      {
        "id": "msg_123456789",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "subject": "Urgent Support Request",
        "message": "I need immediate assistance...",
        "status": "UNREAD",
        "priority": "URGENT",
        "category": "SUPPORT",
        "source": "CONTACT_FORM",
        "tags": ["urgent", "support"],
        "assignedUser": {
          "id": "user_123",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@tinystepsaday.com"
        },
        "replies": [],
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Test Cases:**
- ✅ Get all messages (no filters)
- ✅ Filter by status (UNREAD, READ, REPLIED, ARCHIVED)
- ✅ Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- ✅ Filter by category (GENERAL, SUPPORT, MENTORSHIP, BILLING, TECHNICAL, FEEDBACK)
- ✅ Filter by source (CONTACT_FORM, EMAIL, PHONE, CHAT)
- ✅ Search by name, email, subject, message content
- ✅ Filter by tags
- ✅ Date range filtering
- ✅ Pagination (page, limit)
- ✅ Sort by creation date (newest first)
- ✅ Unauthorized access (no token)
- ✅ Insufficient permissions

### 3. Get Contact Message by ID (Protected)
**Endpoint:** `GET /messages/:id`

**Description:** Retrieve a specific contact message by ID

**Response (200):**
```json
{
  "success": true,
  "message": "Contact message retrieved successfully",
  "data": {
    "id": "msg_123456789",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subject": "General Inquiry",
    "message": "I have a question about your services.",
    "status": "READ",
    "priority": "MEDIUM",
    "category": "GENERAL",
    "source": "CONTACT_FORM",
    "tags": ["inquiry", "general"],
    "assignedUser": null,
    "replies": [
      {
        "id": "reply_123",
        "messageId": "msg_123456789",
        "content": "Thank you for your inquiry...",
        "sentBy": "ADMIN",
        "sentByUser": "user_123",
        "attachments": [],
        "createdAt": "2024-01-15T11:00:00Z",
        "user": {
          "id": "user_123",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@tinystepsaday.com"
        }
      }
    ],
    "readAt": "2024-01-15T10:45:00Z",
    "repliedAt": "2024-01-15T11:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Test Cases:**
- ✅ Get existing message
- ✅ Message not found (404)
- ✅ Invalid message ID format
- ✅ Auto-mark as read when status is UNREAD
- ✅ Include assigned user details
- ✅ Include message replies
- ✅ Unauthorized access

### 4. Update Contact Message (Protected)
**Endpoint:** `PUT /messages/:id`

**Description:** Update a contact message

**Request Body:**
```json
{
  "status": "READ",
  "priority": "HIGH",
  "category": "SUPPORT",
  "assignedTo": "user_123",
  "tags": ["urgent", "support", "escalated"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contact message updated successfully",
  "data": {
    "id": "msg_123456789",
    "status": "READ",
    "priority": "HIGH",
    "category": "SUPPORT",
    "assignedTo": "user_123",
    "tags": ["urgent", "support", "escalated"],
    "readAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

**Test Cases:**
- ✅ Update status to READ (sets readAt)
- ✅ Update status to REPLIED (sets repliedAt)
- ✅ Update priority
- ✅ Update category
- ✅ Assign to user
- ✅ Update tags
- ✅ Multiple field updates
- ✅ Message not found
- ✅ Invalid status enum
- ✅ Invalid priority enum
- ✅ Invalid category enum
- ✅ Invalid user ID for assignment
- ✅ Unauthorized access

### 5. Delete Contact Message (Protected)
**Endpoint:** `DELETE /messages/:id`

**Description:** Delete a contact message (ADMIN, SUPER_ADMIN only)

**Response (200):**
```json
{
  "success": true,
  "message": "Contact message deleted successfully"
}
```

**Test Cases:**
- ✅ Delete existing message
- ✅ Message not found
- ✅ Insufficient permissions (MODERATOR, INSTRUCTOR)
- ✅ Unauthorized access

---

## Message Templates API

### 1. Create Message Template (Protected)
**Endpoint:** `POST /templates`

**Description:** Create a new message template

**Request Body:**
```json
{
  "name": "General Support Response",
  "subject": "Thank you for contacting us",
  "content": "Hi {{name}},\n\nThank you for reaching out to us...",
  "category": "SUPPORT",
  "isDefault": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message template created successfully",
  "data": {
    "id": "template_123456789",
    "name": "General Support Response",
    "subject": "Thank you for contacting us",
    "content": "Hi {{name}},\n\nThank you for reaching out to us...",
    "category": "SUPPORT",
    "isDefault": false,
    "createdBy": "user_123",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "createdByUser": {
      "id": "user_123",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@tinystepsaday.com"
    }
  }
}
```

**Test Cases:**
- ✅ Create template with all fields
- ✅ Create default template (unsets other defaults in category)
- ✅ Missing required fields
- ✅ Invalid category enum
- ✅ Name too short/long
- ✅ Subject too short/long
- ✅ Content too short/long
- ✅ Insufficient permissions (USER, MODERATOR)
- ✅ Unauthorized access

### 2. Get Message Templates (Protected)
**Endpoint:** `GET /templates`

**Description:** Retrieve message templates

**Query Parameters:**
```
?category=SUPPORT
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message templates retrieved successfully",
  "data": [
    {
      "id": "template_123456789",
      "name": "General Support Response",
      "subject": "Thank you for contacting us",
      "content": "Hi {{name}},\n\nThank you for reaching out to us...",
      "category": "SUPPORT",
      "isDefault": true,
      "createdBy": "user_123",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "createdByUser": {
        "id": "user_123",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@tinystepsaday.com"
      }
    }
  ]
}
```

**Test Cases:**
- ✅ Get all templates
- ✅ Filter by category
- ✅ Sort by default status and name
- ✅ Include creator details
- ✅ Unauthorized access

### 3. Get Message Template by ID (Protected)
**Endpoint:** `GET /templates/:id`

**Description:** Retrieve a specific message template

**Response (200):**
```json
{
  "success": true,
  "message": "Message template retrieved successfully",
  "data": {
    "id": "template_123456789",
    "name": "General Support Response",
    "subject": "Thank you for contacting us",
    "content": "Hi {{name}},\n\nThank you for reaching out to us...",
    "category": "SUPPORT",
    "isDefault": true,
    "createdBy": "user_123",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "createdByUser": {
      "id": "user_123",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@tinystepsaday.com"
    }
  }
}
```

**Test Cases:**
- ✅ Get existing template
- ✅ Template not found
- ✅ Invalid template ID format
- ✅ Unauthorized access

### 4. Update Message Template (Protected)
**Endpoint:** `PUT /templates/:id`

**Description:** Update a message template

**Request Body:**
```json
{
  "name": "Updated Support Response",
  "subject": "We're here to help",
  "content": "Hi {{name}},\n\nWe understand your concern...",
  "category": "SUPPORT",
  "isDefault": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message template updated successfully",
  "data": {
    "id": "template_123456789",
    "name": "Updated Support Response",
    "subject": "We're here to help",
    "content": "Hi {{name}},\n\nWe understand your concern...",
    "category": "SUPPORT",
    "isDefault": true,
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

**Test Cases:**
- ✅ Update template fields
- ✅ Set as default (unsets other defaults)
- ✅ Template not found
- ✅ Invalid field values
- ✅ Insufficient permissions
- ✅ Unauthorized access

### 5. Delete Message Template (Protected)
**Endpoint:** `DELETE /templates/:id`

**Description:** Delete a message template (ADMIN, SUPER_ADMIN only)

**Response (200):**
```json
{
  "success": true,
  "message": "Message template deleted successfully"
}
```

**Test Cases:**
- ✅ Delete existing template
- ✅ Template not found
- ✅ Insufficient permissions
- ✅ Unauthorized access

---

## Statistics API

### 1. Get Message Statistics (Protected)
**Endpoint:** `GET /messages/stats`

**Description:** Retrieve message statistics

**Query Parameters:**
```
?dateFrom=2024-01-01T00:00:00Z&dateTo=2024-01-31T23:59:59Z
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message statistics retrieved successfully",
  "data": {
    "total": 150,
    "unread": 25,
    "urgent": 5,
    "replied": 100,
    "byCategory": {
      "GENERAL": 30,
      "SUPPORT": 45,
      "MENTORSHIP": 25,
      "BILLING": 20,
      "TECHNICAL": 15,
      "FEEDBACK": 15
    },
    "byPriority": {
      "LOW": 50,
      "MEDIUM": 70,
      "HIGH": 25,
      "URGENT": 5
    },
    "byStatus": {
      "UNREAD": 25,
      "READ": 50,
      "REPLIED": 100,
      "ARCHIVED": 25
    }
  }
}
```

**Test Cases:**
- ✅ Get all statistics
- ✅ Filter by date range
- ✅ Invalid date format
- ✅ Unauthorized access

---

## Bulk Operations

### 1. Bulk Update Messages (Protected)
**Endpoint:** `PUT /messages/bulk/update`

**Description:** Update multiple messages at once

**Request Body:**
```json
{
  "messageIds": ["msg_123", "msg_456", "msg_789"],
  "updates": {
    "status": "READ",
    "assignedTo": "user_123"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully updated 3 messages"
}
```

**Test Cases:**
- ✅ Bulk update with valid data
- ✅ Empty message IDs array
- ✅ Invalid message IDs
- ✅ Invalid update fields
- ✅ Insufficient permissions
- ✅ Unauthorized access

### 2. Bulk Delete Messages (Protected)
**Endpoint:** `DELETE /messages/bulk/delete`

**Description:** Delete multiple messages at once (ADMIN, SUPER_ADMIN only)

**Request Body:**
```json
{
  "messageIds": ["msg_123", "msg_456", "msg_789"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully deleted 3 messages"
}
```

**Test Cases:**
- ✅ Bulk delete with valid IDs
- ✅ Empty message IDs array
- ✅ Invalid message IDs
- ✅ Insufficient permissions
- ✅ Unauthorized access

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Failed to create contact message",
  "error": "Invalid email address"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "No valid token provided"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "error": "ADMIN role required for this operation"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Contact message not found",
  "error": "Message with the specified ID does not exist"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "error": "Too many contact form submissions from this IP, please try again later."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "An unexpected error occurred"
}
```

---

## Rate Limiting

### Contact Form Rate Limiting
- **Limit:** 5 requests per 15 minutes per IP
- **Endpoint:** `POST /contact`
- **Headers:** Rate limit information included in response headers

**Rate Limit Headers:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1642234567
```

---

## Test Environment Setup

### Prerequisites
1. MongoDB running locally or connection string configured
2. Node.js and npm installed
3. Environment variables configured

### Environment Variables
```env
DATABASE_URL=mongodb://localhost:27017/tinystepsaday_test
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

### Running Tests
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start the server
npm run dev

# Run tests (when implemented)
npm test
```

### Test Data Setup
```javascript
// Sample test data for messages
const testMessages = [
  {
    name: "Test User 1",
    email: "test1@example.com",
    subject: "Test Message 1",
    message: "This is a test message for testing purposes.",
    category: "GENERAL",
    priority: "MEDIUM"
  },
  {
    name: "Test User 2",
    email: "test2@example.com",
    subject: "Urgent Support Request",
    message: "I need immediate assistance with my account.",
    category: "SUPPORT",
    priority: "URGENT"
  }
];

// Sample test data for templates
const testTemplates = [
  {
    name: "General Response",
    subject: "Thank you for contacting us",
    content: "Hi {{name}},\n\nThank you for reaching out to us...",
    category: "GENERAL",
    isDefault: true
  },
  {
    name: "Support Response",
    subject: "We're here to help",
    content: "Hi {{name}},\n\nWe understand your concern...",
    category: "SUPPORT",
    isDefault: false
  }
];
```

---

## Integration Testing

### Frontend Integration
1. **Contact Form Integration:**
   - Test form submission to `POST /contact`
   - Verify email notifications sent to management users
   - Test rate limiting behavior

2. **Management Dashboard Integration:**
   - Test message listing with filters
   - Test message details view
   - Test template management
   - Test bulk operations

3. **Email Notifications:**
   - Verify management users receive notifications
   - Verify original senders receive reply notifications
   - Test email template rendering

### Performance Testing
1. **Load Testing:**
   - Test with 100+ concurrent users
   - Monitor response times
   - Test database performance

2. **Rate Limiting:**
   - Test rate limit enforcement
   - Verify proper error responses

3. **Database Performance:**
   - Test with large datasets (1000+ messages)
   - Monitor query performance
   - Test indexing effectiveness

---

## Security Testing

### Authentication & Authorization
1. **Token Validation:**
   - Test with invalid tokens
   - Test with expired tokens
   - Test with missing tokens

2. **Role-Based Access:**
   - Test each endpoint with different user roles
   - Verify proper access control
   - Test privilege escalation attempts

3. **Input Validation:**
   - Test SQL injection attempts
   - Test XSS attempts
   - Test malformed JSON

### Data Protection
1. **Sensitive Data:**
   - Verify email addresses are properly handled
   - Test IP address logging
   - Verify user agent logging

2. **Rate Limiting:**
   - Test rate limit bypass attempts
   - Verify IP-based limiting works correctly

---

## Monitoring & Logging

### Log Levels
- **INFO:** Successful operations
- **WARN:** Non-critical issues
- **ERROR:** Failed operations
- **DEBUG:** Detailed debugging information

### Key Metrics to Monitor
1. **API Performance:**
   - Response times
   - Error rates
   - Throughput

2. **Business Metrics:**
   - Messages received per day
   - Response times
   - User satisfaction

3. **System Health:**
   - Database connectivity
   - Email service status
   - Memory usage

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Email service configured
- [ ] Rate limiting configured
- [ ] Logging configured

### Post-Deployment
- [ ] Health check endpoint responding
- [ ] Database connectivity verified
- [ ] Email notifications working
- [ ] Rate limiting functional
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Verify DATABASE_URL is correct
   - Check MongoDB service status
   - Verify network connectivity

2. **Email Sending Failures:**
   - Verify SMTP credentials
   - Check email service status
   - Verify firewall settings

3. **Rate Limiting Issues:**
   - Check Redis connection (if using Redis)
   - Verify rate limit configuration
   - Check IP detection logic

4. **Authentication Issues:**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Verify user roles in database

### Debug Commands
```bash
# Check database connection
npx prisma db push

# View database logs
npx prisma studio

# Check email configuration
npm run test:email

# Monitor API logs
tail -f logs/app.log
```

---

This test guide provides comprehensive coverage for all Messages API functionality. Use this as a reference for manual testing, automated testing, and quality assurance processes. 