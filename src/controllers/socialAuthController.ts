import { Request, Response } from 'express';
import socialAuthService from '../services/socialAuthService';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

class SocialAuthController {
  /**
   * Google OAuth callback
   */
  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, error } = req.query;

      if (error) {
        logger.error('Google OAuth error:', error);
        res.redirect(`${process.env['FRONTEND_URL']}/auth/login?error=oauth_failed&provider=google`);
        return;
      }

      if (!code) {
        res.redirect(`${process.env['FRONTEND_URL']}/auth/login?error=no_code&provider=google`);
        return;
      }

      // Exchange code for tokens
      const tokens = await this.exchangeGoogleCode(code as string);
      
      // Get user info from Google
      const userInfo = await this.getGoogleUserInfo(tokens.access_token);
      
      // Authenticate with social service
      const result = await socialAuthService.authenticateWithSocialProvider({
        provider: 'GOOGLE',
        providerId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        avatar: userInfo.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      }, req.ip || '', req.headers['user-agent'], req.headers['x-device-info'] as string);

      // Redirect to frontend with tokens
      const redirectUrl = new URL(`${process.env['FRONTEND_URL']}/auth/social-callback`);
      redirectUrl.searchParams.set('provider', 'google');
      redirectUrl.searchParams.set('token', result.token);
      redirectUrl.searchParams.set('refreshToken', result.refreshToken);
      redirectUrl.searchParams.set('isNewUser', result.isNewUser.toString());
      redirectUrl.searchParams.set('profileCompleted', result.profileCompleted.toString());

      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error('Google OAuth callback failed:', error);
      res.redirect(`${process.env['FRONTEND_URL']}/auth/login?error=oauth_failed&provider=google`);
    }
  }

  /**
   * Apple OAuth callback
   */
  async appleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, error } = req.query;

      if (error) {
        logger.error('Apple OAuth error:', error);
        res.redirect(`${process.env['FRONTEND_URL']}/auth/login?error=oauth_failed&provider=apple`);
        return;
      }

      if (!code) {
        res.redirect(`${process.env['FRONTEND_URL']}/auth/login?error=no_code&provider=apple`);
        return;
      }

      // Exchange code for tokens
      const tokens = await this.exchangeAppleCode(code as string);
      
      // Get user info from Apple
      const userInfo = await this.getAppleUserInfo(tokens.access_token);
      
      // Authenticate with social service
      const result = await socialAuthService.authenticateWithSocialProvider({
        provider: 'APPLE',
        providerId: userInfo.sub,
        email: userInfo.email,
        firstName: userInfo.name?.firstName,
        lastName: userInfo.name?.lastName,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : undefined,
      }, req.ip || '', req.headers['user-agent'], req.headers['x-device-info'] as string);

      // Redirect to frontend with tokens
      const redirectUrl = new URL(`${process.env['FRONTEND_URL']}/auth/social-callback`);
      redirectUrl.searchParams.set('provider', 'apple');
      redirectUrl.searchParams.set('token', result.token);
      redirectUrl.searchParams.set('refreshToken', result.refreshToken);
      redirectUrl.searchParams.set('isNewUser', result.isNewUser.toString());
      redirectUrl.searchParams.set('profileCompleted', result.profileCompleted.toString());

      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error('Apple OAuth callback failed:', error);
      res.redirect(`${process.env['FRONTEND_URL']}/auth/login?error=oauth_failed&provider=apple`);
    }
  }

  /**
   * Verify Google ID token (for client-side auth)
   */
  async verifyGoogleToken(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        res.status(400).json({
          success: false,
          error: 'MISSING_TOKEN',
          message: 'ID token is required'
        });
        return;
      }

      // Verify the token
      const payload = await socialAuthService.verifyGoogleToken(idToken);
      
      // Authenticate with social service
      const result = await socialAuthService.authenticateWithSocialProvider({
        provider: 'GOOGLE',
        providerId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        avatar: payload.picture,
      }, req.ip || '', req.headers['user-agent'], req.headers['x-device-info'] as string);

      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        data: result
      });
    } catch (error: any) {
      logger.error('Google token verification failed:', error);
      res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid Google token'
      });
    }
  }

  /**
   * Link social account to existing user
   */
  async linkSocialAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const linkData = req.body;

      const result = await socialAuthService.linkSocialAccount(userId, linkData);

      res.status(200).json({
        success: true,
        message: 'Social account linked successfully',
        data: result
      });
    } catch (error: any) {
      logger.error('Failed to link social account:', error);
      
      if (error.code === 'SOCIAL_ACCOUNT_ALREADY_LINKED') {
        res.status(409).json({
          success: false,
          error: 'SOCIAL_ACCOUNT_ALREADY_LINKED',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to link social account'
      });
    }
  }

  /**
   * Unlink social account
   */
  async unlinkSocialAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { provider } = req.params;

      await socialAuthService.unlinkSocialAccount(userId, provider || '');

      res.status(200).json({
        success: true,
        message: 'Social account unlinked successfully'
      });
    } catch (error: any) {
      logger.error('Failed to unlink social account:', error);
      
      if (error.code === 'SOCIAL_ACCOUNT_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: 'SOCIAL_ACCOUNT_NOT_FOUND',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to unlink social account'
      });
    }
  }

  /**
   * Get user's linked social accounts
   */
  async getLinkedSocialAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const accounts = await socialAuthService.getLinkedSocialAccounts(userId);

      res.status(200).json({
        success: true,
        message: 'Linked social accounts retrieved successfully',
        data: accounts
      });
    } catch (error: any) {
      logger.error('Failed to get linked social accounts:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get linked social accounts'
      });
    }
  }

  /**
   * Exchange Google authorization code for tokens
   */
  private async exchangeGoogleCode(code: string): Promise<any> {
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(
      process.env['GOOGLE_CLIENT_ID'],
      process.env['GOOGLE_CLIENT_SECRET'],
      process.env['GOOGLE_REDIRECT_URI']
    );

    const { tokens } = await client.getToken(code);
    return tokens;
  }

  /**
   * Get user info from Google
   */
  private async getGoogleUserInfo(accessToken: string): Promise<any> {
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client();
    
    const userInfoResponse = await client.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return userInfoResponse.data;
  }

  /**
   * Exchange Apple authorization code for tokens
   */
  private async exchangeAppleCode(_code: string): Promise<any> {
    // Apple OAuth implementation would go here
    // This is a simplified version - you'd need to implement the full Apple OAuth flow
    throw new Error('Apple OAuth not implemented yet');
  }

  /**
   * Get user info from Apple
   */
  private async getAppleUserInfo(_accessToken: string): Promise<any> {
    // Apple user info implementation would go here
    throw new Error('Apple user info not implemented yet');
  }
}

export default new SocialAuthController(); 