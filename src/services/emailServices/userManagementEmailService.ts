import {
  roleChangedTemplate,
  accountStatusChangedTemplate,
  welcomeEmailTemplate,
  profileUpdatedTemplate
} from '../emailTemplates/userManagementTemplates';
import {
  BaseEmailTemplateData,
  processTemplate,
  sendMail,
  getClientUrl,
  getImageUrl
} from './shared/emailUtils';
import logger from '../../utils/logger';

// Extended interfaces for user management email types
interface RoleChangedEmailData extends BaseEmailTemplateData {
  oldRole: string;
  newRole: string;
  changedBy: string;
  changeTime: string;
  reason: string;
  loginUrl: string;
}

interface AccountStatusChangedEmailData extends BaseEmailTemplateData {
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changeTime: string;
  reason: string;
  isActive: boolean;
  wasActive: boolean;
  isDeactivated: boolean;
  loginUrl: string;
  supportUrl: string;
}

interface WelcomeEmailData extends BaseEmailTemplateData {
  dashboardUrl: string;
}

interface ProfileUpdatedEmailData extends BaseEmailTemplateData {
  changes: string[];
  profileUrl: string;
}



// User Management Email Functions

export const generateAndSendRoleChangedEmail = async (
  userEmail: string,
  userName: string,
  oldRole: string,
  newRole: string,
  changedBy: string,
  changeTime: string,
  reason: string
): Promise<void> => {
  try {
    const templateData: RoleChangedEmailData = {
      userName,
      userEmail,
      oldRole,
      newRole,
      changedBy,
      changeTime,
      reason,
      loginUrl: `${getClientUrl()}/auth/login`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(roleChangedTemplate, templateData);
    const subject = "Role Updated - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Role changed email sent successfully:", {
      userEmail,
      userName,
      oldRole,
      newRole
    });
  } catch (error) {
    logger.error("Error sending role changed email:", error);
    throw error;
  }
};

export const generateAndSendAccountStatusChangedEmail = async (
  userEmail: string,
  userName: string,
  previousStatus: string,
  newStatus: string,
  changedBy: string,
  changeTime: string,
  reason: string,
  isActive: boolean
): Promise<void> => {
  try {
    const templateData: AccountStatusChangedEmailData = {
      userName,
      userEmail,
      previousStatus,
      newStatus,
      changedBy,
      changeTime,
      reason,
      isActive,
      wasActive: previousStatus === 'Active',
      isDeactivated: !isActive,
      loginUrl: `${getClientUrl()}/auth/login`,
      supportUrl: `${getClientUrl()}/support`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(accountStatusChangedTemplate, templateData);
    const subject = isActive ? "Account Activated - Tiny Steps A Day" : "Account Deactivated - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Account status changed email sent successfully:", {
      userEmail,
      userName,
      previousStatus,
      newStatus
    });
  } catch (error) {
    logger.error("Error sending account status changed email:", error);
    throw error;
  }
};

export const generateAndSendWelcomeEmail = async (
  userEmail: string,
  userName: string
): Promise<void> => {
  try {
    const templateData: WelcomeEmailData = {
      userName,
      userEmail,
      dashboardUrl: `${getClientUrl()}/dashboard`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(welcomeEmailTemplate, templateData);
    const subject = "Welcome to Tiny Steps A Day!";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Welcome email sent successfully:", {
      userEmail,
      userName
    });
  } catch (error) {
    logger.error("Error sending welcome email:", error);
    throw error;
  }
};

export const generateAndSendProfileUpdatedEmail = async (
  userEmail: string,
  userName: string,
  changes: string[]
): Promise<void> => {
  try {
    const templateData: ProfileUpdatedEmailData = {
      userName,
      userEmail,
      changes,
      profileUrl: `${getClientUrl()}/profile`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(profileUpdatedTemplate, templateData);
    const subject = "Profile Updated - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Profile updated email sent successfully:", {
      userEmail,
      userName,
      changesCount: changes.length
    });
  } catch (error) {
    logger.error("Error sending profile updated email:", error);
    throw error;
  }
}; 