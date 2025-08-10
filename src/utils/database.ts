import { PrismaClient } from "@prisma/client";
import logger from './logger';

class Database {
    private static instance: Database;
    public prisma: PrismaClient;

    private constructor() {
        this.prisma = new PrismaClient({
            log: ['error']
        });
    };

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<void> {
        try {
            await this.prisma.$connect();
            logger.info('Database connected successfully');
        } catch (error) {
            logger.error('Database connection failed:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await this.prisma.$disconnect();
            logger.info('Database disconnected successfully');
        } catch (error) {
            logger.error('Database disconnection failed:', error);
            throw error;
        }
    }

    public async healthCheck(): Promise<boolean> {
        try {
            await this.prisma.user.findFirst();
            return true;
        } catch (error) {
            logger.error('Database health check failed:', error);
            return false;
        }
    }
}

export default Database.getInstance();