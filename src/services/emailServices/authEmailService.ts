import {
  emailVerificationTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
  accountActivatedTemplate,
  accountDeactivatedTemplate
} from '../emailTemplates/authTemplates';
import {
  BaseEmailTemplateData,
  processTemplate,
  sendMail,
  getClientUrl,
  getImageUrl
} from './shared/emailUtils';

// Extended interfaces for authentication email types
interface VerificationEmailData extends BaseEmailTemplateData {
  verificationCode: string;
}

interface PasswordResetEmailData extends BaseEmailTemplateData {
  resetUrl: string;
}

interface PasswordChangedEmailData extends BaseEmailTemplateData {
  changeTime: string;
  ipAddress: string;
  deviceInfo: string;
}

interface AccountActivatedEmailData extends BaseEmailTemplateData {
  loginUrl: string;
}

interface AccountDeactivatedEmailData extends BaseEmailTemplateData {
  deactivationTime: string;
  reason: string;
  requestedBy: string;
  supportUrl: string;
}

import logger from '../../utils/logger';

// Authentication Email Functions

export const generateAndSendVerificationEmail = async (
  userEmail: string,
  userName: string,
  verificationCode: string
): Promise<void> => {
  try {
    const templateData: VerificationEmailData = {
      userName,
      userEmail,
      verificationCode,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(emailVerificationTemplate, templateData);
    const subject = "Verify Your Email - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Verification email sent successfully:", {
      userEmail,
      userName,
      verificationCode
    });
  } catch (error) {
    logger.error("Error sending verification email:", error);
    throw error;
  }
};

export const generateAndSendPasswordResetEmail = async (
  userEmail: string,
  userName: string,
  resetToken: string
): Promise<void> => {
  try {
    const resetUrl = `${getClientUrl()}/auth/resetpassword?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;
    
    const templateData: PasswordResetEmailData = {
      userName,
      userEmail,
      resetUrl,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(passwordResetTemplate, templateData);
    const subject = "Reset Your Password - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Password reset email sent successfully:", {
      userEmail,
      userName,
      resetUrl
    });
  } catch (error) {
    logger.error("Error sending password reset email:", error);
    throw error;
  }
};

export const generateAndSendPasswordChangedEmail = async (
  userEmail: string,
  userName: string,
  changeTime: string,
  ipAddress: string,
  deviceInfo: string
): Promise<void> => {
  try {
    const templateData: PasswordChangedEmailData = {
      userName,
      userEmail,
      changeTime,
      ipAddress,
      deviceInfo,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(passwordChangedTemplate, templateData);
    const subject = "Password Changed - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Password changed email sent successfully:", {
      userEmail,
      userName,
      changeTime
    });
  } catch (error) {
    logger.error("Error sending password changed email:", error);
    throw error;
  }
};

export const generateAndSendAccountActivatedEmail = async (
  userEmail: string,
  userName: string
): Promise<void> => {
  try {
    const templateData: AccountActivatedEmailData = {
      userName,
      userEmail,
      loginUrl: `${getClientUrl()}/auth/login`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(accountActivatedTemplate, templateData);
    const subject = "Account Activated - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Account activated email sent successfully:", {
      userEmail,
      userName
    });
  } catch (error) {
    logger.error("Error sending account activated email:", error);
    throw error;
  }
};

export const generateAndSendAccountDeactivatedEmail = async (
  userEmail: string,
  userName: string,
  deactivationTime: string,
  reason: string,
  requestedBy: string
): Promise<void> => {
  try {
    const templateData: AccountDeactivatedEmailData = {
      userName,
      userEmail,
      deactivationTime,
      reason,
      requestedBy,
      supportUrl: `${getClientUrl()}/support`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(accountDeactivatedTemplate, templateData);
    const subject = "Account Deactivated - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Account deactivated email sent successfully:", {
      userEmail,
      userName,
      reason
    });
  } catch (error) {
    logger.error("Error sending account deactivated email:", error);
    throw error;
  }
}; 