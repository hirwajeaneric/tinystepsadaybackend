# Complete Test Guide - Authentication & User Management

## 🎯 **Overview**

This comprehensive test guide covers all authentication and user management endpoints implemented in the Tiny Steps A Day backend, including edge cases and security scenarios.

## 📋 **Test Environment Setup**

### **Prerequisites**
```bash
# Start the development server
npm run dev

# Server should be running on http://localhost:8080
# Database should be connected and Prisma client generated
```

### **Test Tools**
- **Postman** or **Insomnia** for API testing
- **cURL** for command-line testing
- **JWT.io** for token inspection

### **Test Data Setup**
```json
{
  "testUsers": {
    "regularUser": {
      "email": "testuser@example.com",
      "username": "testuser",
      "password": "TestPassword123!",
      "firstName": "Test",
      "lastName": "User"
    },
    "adminUser": {
      "email": "admin@example.com",
      "username": "admin",
      "password": "AdminPassword123!",
      "firstName": "Admin",
      "lastName": "User"
    },
    "superAdminUser": {
      "email": "superadmin@example.com",
      "username": "superadmin",
      "password": "SuperAdminPassword123!",
      "firstName": "Super",
      "lastName": "Admin"
    }
  }
}
```

---

## 🔐 **Authentication Endpoints**

### **1. User Registration**
**Endpoint**: `POST /api/users/register`

#### **✅ Happy Path Tests**
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "SecurePassword123!",
  "firstName": "New",
  "lastName": "User"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "...",
    "email": "newuser@example.com",
    "username": "newuser",
    "firstName": "New",
    "lastName": "User",
    "role": "USER",
    "isEmailVerified": false,
    "isActive": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Duplicate Email**
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "existing@example.com",
  "username": "newuser2",
  "password": "SecurePassword123!"
}
```
**Expected**: `409 CONFLICT` - "Email already exists"

**2. Duplicate Username**
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "newuser2@example.com",
  "username": "existinguser",
  "password": "SecurePassword123!"
}
```
**Expected**: `409 CONFLICT` - "Username already exists"

**3. Invalid Email Format**
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "invalid-email",
  "username": "newuser",
  "password": "SecurePassword123!"
}
```
**Expected**: `400 BAD REQUEST` - "Invalid email format"

**4. Weak Password**
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "weak"
}
```
**Expected**: `400 BAD REQUEST` - "Password must contain at least one lowercase letter, one uppercase letter, and one number"

**5. Username with Special Characters**
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "username": "user@name",
  "password": "SecurePassword123!"
}
```
**Expected**: `400 BAD REQUEST` - "Username can only contain letters, numbers, and underscores"

**6. Rate Limiting**
```bash
# Send 4 registration requests within 1 hour
for i in {1..4}; do
  curl -X POST http://localhost:8080/api/users/register \
    -H "Content-Type: application/json" \
    -d '{"email":"user'$i'@example.com","username":"user'$i'","password":"Password123!"}'
done
```
**Expected**: 4th request returns `429 TOO MANY REQUESTS`

---

### **2. User Login**
**Endpoint**: `POST /api/users/login`

#### **✅ Happy Path Tests**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "TestPassword123!"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "testuser@example.com",
      "username": "testuser",
      "role": "USER",
      "isEmailVerified": true,
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 900
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Invalid Email**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "nonexistent@example.com",
  "password": "TestPassword123!"
}
```
**Expected**: `401 UNAUTHORIZED` - "Invalid email or password"

**2. Wrong Password**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "WrongPassword123!"
}
```
**Expected**: `401 UNAUTHORIZED` - "Invalid email or password"

**3. Deactivated Account**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "deactivated@example.com",
  "password": "TestPassword123!"
}
```
**Expected**: `403 FORBIDDEN` - "Account is deactivated"

**4. Rate Limiting**
```bash
# Send 6 login attempts within 15 minutes
for i in {1..6}; do
  curl -X POST http://localhost:8080/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"email":"testuser@example.com","password":"WrongPassword123!"}'
done
```
**Expected**: 6th request returns `429 TOO MANY REQUESTS`

---

### **3. Token Refresh**
**Endpoint**: `POST /api/users/refresh-token`

#### **✅ Happy Path Tests**
```http
POST /api/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Missing Refresh Token**
```http
POST /api/users/refresh-token
Content-Type: application/json

{}
```
**Expected**: `400 BAD REQUEST` - "Refresh token is required"

**2. Invalid Refresh Token**
```http
POST /api/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "invalid-token"
}
```
**Expected**: `401 UNAUTHORIZED` - "Invalid refresh token"

**3. Expired Refresh Token**
```http
POST /api/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "expired-jwt-token"
}
```
**Expected**: `401 UNAUTHORIZED` - "Refresh token expired"

**4. Session Expired**
```http
POST /api/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "valid-jwt-with-expired-session"
}
```
**Expected**: `401 UNAUTHORIZED` - "Session expired or invalid"

**5. User Inactive**
```http
POST /api/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "valid-jwt-for-inactive-user"
}
```
**Expected**: `401 UNAUTHORIZED` - "User not found or inactive"

**6. Rate Limiting**
```bash
# Send 6 refresh attempts within 15 minutes
for i in {1..6}; do
  curl -X POST http://localhost:8080/api/users/refresh-token \
    -H "Content-Type: application/json" \
    -d '{"refreshToken":"test-token"}'
done
```
**Expected**: 6th request returns `429 TOO MANY REQUESTS`

---

### **4. Email Verification**
**Endpoint**: `POST /api/users/verify-email`

#### **✅ Happy Path Tests**
```http
POST /api/users/verify-email
Content-Type: application/json

{
  "email": "newuser@example.com",
  "verificationCode": "123456"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### **❌ Edge Cases & Error Tests**

**1. Invalid Verification Code**
```http
POST /api/users/verify-email
Content-Type: application/json

{
  "email": "newuser@example.com",
  "verificationCode": "000000"
}
```
**Expected**: `400 BAD REQUEST` - "Invalid verification code"

**2. Expired Verification Code**
```http
# Wait 11 minutes after registration, then try to verify
POST /api/users/verify-email
Content-Type: application/json

{
  "email": "newuser@example.com",
  "verificationCode": "123456"
}
```
**Expected**: `400 BAD REQUEST` - "Verification code has expired"

**3. Already Verified Email**
```http
POST /api/users/verify-email
Content-Type: application/json

{
  "email": "verified@example.com",
  "verificationCode": "123456"
}
```
**Expected**: `400 BAD REQUEST` - "Email is already verified"

---

### **5. Resend Verification Email**
**Endpoint**: `POST /api/users/resend-verification`

#### **✅ Happy Path Tests**
```http
POST /api/users/resend-verification
Content-Type: application/json

{
  "email": "newuser@example.com"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

#### **❌ Edge Cases & Error Tests**

**1. Already Verified Email**
```http
POST /api/users/resend-verification
Content-Type: application/json

{
  "email": "verified@example.com"
}
```
**Expected**: `400 BAD REQUEST` - "Email is already verified"

**2. Non-existent Email**
```http
POST /api/users/resend-verification
Content-Type: application/json

{
  "email": "nonexistent@example.com"
}
```
**Expected**: `404 NOT FOUND` - "User not found"

---

### **6. Forgot Password**
**Endpoint**: `POST /api/users/forgot-password`

#### **✅ Happy Path Tests**
```http
POST /api/users/forgot-password
Content-Type: application/json

{
  "email": "testuser@example.com"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

#### **❌ Edge Cases & Error Tests**

**1. Deactivated Account**
```http
POST /api/users/forgot-password
Content-Type: application/json

{
  "email": "deactivated@example.com"
}
```
**Expected**: `403 FORBIDDEN` - "Account is deactivated"

**2. Invalid Email Format**
```http
POST /api/users/forgot-password
Content-Type: application/json

{
  "email": "invalid-email"
}
```
**Expected**: `400 BAD REQUEST` - "Invalid email format"

**3. Rate Limiting**
```bash
# Send 4 forgot password requests within 1 hour
for i in {1..4}; do
  curl -X POST http://localhost:8080/api/users/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email":"testuser@example.com"}'
done
```
**Expected**: 4th request returns `429 TOO MANY REQUESTS`

---

### **7. Reset Password**
**Endpoint**: `POST /api/users/reset-password`

#### **✅ Happy Path Tests**
```http
POST /api/users/reset-password
Content-Type: application/json

{
  "email": "testuser@example.com",
  "resetToken": "123456",
  "newPassword": "NewSecurePassword123!"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### **❌ Edge Cases & Error Tests**

**1. Invalid Reset Token**
```http
POST /api/users/reset-password
Content-Type: application/json

{
  "email": "testuser@example.com",
  "resetToken": "000000",
  "newPassword": "NewSecurePassword123!"
}
```
**Expected**: `400 BAD REQUEST` - "Invalid reset token"

**2. Expired Reset Token**
```http
# Wait 16 minutes after forgot password request, then try to reset
POST /api/users/reset-password
Content-Type: application/json

{
  "email": "testuser@example.com",
  "resetToken": "123456",
  "newPassword": "NewSecurePassword123!"
}
```
**Expected**: `400 BAD REQUEST` - "Reset token has expired"

**3. Weak New Password**
```http
POST /api/users/reset-password
Content-Type: application/json

{
  "email": "testuser@example.com",
  "resetToken": "123456",
  "newPassword": "weak"
}
```
**Expected**: `400 BAD REQUEST` - "Password must contain at least one lowercase letter, one uppercase letter, and one number"

---

## 👤 **Current User Endpoints (Protected)**

### **8. Get Current User Profile**
**Endpoint**: `GET /api/users/me`

#### **✅ Happy Path Tests**
```http
GET /api/users/me
Authorization: Bearer <valid_token>
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "...",
    "email": "testuser@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "role": "USER",
    "isEmailVerified": true,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Missing Token**
```http
GET /api/users/me
```
**Expected**: `401 UNAUTHORIZED` - "Token missing"

**2. Invalid Token**
```http
GET /api/users/me
Authorization: Bearer invalid_token
```
**Expected**: `401 UNAUTHORIZED` - "Invalid token"

**3. Expired Token**
```http
GET /api/users/me
Authorization: Bearer <expired_token>
```
**Expected**: `401 UNAUTHORIZED` - "Token expired"

---

### **9. Update Current User Profile**
**Endpoint**: `PUT /api/users/me`

#### **✅ Happy Path Tests**
```http
PUT /api/users/me
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name",
  "username": "updateduser"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "...",
    "firstName": "Updated",
    "lastName": "Name",
    "username": "updateduser"
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Duplicate Username**
```http
PUT /api/users/me
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "username": "existinguser"
}
```
**Expected**: `409 CONFLICT` - "Username already taken"

**2. Invalid Username Format**
```http
PUT /api/users/me
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "username": "user@name"
}
```
**Expected**: `400 BAD REQUEST` - "Username can only contain letters, numbers, and underscores"

**3. Rate Limiting**
```bash
# Send 11 profile updates within 15 minutes
for i in {1..11}; do
  curl -X PUT http://localhost:8080/api/users/me \
    -H "Authorization: Bearer <valid_token>" \
    -H "Content-Type: application/json" \
    -d '{"firstName":"Update'$i'"}'
done
```
**Expected**: 11th request returns `429 TOO MANY REQUESTS`

---

### **10. Change Password**
**Endpoint**: `POST /api/users/me/change-password`

#### **✅ Happy Path Tests**
```http
POST /api/users/me/change-password
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "currentPassword": "TestPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### **❌ Edge Cases & Error Tests**

**1. Wrong Current Password**
```http
POST /api/users/me/change-password
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "currentPassword": "WrongPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```
**Expected**: `400 BAD REQUEST` - "Current password is incorrect"

**2. Weak New Password**
```http
POST /api/users/me/change-password
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "currentPassword": "TestPassword123!",
  "newPassword": "weak"
}
```
**Expected**: `400 BAD REQUEST` - "Password must contain at least one lowercase letter, one uppercase letter, and one number"

---

### **11. Deactivate Current User Account**
**Endpoint**: `POST /api/users/me/deactivate`

#### **✅ Happy Path Tests**
```http
POST /api/users/me/deactivate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "password": "TestPassword123!",
  "reason": "Taking a break from the platform"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Account deactivated successfully. You can request reactivation through support.",
  "data": {
    "deactivatedAt": "...",
    "reason": "Taking a break from the platform"
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Missing Password**
```http
POST /api/users/me/deactivate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "reason": "Taking a break"
}
```
**Expected**: `400 BAD REQUEST` - "Password is required to deactivate account"

**2. Wrong Password**
```http
POST /api/users/me/deactivate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "password": "WrongPassword123!",
  "reason": "Taking a break"
}
```
**Expected**: `400 BAD REQUEST` - "Current password is incorrect"

---

## 🔧 **User Management Endpoints (Admin)**

### **12. Get All Users**
**Endpoint**: `GET /api/users`

#### **✅ Happy Path Tests**
```http
GET /api/users?page=1&limit=10&role=USER&isActive=true
Authorization: Bearer <admin_token>
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "data": [
      {
        "id": "...",
        "email": "user1@example.com",
        "username": "user1",
        "role": "USER",
        "isActive": true
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Insufficient Permissions**
```http
GET /api/users
Authorization: Bearer <user_token>
```
**Expected**: `403 FORBIDDEN` - "Insufficient permissions"

**2. Invalid Pagination Parameters**
```http
GET /api/users?page=0&limit=1000
Authorization: Bearer <admin_token>
```
**Expected**: `400 BAD REQUEST` - "Page must be positive"

**3. Invalid Role Filter**
```http
GET /api/users?role=INVALID_ROLE
Authorization: Bearer <admin_token>
```
**Expected**: `400 BAD REQUEST` - "Invalid role"

---

### **13. Get User by ID**
**Endpoint**: `GET /api/users/:id`

#### **✅ Happy Path Tests**
```http
GET /api/users/507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "user",
    "role": "USER",
    "isActive": true
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Invalid ObjectId Format**
```http
GET /api/users/invalid-id
Authorization: Bearer <admin_token>
```
**Expected**: `400 BAD REQUEST` - "Invalid ObjectId format"

**2. User Not Found**
```http
GET /api/users/507f1f77bcf86cd799439012
Authorization: Bearer <admin_token>
```
**Expected**: `404 NOT FOUND` - "User not found"

---

### **14. Update User**
**Endpoint**: `PUT /api/users/:id`

#### **✅ Happy Path Tests**
```http
PUT /api/users/507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name",
  "isActive": true
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "Updated",
    "lastName": "Name",
    "isActive": true
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Duplicate Username**
```http
PUT /api/users/507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "existinguser"
}
```
**Expected**: `409 CONFLICT` - "Username already taken"

**2. User Not Found**
```http
PUT /api/users/507f1f77bcf86cd799439012
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "Updated"
}
```
**Expected**: `404 NOT FOUND` - "User not found"

---

### **15. Delete User**
**Endpoint**: `DELETE /api/users/:id`

#### **✅ Happy Path Tests**
```http
DELETE /api/users/507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### **❌ Edge Cases & Error Tests**

**1. Insufficient Permissions (User Token)**
```http
DELETE /api/users/507f1f77bcf86cd799439011
Authorization: Bearer <user_token>
```
**Expected**: `403 FORBIDDEN` - "Insufficient permissions"

**2. User Not Found**
```http
DELETE /api/users/507f1f77bcf86cd799439012
Authorization: Bearer <admin_token>
```
**Expected**: `404 NOT FOUND` - "User not found"

---

## 👑 **Advanced Admin Management Endpoints**

### **16. Change User Role**
**Endpoint**: `PATCH /api/users/:userId/role`

#### **✅ Happy Path Tests**
```http
PATCH /api/users/507f1f77bcf86cd799439011/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "MODERATOR",
  "reason": "Promoted for good performance"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "role": "MODERATOR",
    "updatedAt": "..."
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Admin Trying to Modify SUPER_ADMIN**
```http
PATCH /api/users/507f1f77bcf86cd799439011/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "USER"
}
```
**Expected**: `403 FORBIDDEN` - "Admins cannot modify super-admin accounts"

**2. Admin Trying to Assign SUPER_ADMIN Role**
```http
PATCH /api/users/507f1f77bcf86cd799439011/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "SUPER_ADMIN"
}
```
**Expected**: `403 FORBIDDEN` - "Admins cannot assign super-admin role"

**3. User Not Found**
```http
PATCH /api/users/507f1f77bcf86cd799439012/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "MODERATOR"
}
```
**Expected**: `404 NOT FOUND` - "User not found"

---

### **17. Toggle Account Status**
**Endpoint**: `PATCH /api/users/:userId/status`

#### **✅ Happy Path Tests**
```http
PATCH /api/users/507f1f77bcf86cd799439011/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false,
  "reason": "Violation of terms of service"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User account deactivated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "isActive": false,
    "updatedAt": "..."
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Admin Trying to Deactivate SUPER_ADMIN**
```http
PATCH /api/users/507f1f77bcf86cd799439011/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false,
  "reason": "Suspension"
}
```
**Expected**: `403 FORBIDDEN` - "Admins cannot modify super-admin accounts"

**2. User Not Found**
```http
PATCH /api/users/507f1f77bcf86cd799439012/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}
```
**Expected**: `404 NOT FOUND` - "User not found"

---

### **18. Bulk User Operations**
**Endpoint**: `POST /api/users/bulk`

#### **✅ Happy Path Tests**
```http
POST /api/users/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "operation": "activate",
  "reason": "Bulk activation of verified users"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Bulk operation 'activate' completed successfully",
  "data": {
    "operation": "activate",
    "affectedCount": 2,
    "affectedUserIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
  }
}
```

#### **❌ Edge Cases & Error Tests**

**1. Admin Trying to Modify SUPER_ADMIN Users**
```http
POST /api/users/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "operation": "deactivate"
}
```
**Expected**: `403 FORBIDDEN` - "Admins cannot modify super-admin accounts"

**2. Admin Trying to Assign SUPER_ADMIN Role**
```http
POST /api/users/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userIds": ["507f1f77bcf86cd799439011"],
  "operation": "change_role",
  "role": "SUPER_ADMIN"
}
```
**Expected**: `403 FORBIDDEN` - "Admins cannot assign super-admin role"

**3. Invalid Operation**
```http
POST /api/users/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userIds": ["507f1f77bcf86cd799439011"],
  "operation": "invalid_operation"
}
```
**Expected**: `400 BAD REQUEST` - "Invalid operation specified"

**4. Missing Role for Change Role Operation**
```http
POST /api/users/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userIds": ["507f1f77bcf86cd799439011"],
  "operation": "change_role"
}
```
**Expected**: `400 BAD REQUEST` - "Role is required for change_role operation"

**5. Too Many Users**
```http
POST /api/users/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userIds": ["id1", "id2", "id3", "id4", "id5", "id6", "id7", "id8", "id9", "id10", "id11", "id12", "id13", "id14", "id15", "id16", "id17", "id18", "id19", "id20", "id21", "id22", "id23", "id24", "id25", "id26", "id27", "id28", "id29", "id30", "id31", "id32", "id33", "id34", "id35", "id36", "id37", "id38", "id39", "id40", "id41", "id42", "id43", "id44", "id45", "id46", "id47", "id48", "id49", "id50", "id51"],
  "operation": "activate"
}
```
**Expected**: `400 BAD REQUEST` - "Maximum 50 users per operation"

---

## 🔒 **Security & Authorization Tests**

### **Role-Based Access Control (RBAC)**

#### **User Role Hierarchy Test**
```bash
# Test that each role can access appropriate endpoints
# USER: Can only access own profile and basic operations
# MODERATOR: Can read user data
# INSTRUCTOR: Can read user data
# ADMIN: Can manage users but not SUPER_ADMIN
# SUPER_ADMIN: Can manage all users including other SUPER_ADMIN
```

#### **Token Security Tests**

**1. Token Tampering**
```http
GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE2MzQ1Njc4NzQsImV4cCI6MTYzNDU2ODc3NH0.tampered_signature
```
**Expected**: `401 UNAUTHORIZED` - "Invalid token"

**2. Expired Token**
```http
# Use a token that has expired (15 minutes)
GET /api/users/me
Authorization: Bearer <expired_token>
```
**Expected**: `401 UNAUTHORIZED` - "Token expired"

**3. Missing Authorization Header**
```http
GET /api/users/me
```
**Expected**: `401 UNAUTHORIZED` - "Token missing"

---

## 📊 **Performance & Load Tests**

### **Rate Limiting Tests**
```bash
# Test all rate-limited endpoints
# Registration: 3/hour
# Login: 5/15min
# Password Reset: 3/hour
# Profile Updates: 10/15min
# Admin Operations: 100/hour
```

### **Database Performance Tests**
```bash
# Test with large datasets
# 1000+ users
# Complex queries with filters
# Pagination performance
```

---

## 🧪 **Automated Testing Scripts**

### **Basic Test Suite**
```bash
#!/bin/bash

BASE_URL="http://localhost:8080/api/users"

echo "🧪 Starting Authentication & User Management Tests..."

# Test 1: User Registration
echo "📝 Testing User Registration..."
curl -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"TestPassword123!","firstName":"Test","lastName":"User"}'

echo -e "\n"

# Test 2: User Login
echo "🔐 Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}')

echo "$LOGIN_RESPONSE"

# Extract token for subsequent tests
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')

echo -e "\n"

# Test 3: Get Current User
echo "👤 Testing Get Current User..."
curl -X GET "$BASE_URL/me" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n"

echo "✅ Basic tests completed!"
```

### **Edge Case Test Suite**
```bash
#!/bin/bash

BASE_URL="http://localhost:8080/api/users"

echo "🧪 Starting Edge Case Tests..."

# Test 1: Invalid Email Format
echo "📧 Testing Invalid Email Format..."
curl -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","username":"testuser","password":"TestPassword123!"}'

echo -e "\n"

# Test 2: Weak Password
echo "🔒 Testing Weak Password..."
curl -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"weak"}'

echo -e "\n"

# Test 3: Duplicate Email
echo "🔄 Testing Duplicate Email..."
curl -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"existing@example.com","username":"newuser","password":"TestPassword123!"}'

echo -e "\n"

echo "✅ Edge case tests completed!"
```

---

## 📋 **Test Checklist**

### **Authentication Tests**
- [ ] User registration (happy path)
- [ ] User registration (duplicate email)
- [ ] User registration (duplicate username)
- [ ] User registration (invalid email)
- [ ] User registration (weak password)
- [ ] User registration (rate limiting)
- [ ] User login (happy path)
- [ ] User login (invalid credentials)
- [ ] User login (deactivated account)
- [ ] User login (rate limiting)
- [ ] Email verification (happy path)
- [ ] Email verification (invalid code)
- [ ] Email verification (expired code)
- [ ] Email verification (already verified)
- [ ] Resend verification (happy path)
- [ ] Resend verification (already verified)
- [ ] Forgot password (happy path)
- [ ] Forgot password (deactivated account)
- [ ] Forgot password (rate limiting)
- [ ] Reset password (happy path)
- [ ] Reset password (invalid token)
- [ ] Reset password (expired token)
- [ ] Reset password (weak password)

### **Current User Tests**
- [ ] Get current user (happy path)
- [ ] Get current user (missing token)
- [ ] Get current user (invalid token)
- [ ] Get current user (expired token)
- [ ] Update current user (happy path)
- [ ] Update current user (duplicate username)
- [ ] Update current user (invalid username)
- [ ] Update current user (rate limiting)
- [ ] Change password (happy path)
- [ ] Change password (wrong current password)
- [ ] Change password (weak new password)
- [ ] Deactivate account (happy path)
- [ ] Deactivate account (missing password)
- [ ] Deactivate account (wrong password)

### **User Management Tests**
- [ ] Get all users (happy path)
- [ ] Get all users (insufficient permissions)
- [ ] Get all users (invalid pagination)
- [ ] Get all users (invalid filters)
- [ ] Get user by ID (happy path)
- [ ] Get user by ID (invalid ID format)
- [ ] Get user by ID (user not found)
- [ ] Update user (happy path)
- [ ] Update user (duplicate username)
- [ ] Update user (user not found)
- [ ] Delete user (happy path)
- [ ] Delete user (insufficient permissions)
- [ ] Delete user (user not found)

### **Admin Management Tests**
- [ ] Change user role (happy path)
- [ ] Change user role (admin modifying super-admin)
- [ ] Change user role (admin assigning super-admin)
- [ ] Change user role (user not found)
- [ ] Toggle account status (happy path)
- [ ] Toggle account status (admin deactivating super-admin)
- [ ] Toggle account status (user not found)
- [ ] Bulk operations (happy path)
- [ ] Bulk operations (admin modifying super-admin)
- [ ] Bulk operations (admin assigning super-admin)
- [ ] Bulk operations (invalid operation)
- [ ] Bulk operations (missing role)
- [ ] Bulk operations (too many users)

### **Security Tests**
- [ ] Token tampering
- [ ] Expired tokens
- [ ] Missing authorization headers
- [ ] Role-based access control
- [ ] Rate limiting enforcement
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## 🎯 **Test Results Summary**

After running all tests, you should have:

- ✅ **All happy path scenarios working correctly**
- ✅ **All edge cases handled appropriately**
- ✅ **Security measures functioning properly**
- ✅ **Rate limiting working as expected**
- ✅ **Authorization and permissions enforced**
- ✅ **Error messages clear and helpful**
- ✅ **Performance within acceptable limits**

This comprehensive test guide ensures that all authentication and user management functionality is thoroughly tested and ready for production use. 