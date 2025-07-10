import { PrismaClient } from '../generated/prisma';
import { User, UserRole } from '../types';
import { AppError } from '../types';

const prisma = new PrismaClient();

export class UserService {
  // Get all users with pagination
  static async getUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              comments: true
            }
          }
        }
      }),
      prisma.user.count()
    ]);

    return { users, total };
  }

  // Get user by ID
  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
            createdAt: true
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Get user by email
  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  // Create new user
  static async createUser(data: {
    email: string;
    name?: string;
    role?: UserRole;
  }) {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role || UserRole.USER
      }
    });
  }

  // Update user
  static async updateUser(
    id: string,
    data: Partial<{
      name: string;
      role: UserRole;
    }>
  ) {
    const user = await this.getUserById(id);

    return await prisma.user.update({
      where: { id },
      data
    });
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);

    await prisma.user.delete({
      where: { id }
    });
  }

  // Get user statistics
  static async getUserStats(id: string) {
    const user = await this.getUserById(id);

    const [postsCount, commentsCount] = await Promise.all([
      prisma.post.count({
        where: { authorId: id }
      }),
      prisma.comment.count({
        where: { authorId: id }
      })
    ]);

    return {
      user,
      stats: {
        postsCount,
        commentsCount
      }
    };
  }
} 