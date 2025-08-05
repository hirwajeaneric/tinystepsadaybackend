# Authentication System Update Guide

This guide documents the updated authentication system that implements new token lifetime requirements and refresh token usage limits based on the "Remember Me" option.

## 🎯 **New Authentication Requirements**

### **Token Lifetime Changes:**
- **Access Token**: 30 minutes (previously 15 minutes)
- **Refresh Token**: 14 days (previously 7 days)

### **Refresh Token Usage Limits:**
- **Without "Remember Me"**: Maximum 8 refresh token occurrences
- **With "Remember Me"**: Unlimited refresh tokens for 14 days (effectively 10,080 refreshes at 2-minute intervals)

## 🏗️ **System Architecture**

### **Database Schema Updates**

The `UserSession` model has been enhanced with new fields:

```prisma
model UserSession {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String   @db.ObjectId
  refreshToken String   @unique
  deviceInfo   String?
  ipAddress    String?
  userAgent    String?
  isActive     Boolean  @default(true)
  expiresAt    DateTime
  rememberMe   Boolean  @default(false)    // NEW: Tracks remember me choice
  refreshCount Int      @default(0)        // NEW: Tracks refresh usage
  maxRefreshes Int      @default(8)        // NEW: Sets refresh limit
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_sessions")
}
```

### **Configuration Updates**

```typescript
// src/config/security.ts
export const securityConfig: SecurityConfig = {
  // Updated token expiry times
  accessTokenExpiry: '30m',    // 30 minutes
  refreshTokenExpiry: '14d',   // 14 days
  
  // New refresh token limits
  maxRefreshTokensWithoutRememberMe: 8,
  maxRefreshTokensWithRememberMe: 10080, // 14 days worth of refreshes
};
```

## 🔐 **Authentication Flow**

### **1. Login Process**

```typescript
// User logs in with remember me option
const loginData = {
  email: "user@example.com",
  password: "password123",
  rememberMe: true  // or false
};

// Backend processes login
const session = await prisma.userSession.create({
  data: {
    userId: user.id,
    refreshToken: refreshTokenString,
    expiresAt: rememberMe ? 14DaysFromNow : 8HoursFromNow,
    rememberMe: rememberMe,
    refreshCount: 0,
    maxRefreshes: rememberMe ? 10080 : 8,
  }
});

// Generate tokens
const accessToken = jwt.sign(payload, secret, { expiresIn: '30m' });
const refreshToken = jwt.sign(payload, secret, { expiresIn: '14d' });
```

### **2. Token Refresh Process**

```typescript
// When refreshing tokens
const session = await prisma.userSession.findUnique({
  where: { id: sessionId },
  select: { 
    isActive: true, 
    expiresAt: true, 
    refreshCount: true, 
    maxRefreshes: true,
    rememberMe: true 
  }
});

// Check refresh limits
if (session.refreshCount >= session.maxRefreshes) {
  // Deactivate session and require re-login
  await prisma.userSession.update({
    where: { id: sessionId },
    data: { isActive: false }
  });
  throw new Error('Refresh token limit reached');
}

// Increment refresh count and generate new tokens
await prisma.userSession.update({
  where: { id: sessionId },
  data: { refreshCount: { increment: 1 } }
});
```

## 📱 **Frontend Integration**

### **Token Manager Updates**

```typescript
// src/utils/tokenManager.ts
private setupAutoRefresh() {
  // Refresh every 29 minutes (before 30-minute expiry)
  this.refreshInterval = setInterval(() => {
    this.refreshToken();
  }, 29 * 60 * 1000); // 29 minutes
}
```

### **Auth Store Integration**

```typescript
// src/store/authStore.ts
login: async (email: string, password: string, rememberMe: boolean = false) => {
  const response = await loginApi({ email, password, rememberMe });
  // ... handle response
}
```

### **Server-Side Authentication**

```typescript
// src/lib/auth/server.ts
export async function setServerAuthTokens(token: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  // Access token: 30 minutes
  cookieStore.set('auth-token', token, {
    maxAge: 30 * 60, // 30 minutes
  });

  // Refresh token: 14 days
  cookieStore.set('refresh-token', refreshToken, {
    maxAge: 14 * 24 * 60 * 60, // 14 days
  });
}
```

## 🔄 **Refresh Token Usage Scenarios**

### **Scenario 1: Without "Remember Me"**
- **Session Duration**: 8 hours
- **Max Refreshes**: 8
- **Access Token Lifetime**: 30 minutes
- **Behavior**: After 8 refreshes (4 hours), session expires and user must re-login

### **Scenario 2: With "Remember Me"**
- **Session Duration**: 14 days
- **Max Refreshes**: 10,080 (unlimited for practical purposes)
- **Access Token Lifetime**: 30 minutes
- **Behavior**: Session remains active for 14 days with automatic token refresh

## 🛡️ **Security Features**

### **1. Refresh Token Tracking**
- Each refresh increments a counter
- Limits enforced based on remember me choice
- Automatic session deactivation when limits reached

### **2. Session Management**
- Sessions expire based on remember me choice
- Inactive sessions are automatically cleaned up
- Device and IP tracking for security

### **3. Token Security**
- Short-lived access tokens (30 minutes)
- Long-lived refresh tokens (14 days) with usage limits
- HTTP-only cookies for server-side storage
- Secure token refresh mechanism

## 📊 **Monitoring & Logging**

### **Authentication Logs**
```typescript
logger.info('User authenticated successfully:', { 
  userId: user.id, 
  email: user.email, 
  rememberMe: rememberMe,
  maxRefreshes: maxRefreshes 
});

logger.info('Access token refreshed successfully:', { 
  userId: user.id, 
  sessionId: sessionId,
  refreshCount: session.refreshCount + 1,
  maxRefreshes: session.maxRefreshes,
  rememberMe: session.rememberMe
});
```

### **Error Handling**
```typescript
// Refresh limit reached
if (session.refreshCount >= session.maxRefreshes) {
  throw new ValidationError('Refresh token limit reached. Please log in again.');
}

// Session expired
if (new Date() > session.expiresAt) {
  throw new ValidationError('Session expired or invalid');
}
```

## 🔧 **Migration Guide**

### **Database Migration**
```bash
# Generate and apply Prisma migration
npx prisma migrate dev --name add-refresh-token-tracking

# Update Prisma client
npx prisma generate
```

### **Environment Variables**
```bash
# Optional: Override default values
ACCESS_TOKEN_EXPIRY=30m
REFRESH_TOKEN_EXPIRY=14d
MAX_REFRESH_TOKENS_WITHOUT_REMEMBER_ME=8
MAX_REFRESH_TOKENS_WITH_REMEMBER_ME=10080
```

### **Frontend Updates**
1. Update token refresh intervals to 29 minutes
2. Ensure remember me option is passed to login API
3. Update server-side cookie expiry times
4. Test both remember me scenarios

## 🧪 **Testing Scenarios**

### **Test Case 1: Normal Login (No Remember Me)**
1. Login without remember me
2. Verify session expires after 8 refreshes
3. Confirm user must re-login after limit reached

### **Test Case 2: Remember Me Login**
1. Login with remember me
2. Verify session remains active for 14 days
3. Confirm unlimited refreshes within time limit

### **Test Case 3: Token Refresh**
1. Verify access tokens expire after 30 minutes
2. Confirm refresh tokens work correctly
3. Test refresh count tracking

### **Test Case 4: Session Cleanup**
1. Verify expired sessions are cleaned up
2. Test session deactivation on limit reached
3. Confirm security measures work correctly

## 📈 **Performance Considerations**

### **Token Refresh Optimization**
- Refresh tokens 1 minute before expiry
- Automatic cleanup of expired sessions
- Efficient database queries for session validation

### **Memory Management**
- Limited session storage for non-remember me users
- Automatic session cleanup
- Efficient token validation

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"Refresh token limit reached"**
   - User needs to re-login
   - Check remember me setting
   - Verify session expiry times

2. **"Session expired"**
   - Session duration exceeded
   - Check remember me configuration
   - Verify database session records

3. **Token refresh failures**
   - Check network connectivity
   - Verify token validity
   - Check refresh count limits

### **Debug Mode**
```typescript
// Enable detailed logging
logger.debug('Token refresh attempt:', {
  sessionId,
  refreshCount,
  maxRefreshes,
  rememberMe
});
```

This updated authentication system provides enhanced security with flexible session management based on user preferences, while maintaining optimal performance and user experience. 