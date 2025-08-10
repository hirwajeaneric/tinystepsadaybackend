import crypto from 'crypto';

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