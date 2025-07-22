import express from 'express';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

// Load environment variables
dotenv.config();

import database from './utils/database';
import logger from './utils/logger';
import routes from './routes';

// Import middleware
import { globalErrorHandler } from './middleware/errorHandler';
import { 
  securityMiddleware,
  sanitizeRequest,
  cspMiddleware,
  requestSizeLimit,
  securityHeaders,
  requestLogger,
  validateIP,
  requestTimeout,
  validateContentType
} from './middleware/security';
import {
  generalRateLimiter, 
} from './middleware/rateLimit';

const app = express();
const PORT = process.env['PORT'] || 3000;

// Trust proxy configuration for deployment
app.set('trust proxy', 1);

// Apply comprehensive security middleware
app.use(securityMiddleware);

// Apply request size limiting
app.use(requestSizeLimit('10mb'));

// Apply content type validation
app.use(validateContentType(['application/json', 'application/x-www-form-urlencoded']));

// Apply request timeout (30 seconds)
app.use(requestTimeout(30000));

// Apply IP validation
app.use(validateIP);

// Apply security headers
app.use(securityHeaders);

// Apply CSP middleware
app.use(cspMiddleware);

// Apply request sanitization
app.use(sanitizeRequest);

// Apply detailed request logging
app.use(requestLogger);

// Apply general rate limiting
app.use(generalRateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Backend Server API is running',
    version: process.env['npm_package_version'] || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (must be last)
app.use(globalErrorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await database.disconnect();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();