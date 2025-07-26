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

/**
 * Sends an email to the user to notify them that their role has been changed.
 *
 * @param userEmail - The email address of the user to send the role changed email to.
 * @param userName - The name of the user to personalize the email.
 * @param oldRole - The previous role of the user.
 * @param newRole - The new role of the user.
 * @param changedBy - The user who changed the role.
 * @param changeTime - The time the role was changed.
 * @param reason - The reason the role was changed.
 * @returns A Promise that resolves when the email is sent successfully.
 * @throws Will throw an error if sending the email fails.
 */
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

/**
 * Sends an email to the user to notify them that their account status has been changed.
 *
 * @param userEmail - The email address of the user to send the account status changed email to.
 * @param userName - The name of the user to personalize the email.
 * @param previousStatus - The previous status of the user.
 * @param newStatus - The new status of the user.
 * @param changedBy - The user who changed the status.
 * @param changeTime - The time the status was changed.
 * @param reason - The reason the status was changed.
 * @param isActive - Whether the account is active.
 * @returns A Promise that resolves when the email is sent successfully.
 * @throws Will throw an error if sending the email fails.
 */
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

/**
 * Sends an email to the user to welcome them to the platform.
 *
 * @param userEmail - The email address of the user to send the welcome email to.
 * @param userName - The name of the user to personalize the email.
 * @returns A Promise that resolves when the email is sent successfully.
 * @throws Will throw an error if sending the email fails.
 */
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

/**
 * Sends an email to the user to notify them that their profile has been updated.
 *
 * @param userEmail - The email address of the user to send the profile updated email to.
 * @param userName - The name of the user to personalize the email.
 * @param changes - The changes that were made to the profile.
 * @returns A Promise that resolves when the email is sent successfully.
 * @throws Will throw an error if sending the email fails.
 */
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