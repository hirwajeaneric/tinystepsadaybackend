import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import database from '../utils/database';
import {
    SocialAuthData,
    SocialAuthResponse,
    UserResponse,
    LinkSocialAccountData,
    SocialAccountResponse,
} from '../types/auth';
import {
  NotFoundError,
  ConflictError,
  AuthenticationError,
} from '../utils/errors';
import { ErrorCode } from '../types/errors';
import logger from '../utils/logger';
import { securityConfig } from '../config/security';
import jwt from 'jsonwebtoken';

class SocialAuthService {
    private prisma = database.prisma;

    /**
     * Authenticate user with social provider
     */
    async authenticateWithSocialProvider(socialData: SocialAuthData, userIpAddress: string, userAgent: string | undefined, userDeviceInfo: string | undefined): Promise<SocialAuthResponse> {
        try {
            // Check if user exists with this social account
            let user = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { socialId: socialData.providerId, authProvider: socialData.provider },
                        { email: socialData.email }
                    ]
                },
                include: {
                    linkedAccounts: true
                }
            });

            let isNewUser = false;

            if (!user) {
                // Create new user with default USER role
                user = await this.createSocialUser(socialData);
                isNewUser = true;
            } else {
                // Update existing user's social info if needed
                await this.updateUserSocialInfo(user.id, socialData);
            }

            // Ensure user exists at this point
            if (!user) {
                throw new Error('Failed to create or find user');
            }

            // Create or update social account
            await this.upsertSocialAccount(user.id, socialData);

            // Create session
            const session = await this.createUserSession(user.id, userIpAddress, userAgent, userDeviceInfo);

            // Generate tokens
            const token = jwt.sign({
                userId: user.id,
                email: user.email,
                role: user.role,
                sessionId: session.id
            }, process.env['JWT_SECRET'] || 'fallback-secret', { 
                expiresIn: '30m',
                issuer: 'tinystepsaday',
                audience: 'tinystepsaday-users'
            });
            
            const refreshToken = jwt.sign({
                userId: user.id,
                sessionId: session.id
            }, process.env['JWT_SECRET'] || 'fallback-secret', { 
                expiresIn: '14d',
                issuer: 'tinystepsaday',
                audience: 'tinystepsaday-users'
            });

            // Convert to response format
            const userResponse = this.toUserResponse(user);

            logger.info('Social authentication successful:', {
                userId: user.id,
                provider: socialData.provider,
                isNewUser,
                role: user.role
            });

            return {
                user: userResponse,
                token,
                refreshToken,
                expiresIn: 30 * 60, // 30 minutes
                isNewUser,
                profileCompleted: user.profileCompleted
            };
        } catch (error) {
            logger.error('Social authentication failed:', error);
            throw error;
        }
    }

    /**
     * Create new user from social authentication
     */
    private async createSocialUser(socialData: SocialAuthData): Promise<any> {
        // Generate unique username
        const baseUsername = socialData.firstName?.toLowerCase() || 'user';
        let username = baseUsername;
        let counter = 1;

        while (await this.prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        const user = await this.prisma.user.create({
            data: {
                email: socialData.email,
                username,
                firstName: socialData.firstName,
                lastName: socialData.lastName,
                avatar: socialData.avatar,
                authProvider: socialData.provider,
                socialId: socialData.providerId,
                socialEmail: socialData.email,
                isEmailVerified: true, // Social auth emails are pre-verified
                isActive: true,
                profileCompleted: false, // Will need to complete profile
            },
            include: {
                linkedAccounts: true
            }
        });

        logger.info('Social user created:', {
            userId: user.id,
            provider: socialData.provider,
            email: socialData.email
        });

        return user;
    }

    /**
     * Update user's social information
     */
    private async updateUserSocialInfo(userId: string, socialData: SocialAuthData): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                authProvider: socialData.provider,
                socialId: socialData.providerId,
                socialEmail: socialData.email,
                isEmailVerified: true,
                lastLogin: new Date(),
            }
        });
    }

    /**
     * Create or update social account
     */
    private async upsertSocialAccount(userId: string, socialData: SocialAuthData): Promise<void> {
        const encryptedAccessToken = socialData.accessToken ? this.encryptToken(socialData.accessToken) : null;
        const encryptedRefreshToken = socialData.refreshToken ? this.encryptToken(socialData.refreshToken) : null;

        await this.prisma.socialAccount.upsert({
            where: {
                provider_providerId: {
                    provider: socialData.provider,
                    providerId: socialData.providerId
                }
            },
            update: {
                providerEmail: socialData.email,
                displayName: socialData.firstName && socialData.lastName ? `${socialData.firstName} ${socialData.lastName}` : undefined,
                avatar: socialData.avatar,
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiresAt: socialData.expiresAt,
                updatedAt: new Date(),
            },
            create: {
                userId,
                provider: socialData.provider,
                providerId: socialData.providerId,
                providerEmail: socialData.email,
                displayName: socialData.firstName && socialData.lastName ? `${socialData.firstName} ${socialData.lastName}` : undefined,
                avatar: socialData.avatar,
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                expiresAt: socialData.expiresAt,
            }
        });
    }

    /**
     * Create user session
     */
    private async createUserSession(userId: string, userIpAddress: string, userAgent: string | undefined, userDeviceInfo: string | undefined): Promise<any> {
        const sessionExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

        return await this.prisma.userSession.create({
            data: {
                userId,
                refreshToken: crypto.randomBytes(32).toString('hex'),
                deviceInfo: userDeviceInfo,
                ipAddress: userIpAddress,
                userAgent,
                expiresAt: sessionExpiry,
                rememberMe: true,
                refreshCount: 0,
                maxRefreshes: securityConfig.maxRefreshTokensWithRememberMe,
            }
        });
    }

    /**
     * Link social account to existing user
     */
    async linkSocialAccount(userId: string, linkData: LinkSocialAccountData): Promise<SocialAccountResponse> {
        try {
            // Check if social account is already linked to another user
            const existingAccount = await this.prisma.socialAccount.findUnique({
                where: {
                    provider_providerId: {
                        provider: linkData.provider,
                        providerId: linkData.providerId
                    }
                },
                include: { user: true }
            });

            if (existingAccount) {
                if (existingAccount.userId !== userId) {
                    throw new ConflictError('This social account is already linked to another user', ErrorCode.SOCIAL_ACCOUNT_ALREADY_LINKED);
                }
                // Account already linked to this user
                return this.toSocialAccountResponse(existingAccount);
            }

            const encryptedAccessToken = linkData.accessToken ? this.encryptToken(linkData.accessToken) : null;
            const encryptedRefreshToken = linkData.refreshToken ? this.encryptToken(linkData.refreshToken) : null;

            const socialAccount = await this.prisma.socialAccount.create({
                data: {
                    userId,
                    provider: linkData.provider,
                    providerId: linkData.providerId,
                    providerEmail: linkData.email,
                    displayName: linkData.firstName && linkData.lastName ? `${linkData.firstName} ${linkData.lastName}` : undefined,
                    avatar: linkData.avatar,
                    accessToken: encryptedAccessToken,
                    refreshToken: encryptedRefreshToken,
                    expiresAt: linkData.expiresAt,
                }
            });

            logger.info('Social account linked:', {
                userId,
                provider: linkData.provider,
                providerId: linkData.providerId
            });

            return this.toSocialAccountResponse(socialAccount);
        } catch (error) {
            logger.error('Failed to link social account:', error);
            throw error;
        }
    }

    /**
     * Unlink social account
     */
    async unlinkSocialAccount(userId: string, provider: string): Promise<void> {
        try {
            const socialAccount = await this.prisma.socialAccount.findFirst({
                where: {
                    userId,
                    provider: provider as any,
                    isActive: true
                }
            });

            if (!socialAccount) {
                throw new NotFoundError('Social account not found', ErrorCode.SOCIAL_ACCOUNT_NOT_FOUND);
            }

            await this.prisma.socialAccount.update({
                where: { id: socialAccount.id },
                data: { isActive: false }
            });

            logger.info('Social account unlinked:', {
                userId,
                provider,
                providerId: socialAccount.providerId
            });
        } catch (error) {
            logger.error('Failed to unlink social account:', error);
            throw error;
        }
    }

    /**
     * Get user's linked social accounts
     */
    async getLinkedSocialAccounts(userId: string): Promise<SocialAccountResponse[]> {
        try {
            const socialAccounts = await this.prisma.socialAccount.findMany({
                where: {
                    userId,
                    isActive: true
                }
            });

            return socialAccounts.map(account => this.toSocialAccountResponse(account));
        } catch (error) {
            logger.error('Failed to get linked social accounts:', error);
            throw error;
        }
    }

    /**
     * Verify Google ID token
     */
    async verifyGoogleToken(idToken: string): Promise<any> {
        try {
            const client = new OAuth2Client(process.env['GOOGLE_CLIENT_ID']);
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env['GOOGLE_CLIENT_ID']
            });
            return ticket.getPayload();
        } catch (error) {
            logger.error('Google token verification failed:', error);
            throw new AuthenticationError('Invalid Google token', ErrorCode.INVALID_SOCIAL_TOKEN);
        }
    }

    /**
     * Encrypt sensitive tokens
     */
    private encryptToken(token: string): string {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env['ENCRYPTION_KEY'] || 'default-key', 'salt', 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(token, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }

    

    /**
     * Convert to user response format
     */
    private toUserResponse(user: any): UserResponse {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            twoFactorEnabled: user.twoFactorEnabled,
            lastLogin: user.lastLogin?.toISOString(),
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }

    /**
     * Convert to social account response format
     */
    private toSocialAccountResponse(account: any): SocialAccountResponse {
        return {
            id: account.id,
            provider: account.provider,
            providerId: account.providerId,
            providerEmail: account.providerEmail,
            displayName: account.displayName,
            avatar: account.avatar,
            isActive: account.isActive,
            createdAt: account.createdAt.toISOString(),
            updatedAt: account.updatedAt.toISOString(),
        };
    }
}

export default new SocialAuthService(); 