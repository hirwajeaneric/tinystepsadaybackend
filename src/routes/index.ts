import { Router, Request, Response } from 'express';
import userRoutes from './userRoutes';
import messageRoutes from './messageRoutes';
import subscriberRoutes from './subscriberRoutes';
import fileRoutes from './fileRoutes';
import database from '../utils/database';
import { ApiResponse } from '../types';

const router = Router();

// Health check endpoint
router.get('/health', async (_req: Request, res: Response) => {
  const dbHealthy = await database.healthCheck();
  
  const response: ApiResponse = {
    success: true,
    message: 'Health check completed',
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
    message: 'API information retrieved successfully',
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
        subscribers: {
          subscribe: 'POST /api/subscribers/subscribe',
          unsubscribe: 'POST /api/subscribers/unsubscribe',
          check: 'GET /api/subscribers/check/:email',
          list: 'GET /api/subscribers (admin)',
          stats: 'GET /api/subscribers/stats (admin)',
        },
        files: {
          create: 'POST /api/files',
          list: 'GET /api/files',
          get: 'GET /api/files/:id',
          update: 'PUT /api/files/:id',
          delete: 'DELETE /api/files/:id',
          search: 'GET /api/files/search',
          statistics: 'GET /api/files/statistics',
          myFiles: 'GET /api/files/my-files',
          byType: 'GET /api/files/type/:type',
          uploadUrl: 'POST /api/files/upload-url',
          bulk: 'POST /api/files/bulk (moderator+)',
          byUser: 'GET /api/files/user/:userId (admin)',
        },
      },
    },
  };

  res.status(200).json(response);
});

// Mount user routes
router.use('/users', userRoutes);

// Mount message routes
router.use('/messages', messageRoutes);

// Mount subscriber routes
router.use('/subscribers', subscriberRoutes);

// Mount file routes
router.use('/files', fileRoutes);

export default router;