# Deployment Guide

## Build Process

The build process has been optimized for deployment:

1. **TypeScript Compilation**: `tsc` compiles TypeScript to JavaScript
2. **Prisma Client Generation**: `prisma generate` creates the Prisma client
3. **Database Operations**: Separated from build to avoid deployment failures

## Environment Variables

Make sure to set these environment variables in your deployment platform:

- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Set to `production` for production deployments
- `PORT`: Server port (optional, defaults to 3000)

## Build Commands

- `npm run build`: Compiles TypeScript and generates Prisma client
- `npm run deploy`: Same as build (for deployment platforms)
- `npm start`: Starts the compiled application

## Database Setup

After deployment, you may need to run database operations:

- `npm run db:push`: Push schema changes to database
- `npm run db:migrate`: Run database migrations

## Troubleshooting

If you encounter build errors:

1. Ensure all dependencies are installed: `npm install`
2. Check that TypeScript types are available: `npm install --save-dev @types/node @types/express @types/cors @types/jsonwebtoken`
3. Verify environment variables are set correctly
4. Check that the database is accessible from your deployment environment

## Recent Fixes

- Fixed TypeScript type definitions for Express requests
- Separated database operations from build process
- Added proper error handling for stack trace capture
- Optimized build script for deployment environments
- Moved essential TypeScript types to dependencies for deployment compatibility
- Added explicit typeRoots configuration in tsconfig.json 