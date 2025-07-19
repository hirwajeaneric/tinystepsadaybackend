import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { corsConfig, helmetConfig } from '../config/security';
import logger from '../utils/logger';

/**
 * Security middleware configuration
 */
export const securityMiddleware = [
    // Helmet for security headers
    helmet(helmetConfig as any),

    // HTTP Parameter Pollution protection
    hpp(),

    // CORS configuration
    (req: Request, res: Response, next: NextFunction) => {
        // Set CORS headers
        if (corsConfig.origin) {
            if (typeof corsConfig.origin === 'string') {
                res.header('Access-Control-Allow-Origin', corsConfig.origin);
            } else if (Array.isArray(corsConfig.origin)) {
                const origin = req.headers.origin;
                if (origin && corsConfig.origin.includes(origin)) {
                    res.header('Access-Control-Allow-Origin', origin);
                }
            } else if (corsConfig.origin === true) {
                res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
            }
        }

        res.header('Access-Control-Allow-Credentials', corsConfig.credentials.toString());
        res.header('Access-Control-Allow-Methods', corsConfig.methods.join(','));
        res.header('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(','));
        res.header('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(','));
        res.header('Access-Control-Max-Age', corsConfig.maxAge.toString());

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        next();
    }
];

/**
 * Request sanitization middleware
 */
export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction): void => {
    // Sanitize request body
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }

    next();
};

/**
 * Recursively sanitize object properties
 */
const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
        return sanitizeValue(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
    }

    return sanitized;
};

/**
 * Sanitize individual values
 */
const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
        return value
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .replace(/data:/gi, '') // Remove data: protocol
            .replace(/vbscript:/gi, ''); // Remove vbscript: protocol
    }
    return value;
};

/**
 * Content Security Policy middleware
 */
export const cspMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "frame-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; ');

    res.setHeader('Content-Security-Policy', cspDirectives);
    next();
};

/**
 * Request size limiting middleware
 */
export const requestSizeLimit = (maxSize: string = '10mb') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxSizeBytes = parseSize(maxSize);

        if (contentLength > maxSizeBytes) {
            logger.warn('Request too large', {
                contentLength,
                maxSize: maxSizeBytes,
                url: req.url,
                method: req.method,
                ip: req.ip
            });

            res.status(413).json({
                success: false,
                error: 'PAYLOAD_TOO_LARGE',
                message: 'Request entity too large'
            });
            return;
        }

        next();
    };
};

/**
 * Parse size string to bytes
 */
const parseSize = (size: string): number => {
    const units: { [key: string]: number } = {
        'b': 1,
        'kb': 1024,
        'mb': 1024 * 1024,
        'gb': 1024 * 1024 * 1024
    };

    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
    if (!match) {
        return 10 * 1024 * 1024; // Default to 10MB
    }

    const [, value, unit] = match;
    const unitKey = unit && units[unit as keyof typeof units] ? unit as keyof typeof units : 'mb';
    if (!units[unitKey]) {
        return 10 * 1024 * 1024; // Default to 10MB
    }
    return parseFloat(value || '0') * units[unitKey];
};

/**
 * Rate limiting headers middleware
 */
export const rateLimitHeaders = (_req: Request, res: Response, next: NextFunction): void => {
    // Add rate limiting headers to response
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', '99'); // This would be calculated by rate limiter
    res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 900); // 15 minutes from now

    next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Remove server information
    res.removeHeader('X-Powered-By');

    next();
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    // Log request
    logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentLength: req.headers['content-length'],
        timestamp: new Date().toISOString()
    });

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;

        logger.info('Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });
    });

    next();
};

/**
 * IP address validation middleware
 */
export const validateIP = (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip;

    // Check if IP is valid
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
        // Localhost is allowed
        return next();
    }

    // Check for private IP ranges
    const privateIPRanges = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./
    ];

    const isPrivateIP = privateIPRanges.some(range => range.test(ip));

    if (isPrivateIP) {
        logger.warn('Private IP access attempt', {
            ip,
            url: req.url,
            method: req.method
        });
    }

    next();
};

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeout: number = 30000) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const timer = setTimeout(() => {
            logger.warn('Request timeout', {
                url: req.url,
                method: req.method,
                ip: req.ip,
                timeout
            });

            if (!res.headersSent) {
                res.status(408).json({
                    success: false,
                    error: 'REQUEST_TIMEOUT',
                    message: 'Request timeout'
                });
            }
        }, timeout);

        res.on('finish', () => {
            clearTimeout(timer);
        });

        res.on('close', () => {
            clearTimeout(timer);
        });

        next();
    };
};

/**
 * Method validation middleware
 */
export const validateMethod = (allowedMethods: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!allowedMethods.includes(req.method)) {
            logger.warn('Method not allowed', {
                method: req.method,
                allowedMethods,
                url: req.url,
                ip: req.ip
            });

            res.status(405).json({
                success: false,
                error: 'METHOD_NOT_ALLOWED',
                message: `Method ${req.method} not allowed`
            });
            return;
        }

        next();
    };
};

/**
 * Content type validation middleware
 */
export const validateContentType = (allowedTypes: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const contentType = req.headers['content-type'];

        if (req.method === 'GET' || req.method === 'DELETE') {
            return next();
        }

        if (!contentType) {
            res.status(400).json({
                success: false,
                error: 'MISSING_CONTENT_TYPE',
                message: 'Content-Type header is required'
            });
            return;
        }

        const isValidType = allowedTypes.some(type =>
            contentType.includes(type)
        );

        if (!isValidType) {
            logger.warn('Invalid content type', {
                contentType,
                allowedTypes,
                url: req.url,
                method: req.method,
                ip: req.ip
            });

            res.status(400).json({
                success: false,
                error: 'INVALID_CONTENT_TYPE',
                message: `Content-Type must be one of: ${allowedTypes.join(', ')}`
            });
            return;
        }

        next();
    };
}; 