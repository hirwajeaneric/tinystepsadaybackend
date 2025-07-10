# Alternative Path Backend

A modern, scalable backend API built with Express.js, TypeScript, and Prisma ORM.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma ORM** - Modern database toolkit
- **PostgreSQL** - Robust, open-source database
- **JWT Authentication** - Secure token-based authentication
- **CORS Support** - Cross-origin resource sharing
- **Helmet Security** - Security headers middleware
- **Morgan Logging** - HTTP request logger
- **Error Handling** - Comprehensive error management
- **API Documentation** - Built-in API documentation

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alternativepath-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/alternativepath_db?schema=public"
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:3000
   LOG_LEVEL=info
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 📊 Database Management

### Prisma Commands
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## 🏗️ Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

## 🔌 API Endpoints

### Health Check
- `GET /health` - Server health status

### API Information
- `GET /api` - API information and available endpoints

### Users
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/stats` - Get user statistics

## 📝 API Examples

### Create a User
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }'
```

### Get All Users
```bash
curl http://localhost:3001/api/users?page=1&limit=10
```

### Get User by ID
```bash
curl http://localhost:3001/api/users/{user-id}
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Code Style
The project uses TypeScript with strict type checking. Make sure to:
- Use proper TypeScript types
- Handle errors appropriately
- Follow the existing code structure
- Add proper JSDoc comments for complex functions

## 🧪 Testing

Testing setup will be added in future updates.

## 🔒 Security

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Request data validation
- **Error Handling** - Secure error responses
- **Environment Variables** - Sensitive data protection

## 📦 Dependencies

### Production
- `express` - Web framework
- `cors` - CORS middleware
- `helmet` - Security headers
- `morgan` - HTTP request logger
- `dotenv` - Environment variables
- `@prisma/client` - Prisma ORM client

### Development
- `typescript` - TypeScript compiler
- `@types/node` - Node.js types
- `@types/express` - Express types
- `@types/cors` - CORS types
- `@types/morgan` - Morgan types
- `ts-node` - TypeScript execution
- `nodemon` - Development server
- `prisma` - Prisma CLI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository.
