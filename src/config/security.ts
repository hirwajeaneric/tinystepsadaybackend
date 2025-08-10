import { SecurityConfig } from '../types/auth';

// Security Configuration
export const securityConfig: SecurityConfig = {
  // Token Configuration
  accessTokenExpiry: process.env['ACCESS_TOKEN_EXPIRY'] || '30m',
  refreshTokenExpiry: process.env['REFRESH_TOKEN_EXPIRY'] || '14d',
  passwordResetExpiry: process.env['PASSWORD_RESET_EXPIRY'] || '1h',
  emailVerificationExpiry: process.env['EMAIL_VERIFICATION_EXPIRY'] || '24h',
  
  // Rate Limiting
  maxLoginAttempts: parseInt(process.env['MAX_LOGIN_ATTEMPTS'] || '5'),
  lockoutDuration: parseInt(process.env['LOCKOUT_DURATION'] || '15'), // minutes
  
  // Session Management
  sessionTimeout: parseInt(process.env['SESSION_TIMEOUT'] || '30'), // days
  maxSessionsPerUser: parseInt(process.env['MAX_SESSIONS_PER_USER'] || '5'),
  
  // Refresh Token Configuration
  maxRefreshTokensWithoutRememberMe: parseInt(process.env['MAX_REFRESH_TOKENS_WITHOUT_REMEMBER_ME'] || '8'),
  maxRefreshTokensWithRememberMe: parseInt(process.env['MAX_REFRESH_TOKENS_WITH_REMEMBER_ME'] || '10080'), // 14 days worth of refreshes (every 2 minutes)
};

// JWT Configuration
export const jwtConfig = {
  secret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production',
  algorithm: 'HS256' as const,
  issuer: 'tinystepsaday-backend',
  audience: 'tinystepsaday-users',
};

// Password Configuration
export const passwordConfig = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90, // days - password expiration
};

// Rate Limiting Configuration
export const rateLimitConfig = {
  // General API rate limiting
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  },
  
  // Authentication rate limiting
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
  },
  
  // Password reset rate limiting
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: 'Too many password reset attempts, please try again later.',
  },
  
  // Email verification rate limiting
  emailVerification: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 email verification requests per hour
    message: 'Too many email verification attempts, please try again later.',
  },
  
  // File management rate limiting
  file: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 file operations per windowMs
    message: 'Too many file operations, please try again later.',
  },
  
  // File upload rate limiting
  fileUpload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 file uploads per hour
    message: 'Too many file uploads, please try again later.',
  },
  
  // File search rate limiting
  fileSearch: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // limit each IP to 50 file searches per windowMs
    message: 'Too many file searches, please try again later.',
  },
};

// CORS Configuration
export const corsConfig = {
  origin: process.env['NODE_ENV'] === 'production' 
    ? process.env['ALLOWED_ORIGINS']?.split(',') || false
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

// Helmet Configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
};

// Session Configuration
export const sessionConfig = {
  name: 'tsad_session',
  secret: process.env['SESSION_SECRET'] || 'your-super-secret-session-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env['NODE_ENV'] === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const,
  },
};

// Two-Factor Authentication Configuration
export const twoFactorConfig = {
  issuer: 'Tiny Steps A Day',
  algorithm: 'sha1',
  digits: 6,
  period: 30, // seconds
  window: 1, // time window for validation
};

// Email Configuration
export const emailConfig = {
  from: process.env['EMAIL_FROM'] || 'Tiny Steps A Day <hello@tinystepsaday.com>',
  replyTo: process.env['EMAIL_REPLY_TO'] || 'hello@tinystepsaday.com',
  subjectPrefix: process.env['EMAIL_SUBJECT_PREFIX'] || '[Tiny Steps A Day]',
};

// Validation Configuration
export const validationConfig = {
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

// Logging Configuration
export const loggingConfig = {
  level: process.env['LOG_LEVEL'] || 'info',
  format: process.env['NODE_ENV'] === 'production' ? 'json' : 'simple',
  sensitiveFields: ['password', 'token', 'secret', 'key'],
};

// Environment-specific configurations
export const isProduction = process.env['NODE_ENV'] === 'production';
export const isDevelopment = process.env['NODE_ENV'] === 'development';
export const isTest = process.env['NODE_ENV'] === 'test'; 