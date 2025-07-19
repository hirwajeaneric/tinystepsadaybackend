# Comprehensive Testing Guide - Tiny Steps A Day Backend

This guide provides detailed testing instructions for all endpoints, including edge cases, security testing, and performance testing.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Testing Tools](#testing-tools)
3. [Environment Setup](#environment-setup)
4. [Base URL and Headers](#base-url-and-headers)
5. [Endpoint Testing](#endpoint-testing)
6. [Security Testing](#security-testing)
7. [Performance Testing](#performance-testing)
8. [Edge Cases](#edge-cases)
9. [Automated Testing](#automated-testing)

## 🔧 Prerequisites

### Required Tools
- **Postman** or **Insomnia** (API testing)
- **curl** (command line testing)
- **MongoDB Compass** (database inspection)
- **Node.js** and **npm** (for running the server)

### Environment Setup
```bash
# Clone and setup
git clone <repository-url>
cd tinystepsaday-backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:push

# Start server
npm run dev
```

## 🛠️ Testing Tools

### Postman Collection
Create a Postman collection with the following structure:
```
Tiny Steps A Day Backend
├── Health & Info
│   ├── Health Check
│   └── API Info
├── Authentication
│   ├── Register User
│   ├── Login User
│   └── Login User (Invalid)
├── User Management
│   ├── Get Current User
│   ├── Update Current User
│   ├── Change Password
│   ├── Deactivate Account
│   └── Get Users (Admin)
├── User CRUD
│   ├── Get User by ID
│   ├── Update User
│   └── Delete User
└── Security Tests
    ├── Rate Limiting
    ├── Input Validation
    └── Authentication Tests
```

### Environment Variables
Set up Postman environment variables:
```
BASE_URL: http://localhost:3000
API_URL: {{BASE_URL}}/api
AUTH_TOKEN: (will be set after login)
USER_ID: (will be set after user creation)
```

## 🌐 Base URL and Headers

### Base URL
```
Development: http://localhost:3000
API Base: http://localhost:3000/api
```

### Common Headers
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Authentication Header
```json
{
  "Authorization": "Bearer {{AUTH_TOKEN}}"
}
```

## 🧪 Endpoint Testing

### 1. Health & Info Endpoints

#### 1.1 Health Check
**Endpoint:** `GET /api/health`

**Test Cases:**
```bash
# Basic health check
curl -X GET http://localhost:3000/api/health

# Expected Response (200):
{
  "success": true,
  "message": "Health check completed",
  "data": {
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.456,
    "database": "connected",
    "environment": "development",
    "version": "1.0.0"
  }
}
```

**Edge Cases:**
- Database disconnected (should return 503)
- Server under load (check uptime values)
- Multiple concurrent requests

#### 1.2 API Info
**Endpoint:** `GET /api/info`

**Test Cases:**
```bash
curl -X GET http://localhost:3000/api/info

# Expected Response (200):
{
  "success": true,
  "message": "API information retrieved successfully",
  "data": {
    "name": "Backend Server API",
    "version": "1.0.0",
    "description": "Backend server with MongoDB, Prisma, and TypeScript",
    "endpoints": {
      "health": "/api/health",
      "users": "/api/users",
      "auth": {
        "register": "POST /api/users/register",
        "login": "POST /api/users/login"
      }
    }
  }
}
```

### 2. Authentication Endpoints

#### 2.1 User Registration
**Endpoint:** `POST /api/users/register`

**Valid Test Cases:**
```bash
# Valid registration
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Expected Response (201):
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isEmailVerified": false,
    "twoFactorEnabled": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Edge Cases:**
```bash
# Invalid email format
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "username": "testuser",
    "password": "TestPass123!"
  }'

# Weak password
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "123"
  }'

# Duplicate email
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "username": "newuser",
    "password": "TestPass123!"
  }'

# Duplicate username
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new@example.com",
    "username": "existinguser",
    "password": "TestPass123!"
  }'

# Missing required fields
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# Username with invalid characters
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "test@user",
    "password": "TestPass123!"
  }'
```

#### 2.2 User Login
**Endpoint:** `POST /api/users/login`

**Valid Test Cases:**
```bash
# Valid login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Expected Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "test@example.com",
      "username": "testuser",
      "role": "USER",
      "isEmailVerified": false,
      "twoFactorEnabled": false,
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Edge Cases:**
```bash
# Invalid credentials
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'

# Non-existent user
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "TestPass123!"
  }'

# Deactivated account
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "deactivated@example.com",
    "password": "TestPass123!"
  }'

# Missing email
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "TestPass123!"
  }'

# Missing password
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 3. Protected User Endpoints

#### 3.1 Get Current User
**Endpoint:** `GET /api/users/me`

**Test Cases:**
```bash
# Valid request with token
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer {{AUTH_TOKEN}}"

# Expected Response (200):
{
  "success": true,
  "message": "Current user retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isEmailVerified": false,
    "twoFactorEnabled": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Edge Cases:**
```bash
# Missing token
curl -X GET http://localhost:3000/api/users/me

# Invalid token
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer invalid-token"

# Expired token
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer expired-token"

# Malformed Authorization header
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: invalid-format"
```

#### 3.2 Update Current User
**Endpoint:** `PUT /api/users/me`

**Test Cases:**
```bash
# Valid update
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "bio": "Updated bio"
  }'

# Expected Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "Jane",
    "lastName": "Smith",
    "bio": "Updated bio",
    "role": "USER",
    "isEmailVerified": false,
    "twoFactorEnabled": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Edge Cases:**
```bash
# Invalid email format
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email"
  }'

# Username with invalid characters
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@user"
  }'

# Duplicate email
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com"
  }'

# Duplicate username
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "existinguser"
  }'

# Invalid avatar URL
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "avatar": "not-a-url"
  }'
```

#### 3.3 Change Password
**Endpoint:** `POST /api/users/me/change-password`

**Test Cases:**
```bash
# Valid password change
curl -X POST http://localhost:3000/api/users/me/change-password \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "TestPass123!",
    "newPassword": "NewPass456!"
  }'

# Expected Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Edge Cases:**
```bash
# Incorrect current password
curl -X POST http://localhost:3000/api/users/me/change-password \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "WrongPass123!",
    "newPassword": "NewPass456!"
  }'

# Weak new password
curl -X POST http://localhost:3000/api/users/me/change-password \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "TestPass123!",
    "newPassword": "123"
  }'

# Missing current password
curl -X POST http://localhost:3000/api/users/me/change-password \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "NewPass456!"
  }'

# Missing new password
curl -X POST http://localhost:3000/api/users/me/change-password \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "TestPass123!"
  }'
```

#### 3.4 Deactivate Account
**Endpoint:** `POST /api/users/me/deactivate`

**Test Cases:**
```bash
# Valid deactivation
curl -X POST http://localhost:3000/api/users/me/deactivate \
  -H "Authorization: Bearer {{AUTH_TOKEN}}"

# Expected Response (200):
{
  "success": true,
  "message": "Account deactivated successfully"
}
```

**Edge Cases:**
```bash
# Already deactivated account
curl -X POST http://localhost:3000/api/users/me/deactivate \
  -H "Authorization: Bearer {{AUTH_TOKEN}}"
```

### 4. Admin User Management Endpoints

#### 4.1 Get Users (Admin)
**Endpoint:** `GET /api/users`

**Test Cases:**
```bash
# Get all users
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Get users with pagination
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Get users with search
curl -X GET "http://localhost:3000/api/users?search=john" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Get users with filters
curl -X GET "http://localhost:3000/api/users?isActive=true&role=USER" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Expected Response (200):
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "test@example.com",
      "username": "testuser",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isEmailVerified": false,
      "twoFactorEnabled": false,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Edge Cases:**
```bash
# Non-admin user access
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer {{USER_TOKEN}}"

# Invalid pagination parameters
curl -X GET "http://localhost:3000/api/users?page=0&limit=1000" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Invalid search parameters
curl -X GET "http://localhost:3000/api/users?search=" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"
```

#### 4.2 Get User by ID
**Endpoint:** `GET /api/users/:id`

**Test Cases:**
```bash
# Valid user ID
curl -X GET http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Expected Response (200):
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isEmailVerified": false,
    "twoFactorEnabled": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Edge Cases:**
```bash
# Invalid ObjectId format
curl -X GET http://localhost:3000/api/users/invalid-id \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Non-existent user ID
curl -X GET http://localhost:3000/api/users/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Non-admin user access
curl -X GET http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer {{USER_TOKEN}}"
```

#### 4.3 Update User (Admin)
**Endpoint:** `PUT /api/users/:id`

**Test Cases:**
```bash
# Valid user update
curl -X PUT http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "role": "MODERATOR",
    "isActive": true
  }'

# Expected Response (200):
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "Updated",
    "lastName": "Name",
    "role": "MODERATOR",
    "isEmailVerified": false,
    "twoFactorEnabled": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Edge Cases:**
```bash
# Invalid user ID
curl -X PUT http://localhost:3000/api/users/invalid-id \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated"
  }'

# Non-existent user
curl -X PUT http://localhost:3000/api/users/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated"
  }'

# Invalid role
curl -X PUT http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "INVALID_ROLE"
  }'

# Non-admin user access
curl -X PUT http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer {{USER_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated"
  }'
```

#### 4.4 Delete User (Admin)
**Endpoint:** `DELETE /api/users/:id`

**Test Cases:**
```bash
# Valid user deletion
curl -X DELETE http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Expected Response (200):
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Edge Cases:**
```bash
# Invalid user ID
curl -X DELETE http://localhost:3000/api/users/invalid-id \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Non-existent user
curl -X DELETE http://localhost:3000/api/users/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Non-admin user access
curl -X DELETE http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer {{USER_TOKEN}}"

# Delete own account (should be prevented)
curl -X DELETE http://localhost:3000/api/users/{{ADMIN_USER_ID}} \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"
```

## 🔒 Security Testing

### 1. Rate Limiting Tests

#### General Rate Limiting
```bash
# Test general rate limiting (100 requests per 15 minutes)
for i in {1..110}; do
  curl -X GET http://localhost:3000/api/health
  echo "Request $i"
done

# Expected: After 100 requests, should get 429 status
```

#### Authentication Rate Limiting
```bash
# Test auth rate limiting (5 attempts per 15 minutes)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/users/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrongpassword"
    }'
  echo "Login attempt $i"
done

# Expected: After 5 attempts, should get 429 status
```

### 2. Input Validation Tests

#### SQL Injection Attempts
```bash
# Test for SQL injection in email
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com\"; DROP TABLE users; --",
    "password": "TestPass123!"
  }'

# Test for SQL injection in username
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "test\"; DROP TABLE users; --",
    "password": "TestPass123!"
  }'
```

#### XSS Attempts
```bash
# Test for XSS in user data
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "<script>alert(\"XSS\")</script>",
    "bio": "<img src=x onerror=alert(\"XSS\")>"
  }'
```

#### NoSQL Injection Attempts
```bash
# Test for NoSQL injection
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$ne": ""},
    "password": {"$ne": ""}
  }'
```

### 3. Authentication Tests

#### Token Validation
```bash
# Test with malformed token
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer malformed.token.here"

# Test with expired token
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer expired.token.here"

# Test with tampered token
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer tampered.token.here"

# Test without Bearer prefix
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: {{AUTH_TOKEN}}"
```

#### Authorization Tests
```bash
# Test user accessing admin endpoints
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer {{USER_TOKEN}}"

# Test user updating another user
curl -X PUT http://localhost:3000/api/users/{{OTHER_USER_ID}} \
  -H "Authorization: Bearer {{USER_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Unauthorized"
  }'
```

### 4. Request Size and Content Type Tests

#### Request Size Limits
```bash
# Test request size limit (10MB)
# Create a large JSON payload
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!",
    "bio": "'$(printf 'A%.0s' {1..10000000})'"
  }'

# Expected: 413 Payload Too Large
```

#### Content Type Validation
```bash
# Test with wrong content type
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: text/plain" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!"
  }'

# Test with missing content type
curl -X POST http://localhost:3000/api/users/register \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

## ⚡ Performance Testing

### 1. Load Testing with Apache Bench (ab)

#### Health Check Load Test
```bash
# Test 1000 requests with 10 concurrent users
ab -n 1000 -c 10 http://localhost:3000/api/health

# Test 10000 requests with 100 concurrent users
ab -n 10000 -c 100 http://localhost:3000/api/health
```

#### User Registration Load Test
```bash
# Create test data file
cat > test_users.json << EOF
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "TestPass123!"
}
EOF

# Test registration endpoint
ab -n 100 -c 10 -p test_users.json -T application/json \
  http://localhost:3000/api/users/register
```

### 2. Database Performance Tests

#### Concurrent User Creation
```bash
# Script to create multiple users concurrently
for i in {1..50}; do
  curl -X POST http://localhost:3000/api/users/register \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"test$i@example.com\",
      \"username\": \"testuser$i\",
      \"password\": \"TestPass123!\"
    }" &
done
wait
```

#### Large Dataset Queries
```bash
# Test pagination with large dataset
curl -X GET "http://localhost:3000/api/users?page=1&limit=1000" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"

# Test search with large dataset
curl -X GET "http://localhost:3000/api/users?search=test" \
  -H "Authorization: Bearer {{ADMIN_TOKEN}}"
```

## 🔍 Edge Cases

### 1. Boundary Value Testing

#### Username Length
```bash
# Minimum length (3 characters)
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "ab",
    "password": "TestPass123!"
  }'

# Maximum length (50 characters)
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "'$(printf 'A%.0s' {1..51})'",
    "password": "TestPass123!"
  }'
```

#### Email Length
```bash
# Very long email
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$(printf 'A%.0s' {1..300})'@example.com",
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

#### Password Complexity
```bash
# Test all password requirements
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "lowercase"
  }'

curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "UPPERCASE"
  }'

curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "12345678"
  }'
```

### 2. Unicode and Special Characters

#### Unicode Usernames
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "测试用户",
    "password": "TestPass123!"
  }'

curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "user🎉",
    "password": "TestPass123!"
  }'
```

#### Special Characters in Names
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!",
    "firstName": "O'Connor",
    "lastName": "van der Berg"
  }'
```

### 3. Time-based Tests

#### Token Expiration
```bash
# Create a token and wait for expiration
TOKEN=$(curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }' | jq -r '.data.token')

# Wait for token to expire (15 minutes)
sleep 900

# Try to use expired token
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

#### Rate Limit Reset
```bash
# Trigger rate limit
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/users/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrongpassword"
    }'
done

# Wait for rate limit window to reset (15 minutes)
sleep 900

# Try again
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'
```

## 🤖 Automated Testing

### 1. Postman Collection Runner

Create a Postman collection with all test cases and run them automatically:

```bash
# Export collection and run with Newman
newman run TinyStepsADay.postman_collection.json \
  --environment local.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

### 2. Jest Test Suite

Create automated tests using Jest:

```javascript
// tests/api.test.js
const request = require('supertest');
const app = require('../src/app');

describe('API Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Setup test data
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.database).toBe('connected');
    });
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      userId = response.body.data.id;
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser2',
        password: 'TestPass123!'
      };

      await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(409);
    });
  });

  // Add more test cases...
});
```

### 3. Load Testing Script

```bash
#!/bin/bash
# load_test.sh

echo "Starting load test..."

# Health check load test
echo "Testing health endpoint..."
ab -n 1000 -c 10 http://localhost:3000/api/health

# User registration load test
echo "Testing user registration..."
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/users/register \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"loadtest$i@example.com\",
      \"username\": \"loadtest$i\",
      \"password\": \"TestPass123!\"
    }" &
done
wait

echo "Load test completed!"
```

## 📊 Test Results Documentation

### Test Report Template

```markdown
# Test Report - Tiny Steps A Day Backend

## Test Summary
- **Date:** 2024-01-01
- **Environment:** Development
- **Total Tests:** 150
- **Passed:** 145
- **Failed:** 5
- **Success Rate:** 96.7%

## Endpoint Coverage
- ✅ Health Check: 100%
- ✅ User Registration: 100%
- ✅ User Login: 100%
- ✅ User Management: 95%
- ✅ Admin Operations: 90%

## Security Test Results
- ✅ Rate Limiting: PASS
- ✅ Input Validation: PASS
- ✅ Authentication: PASS
- ✅ Authorization: PASS
- ⚠️ SQL Injection: 1 false positive

## Performance Test Results
- **Average Response Time:** 45ms
- **95th Percentile:** 120ms
- **Throughput:** 1000 req/sec
- **Error Rate:** 0.1%

## Issues Found
1. **High Priority:** Rate limiting not working for admin endpoints
2. **Medium Priority:** Password validation too strict
3. **Low Priority:** Response time spikes under load

## Recommendations
1. Implement proper rate limiting for admin endpoints
2. Review password complexity requirements
3. Optimize database queries for large datasets
```

This comprehensive testing guide covers all aspects of testing your Tiny Steps A Day backend, from basic functionality to security and performance testing. Use this guide to ensure your application is robust, secure, and performant. 