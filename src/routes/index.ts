import { Router, Request, Response } from 'express';
import userRoutes from './userRoutes';
import database from '../utils/database';
import { ApiResponse } from '../types';

const router = Router();

// Health check endpoint
router.get('/health', async (_req: Request, res: Response) => {
  const dbHealthy = await database.healthCheck();
  
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? 'connected' : 'disconnected',
      environment: process.env['NODE_ENV'] || 'development',
      version: process.env['npm_package_version'] || '1.0.0',
    },
  };

  const statusCode = dbHealthy ? 200 : 503;
  res.status(statusCode).json(response);
});

// API info endpoint
router.get('/info', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      name: 'Backend Server API',
      version: process.env['npm_package_version'] || '1.0.0',
      description: 'Backend server with MongoDB, Prisma, and TypeScript',
      endpoints: {
        health: '/api/health',
        users: '/api/users',
        auth: {
          register: 'POST /api/users/register',
          login: 'POST /api/users/login',
        },
      },
    },
  };

  res.status(200).json(response);
});

// Mount user routes
router.use('/users', userRoutes);

export default router;