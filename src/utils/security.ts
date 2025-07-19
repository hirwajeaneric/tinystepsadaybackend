import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationConfig, passwordConfig } from '../config/security';
import { AuthenticationError } from '../types/errors';
import { ValidationResult } from '../types/auth';

// Password Utilities
export class PasswordUtils {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string, saltRounds: number = 12): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a password with its hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationResult {
    const errors: any[] = [];

    if (password.length < passwordConfig.minLength) {
      errors.push({
        field: 'password',
        message: `Password must be at least ${passwordConfig.minLength} characters long`,
        value: password.length
      });
    }

    if (password.length > passwordConfig.maxLength) {
      errors.push({
        field: 'password',
        message: `Password must be no more than ${passwordConfig.maxLength} characters long`,
        value: password.length
      });
    }

    if (passwordConfig.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one uppercase letter'
      });
    }

    if (passwordConfig.requireLowercase && !/[a-z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one lowercase letter'
      });
    }

    if (passwordConfig.requireNumbers && !/\d/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number'
      });
    }

    if (passwordConfig.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one special character (@$!%*?&)'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';
    
    // Ensure at least one character from each required category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '@$!%*?&'[Math.floor(Math.random() * 7)]; // special char
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Token Utilities
export class TokenUtils {
  /**
   * Generate a JWT token
   */
  static generateToken(payload: any, secret: string, options: jwt.SignOptions = {}): string {
    return jwt.sign(payload, secret, {
      algorithm: 'HS256',
      ...options
    });
  }

  /**
   * Verify a JWT token
   */
  static verifyToken(token: string, secret: string): any {
    try {
      return jwt.verify(token, secret, { algorithms: ['HS256'] });
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token', 'TOKEN_INVALID');
    }
  }

  /**
   * Decode a JWT token without verification
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new AuthenticationError('Invalid token format', 'TOKEN_INVALID');
    }
  }

  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a verification token
   */
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a password reset token
   */
  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a session token
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}

// Validation Utilities
export class ValidationUtils {
  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    const errors: any[] = [];

    if (!email || typeof email !== 'string') {
      errors.push({
        field: 'email',
        message: 'Email is required and must be a string'
      });
    } else if (!validationConfig.email.pattern.test(email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        value: email
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate username format
   */
  static validateUsername(username: string): ValidationResult {
    const errors: any[] = [];

    if (!username || typeof username !== 'string') {
      errors.push({
        field: 'username',
        message: 'Username is required and must be a string'
      });
    } else {
      if (username.length < validationConfig.username.minLength) {
        errors.push({
          field: 'username',
          message: `Username must be at least ${validationConfig.username.minLength} characters long`,
          value: username.length
        });
      }

      if (username.length > validationConfig.username.maxLength) {
        errors.push({
          field: 'username',
          message: `Username must be no more than ${validationConfig.username.maxLength} characters long`,
          value: username.length
        });
      }

      if (!validationConfig.username.pattern.test(username)) {
        errors.push({
          field: 'username',
          message: 'Username can only contain letters, numbers, underscores, and hyphens',
          value: username
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate registration data
   */
  static validateRegistrationData(data: any): ValidationResult {
    const errors: any[] = [];

    // Validate email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }

    // Validate username
    const usernameValidation = this.validateUsername(data.username);
    if (!usernameValidation.isValid) {
      errors.push(...usernameValidation.errors);
    }

    // Validate password
    const passwordValidation = PasswordUtils.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    // Validate optional fields
    if (data.firstName && typeof data.firstName !== 'string') {
      errors.push({
        field: 'firstName',
        message: 'First name must be a string'
      });
    }

    if (data.lastName && typeof data.lastName !== 'string') {
      errors.push({
        field: 'lastName',
        message: 'Last name must be a string'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate login data
   */
  static validateLoginData(data: any): ValidationResult {
    const errors: any[] = [];

    // Validate email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }

    // Validate password
    if (!data.password || typeof data.password !== 'string') {
      errors.push({
        field: 'password',
        message: 'Password is required and must be a string'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Rate Limiting Utilities
export class RateLimitUtils {
  private static loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

  /**
   * Check if an IP is rate limited for login attempts
   */
  static isLoginRateLimited(ip: string, maxAttempts: number = 5, lockoutDuration: number = 15): boolean {
    const attempts = this.loginAttempts.get(ip);
    
    if (!attempts) {
      return false;
    }

    // Check if account is locked
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return true;
    }

    // Reset lockout if expired
    if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
      this.loginAttempts.delete(ip);
      return false;
    }

    // Check if max attempts reached
    if (attempts.count >= maxAttempts) {
      // Lock the account
      attempts.lockedUntil = Date.now() + (lockoutDuration * 60 * 1000);
      return true;
    }

    return false;
  }

  /**
   * Record a login attempt
   */
  static recordLoginAttempt(ip: string): void {
    const attempts = this.loginAttempts.get(ip);
    
    if (attempts) {
      attempts.count++;
      attempts.lastAttempt = Date.now();
    } else {
      this.loginAttempts.set(ip, {
        count: 1,
        lastAttempt: Date.now()
      });
    }
  }

  /**
   * Reset login attempts for an IP
   */
  static resetLoginAttempts(ip: string): void {
    this.loginAttempts.delete(ip);
  }

  /**
   * Get remaining login attempts for an IP
   */
  static getRemainingLoginAttempts(ip: string, maxAttempts: number = 5): number {
    const attempts = this.loginAttempts.get(ip);
    
    if (!attempts) {
      return maxAttempts;
    }

    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return 0;
    }

    return Math.max(0, maxAttempts - attempts.count);
  }

  /**
   * Clean up expired rate limit entries
   */
  static cleanupExpiredEntries(): void {
    const now = Date.now();
    
    for (const [ip, attempts] of this.loginAttempts.entries()) {
      if (attempts.lockedUntil && now >= attempts.lockedUntil) {
        this.loginAttempts.delete(ip);
      }
    }
  }
}

// Session Utilities
export class SessionUtils {
  /**
   * Generate device information from user agent
   */
  static getDeviceInfo(userAgent: string): string {
    // Simple device detection - can be enhanced with a proper user-agent parser
    if (userAgent.includes('Mobile')) {
      return 'Mobile Device';
    } else if (userAgent.includes('Tablet')) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }

  /**
   * Check if a session is expired
   */
  static isSessionExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Calculate session expiry date
   */
  static calculateSessionExpiry(days: number = 30): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
  }
}

// Crypto Utilities
export class CryptoUtils {
  /**
   * Generate a random string
   */
  static randomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a random number between min and max
   */
  static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Hash a string using SHA-256
   */
  static hashString(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  /**
   * Generate a secure random UUID
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }
} 