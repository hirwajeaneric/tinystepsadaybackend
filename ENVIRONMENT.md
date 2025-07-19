# Environment Configuration

This document lists all the environment variables required for the Tiny Steps A Day backend application.

## Quick Setup

1. Copy the environment variables below into a `.env` file in the root directory
2. Replace the placeholder values with your actual configuration
3. Never commit the `.env` file to version control

## Required Environment Variables

### Database Configuration
```env
# MongoDB connection string
DATABASE_URL="mongodb://localhost:27017/tinystepsaday"
```

### Server Configuration
```env
# Server port (default: 3000)
PORT=3000

# Environment (development, production, test)
NODE_ENV=development

# Frontend URL for email links and CORS
FRONTEND_URL="http://localhost:3000"

# Allowed origins for CORS (comma-separated for production)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
```

### JWT Configuration
```env
# Secret key for JWT token signing (CHANGE IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Session secret for secure sessions
SESSION_SECRET="your-super-secret-session-key-change-in-production"

# Token expiry times
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"
PASSWORD_RESET_EXPIRY="1h"
EMAIL_VERIFICATION_EXPIRY="24h"
```

### Security Configuration
```env
# Rate limiting settings
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=15
SESSION_TIMEOUT=30
MAX_SESSIONS_PER_USER=5
```

### Email Configuration
```env
# Resend API key for email sending
RESEND_API_KEY="your_resend_api_key_here"

# Email sender configuration
EMAIL_FROM="Tiny Steps A Day <hello@tinystepsaday.com>"
EMAIL_REPLY_TO="hello@tinystepsaday.com"
EMAIL_SUBJECT_PREFIX="[Tiny Steps A Day]"
```

### Logging Configuration
```env
# Log level (error, warn, info, debug)
LOG_LEVEL="info"
```

### Development & Testing
```env
# Package version (auto-populated by npm)
npm_package_version="1.0.0"
```

## Optional Environment Variables

### Redis Configuration (for future caching and rate limiting)
```env
# REDIS_URL="redis://localhost:6379"
```

### File Upload Configuration (for future features)
```env
# UPLOAD_DIR="uploads"
# MAX_FILE_SIZE="10485760"
# ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp,application/pdf"
```

### Cloud Storage (AWS S3) - for future features
```env
# AWS_ACCESS_KEY_ID="your-aws-access-key"
# AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
# AWS_REGION="us-east-1"
# AWS_S3_BUCKET="your-s3-bucket-name"
```

### Cloud Storage (Cloudinary) - for future features
```env
# CLOUDINARY_CLOUD_NAME="your-cloud-name"
# CLOUDINARY_API_KEY="your-api-key"
# CLOUDINARY_API_SECRET="your-api-secret"
```

### Payment Processing (Stripe) - for future features
```env
# STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
# STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
# STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

### Feature Flags (for future features)
```env
# ENABLE_EMAIL_VERIFICATION=true
# ENABLE_TWO_FACTOR_AUTH=true
# ENABLE_FILE_UPLOAD=true
# ENABLE_PAYMENT_PROCESSING=true
```

## Production Configuration

For production deployment, use these recommended values:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/tinystepsaday?retryWrites=true&w=majority"

# Environment
NODE_ENV="production"

# Frontend
FRONTEND_URL="https://your-frontend-domain.com"
ALLOWED_ORIGINS="https://your-frontend-domain.com"

# Security (use strong, unique secrets)
JWT_SECRET="your-production-jwt-secret-key-here"
SESSION_SECRET="your-production-session-secret-key-here"

# Email
RESEND_API_KEY="your-production-resend-api-key"
EMAIL_FROM="Tiny Steps A Day <noreply@yourdomain.com>"
EMAIL_REPLY_TO="support@yourdomain.com"

# Logging
LOG_LEVEL="warn"
```

## Environment Variable Details

### DATABASE_URL
- **Required**: Yes
- **Type**: String
- **Description**: MongoDB connection string
- **Example**: `mongodb://localhost:27017/tinystepsaday`
- **Production**: Use MongoDB Atlas or other cloud MongoDB service

### PORT
- **Required**: No (default: 3000)
- **Type**: Number
- **Description**: Server port number
- **Example**: `3000`

### NODE_ENV
- **Required**: No (default: development)
- **Type**: String
- **Values**: `development`, `production`, `test`
- **Description**: Application environment

### FRONTEND_URL
- **Required**: Yes
- **Type**: String
- **Description**: Frontend application URL for email links
- **Example**: `http://localhost:3000` (dev), `https://app.tinystepsaday.com` (prod)

### ALLOWED_ORIGINS
- **Required**: No (default: true in development)
- **Type**: String (comma-separated)
- **Description**: CORS allowed origins
- **Example**: `http://localhost:3000,http://localhost:3001`

### JWT_SECRET
- **Required**: Yes
- **Type**: String
- **Description**: Secret key for JWT token signing
- **Security**: Use a strong, random string (min 32 characters)

### SESSION_SECRET
- **Required**: No (has default)
- **Type**: String
- **Description**: Secret key for session management
- **Security**: Use a strong, random string (min 32 characters)

### ACCESS_TOKEN_EXPIRY
- **Required**: No (default: 15m)
- **Type**: String
- **Description**: JWT access token expiry time
- **Example**: `15m`, `1h`, `7d`

### REFRESH_TOKEN_EXPIRY
- **Required**: No (default: 7d)
- **Type**: String
- **Description**: JWT refresh token expiry time
- **Example**: `7d`, `30d`

### PASSWORD_RESET_EXPIRY
- **Required**: No (default: 1h)
- **Type**: String
- **Description**: Password reset token expiry time
- **Example**: `1h`, `24h`

### EMAIL_VERIFICATION_EXPIRY
- **Required**: No (default: 24h)
- **Type**: String
- **Description**: Email verification token expiry time
- **Example**: `24h`, `7d`

### MAX_LOGIN_ATTEMPTS
- **Required**: No (default: 5)
- **Type**: Number
- **Description**: Maximum failed login attempts before lockout

### LOCKOUT_DURATION
- **Required**: No (default: 15)
- **Type**: Number (minutes)
- **Description**: Account lockout duration after max login attempts

### SESSION_TIMEOUT
- **Required**: No (default: 30)
- **Type**: Number (days)
- **Description**: User session timeout duration

### MAX_SESSIONS_PER_USER
- **Required**: No (default: 5)
- **Type**: Number
- **Description**: Maximum active sessions per user

### RESEND_API_KEY
- **Required**: Yes
- **Type**: String
- **Description**: Resend API key for email sending
- **Get it**: [Resend Dashboard](https://resend.com/api-keys)

### EMAIL_FROM
- **Required**: No (has default)
- **Type**: String
- **Description**: Email sender address
- **Example**: `Tiny Steps A Day <hello@tinystepsaday.com>`

### EMAIL_REPLY_TO
- **Required**: No (has default)
- **Type**: String
- **Description**: Email reply-to address
- **Example**: `hello@tinystepsaday.com`

### EMAIL_SUBJECT_PREFIX
- **Required**: No (has default)
- **Type**: String
- **Description**: Prefix for email subjects
- **Example**: `[Tiny Steps A Day]`

### LOG_LEVEL
- **Required**: No (default: info)
- **Type**: String
- **Values**: `error`, `warn`, `info`, `debug`
- **Description**: Application logging level

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for JWT_SECRET and SESSION_SECRET
3. **Rotate secrets regularly** in production
4. **Use environment-specific values** (different for dev/staging/prod)
5. **Validate environment variables** on application startup
6. **Use secure connection strings** in production
7. **Limit CORS origins** in production to specific domains

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL format
   - Ensure MongoDB is running
   - Verify network connectivity

2. **JWT errors**
   - Ensure JWT_SECRET is set
   - Check token expiry times
   - Verify JWT_SECRET is consistent across deployments

3. **Email sending failed**
   - Verify RESEND_API_KEY is valid
   - Check email configuration
   - Ensure sender domain is verified in Resend

4. **CORS errors**
   - Check ALLOWED_ORIGINS configuration
   - Verify FRONTEND_URL matches CORS settings
   - Ensure credentials are properly configured

### Validation

The application validates required environment variables on startup. Missing or invalid variables will cause the application to fail with clear error messages. 