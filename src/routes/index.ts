import { Router, Request, Response } from 'express';
import userRoutes from './userRoutes';
import messageRoutes from './messageRoutes';
import subscriberRoutes from './subscriberRoutes';
import fileRoutes from './fileRoutes';
import blogRoutes from './blogRoutes';
import quizRoutes from './quizRoutes';
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
        blog: {
          // Public endpoints
          publicPosts: 'GET /api/blog/public/posts',
          publicPost: 'GET /api/blog/public/posts/:slug',
          publicComments: 'GET /api/blog/public/comments',
          // Protected endpoints
          posts: 'GET /api/blog/posts (auth required)',
          createPost: 'POST /api/blog/posts (auth required)',
          updatePost: 'PUT /api/blog/posts/:id (auth required)',
          deletePost: 'DELETE /api/blog/posts/:id (auth required)',
          categories: 'GET /api/blog/categories (auth required)',
          createCategory: 'POST /api/blog/categories (admin/editor)',
          updateCategory: 'PUT /api/blog/categories/:id (admin/editor)',
          deleteCategory: 'DELETE /api/blog/categories/:id (admin/editor)',
          tags: 'GET /api/blog/tags (auth required)',
          createTag: 'POST /api/blog/tags (admin/editor)',
          updateTag: 'PUT /api/blog/tags/:id (admin/editor)',
          deleteTag: 'DELETE /api/blog/tags/:id (admin/editor)',
          comments: 'GET /api/blog/comments (auth required)',
          createComment: 'POST /api/blog/comments (auth required)',
          updateComment: 'PUT /api/blog/comments/:id (auth required)',
          deleteComment: 'DELETE /api/blog/comments/:id (auth required)',
          toggleLike: 'POST /api/blog/likes (auth required)',
          checkLike: 'GET /api/blog/likes/:postId (auth required)',
        },
        quizzes: {
          // Public endpoints
          publicQuizzes: 'GET /api/quizzes/public/quizzes',
          publicQuiz: 'GET /api/quizzes/public/quizzes/:id',
          categories: 'GET /api/quizzes/categories',
          difficulties: 'GET /api/quizzes/difficulties',
          // Protected endpoints
          quizzes: 'GET /api/quizzes/quizzes (auth required)',
          createQuiz: 'POST /api/quizzes/quizzes (admin/instructor)',
          updateQuiz: 'PUT /api/quizzes/quizzes/:id (admin/instructor)',
          deleteQuiz: 'DELETE /api/quizzes/quizzes/:id (admin/instructor)',
          analytics: 'GET /api/quizzes/quizzes/:id/analytics (quiz creator)',
          // Quiz Results
          submitQuiz: 'POST /api/quizzes/results (auth required)',
          getResults: 'GET /api/quizzes/results (auth required)',
          getResult: 'GET /api/quizzes/results/:id (auth required)',
          userResults: 'GET /api/quizzes/user/results (auth required)',
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

// Mount blog routes
router.use('/blog', blogRoutes);

// Mount quiz routes
router.use('/quizzes', quizRoutes);

export default router;