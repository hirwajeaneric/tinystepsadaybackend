# Role-Based Access Control (RBAC) Guide

## Overview

This application implements a clean and simple Role-Based Access Control (RBAC) system with role hierarchy. The system supports five user roles with different levels of access, where higher roles inherit permissions from lower roles.

## User Roles

### Role Hierarchy (from lowest to highest privileges)

1. **USER** (Level 1)
   - Basic user with limited access
   - Can manage their own profile and account
   - Can access `/me` endpoints

2. **MODERATOR** (Level 2)
   - Can read user information
   - Can moderate content and manage reports
   - Inherits all USER permissions

3. **INSTRUCTOR** (Level 3)
   - Can create and manage courses
   - Can manage students
   - Inherits all MODERATOR permissions

4. **ADMIN** (Level 4)
   - Can manage users and system settings
   - Can view analytics
   - Can delete users
   - Inherits all INSTRUCTOR permissions

5. **SUPER_ADMIN** (Level 5)
   - Highest level of access
   - Can manage admins and system configuration
   - Has access to all resources
   - Inherits all ADMIN permissions

## Authorization Middleware

### Available Middleware Functions

#### 1. `authorize(...roles: UserRole[])`
Generic role-based authorization that checks if the user has any of the specified roles.

```typescript
// Example: Allow ADMIN and SUPER_ADMIN
router.get('/admin-only', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), controller.adminOnly);
```

#### 2. `requireSuperAdmin`
Only allows SUPER_ADMIN access.

```typescript
router.get('/super-admin', requireSuperAdmin, controller.superAdminOnly);
```

#### 3. `requireAdmin`
Allows ADMIN and SUPER_ADMIN access.

```typescript
router.get('/admin', requireAdmin, controller.adminOnly);
```

#### 4. `requireInstructor`
Allows INSTRUCTOR, ADMIN, and SUPER_ADMIN access.

```typescript
router.get('/instructor', requireInstructor, controller.instructorOnly);
```

#### 5. `requireModerator`
Allows MODERATOR, INSTRUCTOR, ADMIN, and SUPER_ADMIN access.

```typescript
router.get('/moderator', requireModerator, controller.moderatorOnly);
```

#### 6. `requireSelfOrAdmin(paramName: string = 'userId')`
Allows users to access their own data or admins to access any user's data.

```typescript
router.get('/users/:userId/profile', requireSelfOrAdmin('userId'), controller.getUserProfile);
```

#### 7. `requireResourceOwnership(resourceType: string, idParam: string = 'id')`
Checks if the user owns the resource or is an admin.

```typescript
router.put('/posts/:id', requireResourceOwnership('post'), controller.updatePost);
```

## Route Protection Examples

### User Management Routes

```typescript
// Get all users (MODERATOR and above)
router.get('/users', 
  requireModerator, 
  validate({ query: getUsersQuerySchema }), 
  userController.getUsers
);

// Get specific user (MODERATOR and above)
router.get('/users/:id', 
  requireModerator, 
  validate({ params: z.object({ id: objectIdSchema }) }), 
  userController.getUserById
);

// Update user (MODERATOR and above)
router.put('/users/:id', 
  requireModerator, 
  validate({ params: z.object({ id: objectIdSchema }), body: updateUserSchema }), 
  userController.updateUser
);

// Delete user (ADMIN and above only)
router.delete('/users/:id', 
  requireAdmin, 
  validate({ params: z.object({ id: objectIdSchema }) }), 
  userController.deleteUser
);
```

### Current User Routes

```typescript
// Get own profile (any authenticated user)
router.get('/me', userController.getCurrentUser);

// Update own profile (any authenticated user)
router.put('/me', 
  validate({ body: updateUserSchema }), 
  userController.updateCurrentUser
);

// Change own password (any authenticated user)
router.post('/me/change-password', 
  validate({ body: changePasswordSchema }), 
  userController.changePassword
);

// Deactivate own account (any authenticated user)
router.post('/me/deactivate', userController.deactivateCurrentUser);
```

## Role-Based Access Matrix

| Endpoint | Method | USER | MODERATOR | INSTRUCTOR | ADMIN | SUPER_ADMIN |
|----------|--------|------|-----------|------------|-------|-------------|
| `/me` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/me` | PUT | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/me/change-password` | POST | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/me/deactivate` | POST | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/users` | GET | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/users/:id` | GET | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/users/:id` | PUT | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/users/:id` | DELETE | ❌ | ❌ | ❌ | ✅ | ✅ |

## Error Responses

### Authentication Required (401)
```json
{
  "success": false,
  "error": "AUTHENTICATION_REQUIRED",
  "message": "Authentication required"
}
```

### Insufficient Permissions (403)
```json
{
  "success": false,
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "Insufficient permissions to access this resource"
}
```

## Best Practices

1. **Use the most restrictive role** that allows the required functionality
2. **Leverage role hierarchy** - higher roles automatically get access to lower role endpoints
3. **Keep it simple** - avoid mixing different authorization patterns
4. **Log unauthorized access attempts** for security monitoring
5. **Test authorization** with different user roles
6. **Document role requirements** for each route

## Security Considerations

1. **Role hierarchy** ensures higher roles inherit permissions from lower roles
2. **Simple and clear** authorization logic reduces complexity and potential bugs
3. **Resource ownership** ensures users can only access their own data
4. **Comprehensive logging** tracks all authorization attempts
5. **Rate limiting** prevents abuse of sensitive endpoints
6. **Input validation** ensures data integrity

## Testing Authorization

When testing the RBAC system:

1. Create test users with different roles
2. Test each endpoint with various user roles
3. Verify that unauthorized access is properly denied
4. Check that error messages don't leak sensitive information
5. Ensure that role hierarchy works correctly
6. Test resource ownership restrictions

## Why This Approach?

### Benefits of Role-Based Authorization:

1. **Simplicity**: Easy to understand and maintain
2. **Clear Hierarchy**: Natural progression of permissions
3. **No Redundancy**: Avoids confusion between roles and permissions
4. **Performance**: Faster authorization checks
5. **Maintainability**: Less code to maintain and debug

### Avoiding Permission-Role Confusion:

The previous approach had both roles AND permissions, which created:
- **Redundancy**: If someone has ADMIN role, they automatically have all user permissions
- **Confusion**: Developers had to choose between role-based or permission-based middleware
- **Maintenance Overhead**: Two systems to maintain and keep in sync
- **Inconsistency**: Some routes used roles, others used permissions

This simplified approach eliminates these issues by using only role-based authorization with a clear hierarchy. 