import {
  generalNotificationTemplate,
  achievementNotificationTemplate,
  reminderNotificationTemplate,
  challengeNotificationTemplate
} from '../emailTemplates/notificationTemplates';
import {
  BaseEmailTemplateData,
  processTemplate,
  sendMail,
  getClientUrl,
  getImageUrl
} from './shared/emailUtils';
import logger from '../../utils/logger';

// Extended interfaces for notification email types
interface GeneralNotificationEmailData extends BaseEmailTemplateData {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  timestamp: string;
}

interface AchievementNotificationEmailData extends BaseEmailTemplateData {
  achievementName: string;
  achievementDescription: string;
  pointsEarned: number;
  unlockDate: string;
  achievementUrl: string;
}

interface ReminderNotificationEmailData extends BaseEmailTemplateData {
  reminderTitle: string;
  reminderMessage: string;
  dueDate: string;
  priority?: string;
  taskUrl: string;
}

interface ChallengeNotificationEmailData extends BaseEmailTemplateData {
  challengeName: string;
  challengeDescription: string;
  duration: string;
  participants: number;
  reward: string;
  startDate: string;
  endDate: string;
  challengeUrl: string;
}



// Notification Email Functions

/**
 * Sends a general notification email to the user.
 *
 * @param userEmail - The email address of the user to send the general notification email to.
 * @param userName - The name of the user to personalize the email.
 * @param title - The title of the notification.
 * @param message - The message of the notification.
 * @param actionUrl - The URL to take action on the notification.
 * @param actionText - The text of the action button.
 * @returns A Promise that resolves when the email is sent successfully.
 * @throws Will throw an error if sending the email fails.
 */
export const generateAndSendGeneralNotification = async (
  userEmail: string,
  userName: string,
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string
): Promise<void> => {
  try {
    const templateData: GeneralNotificationEmailData = {
      userName,
      userEmail,
      title,
      message,
      actionUrl,
      actionText,
      timestamp: new Date().toLocaleString(),
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(generalNotificationTemplate, templateData);
    const subject = `${title} - Tiny Steps A Day`;

    await sendMail(userEmail, subject, processedHtml);

    logger.info("General notification email sent successfully:", {
      userEmail,
      userName,
      title
    });
  } catch (error) {
    logger.error("Error sending general notification email:", error);
    throw error;
  }
};

/**
 * Sends an achievement notification email to the user.
 *
 * @param userEmail - The email address of the user to send the achievement notification email to.
 * @param userName - The name of the user to personalize the email.
 * @param achievementName - The name of the achievement.
 * @param achievementDescription - The description of the achievement.
 * @param pointsEarned - The number of points earned for the achievement.
 * @returns A Promise that resolves when the email is sent successfully.
 * @throws Will throw an error if sending the email fails.
 */
export const generateAndSendAchievementNotification = async (
  userEmail: string,
  userName: string,
  achievementName: string,
  achievementDescription: string,
  pointsEarned: number
): Promise<void> => {
  try {
    const templateData: AchievementNotificationEmailData = {
      userName,
      userEmail,
      achievementName,
      achievementDescription,
      pointsEarned,
      unlockDate: new Date().toLocaleDateString(),
      achievementUrl: `${getClientUrl()}/achievements`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(achievementNotificationTemplate, templateData);
    const subject = "Achievement Unlocked! - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Achievement notification email sent successfully:", {
      userEmail,
      userName,
      achievementName
    });
  } catch (error) {
    logger.error("Error sending achievement notification email:", error);
    throw error;
  }
};

/**
 * Sends a reminder notification email to the user.
 *
 * @param userEmail - The email address of the user to send the reminder notification email to.
 * @param userName - The name of the user to personalize the email.
 * @param reminderTitle - The title of the reminder.
 * @param reminderMessage - The message of the reminder.
 * @param dueDate - The date the reminder is due.
 * @param priority - The priority of the reminder.
 * @returns A Promise that resolves when the email is sent successfully.
 * @throws Will throw an error if sending the email fails.
 */
export const generateAndSendReminderNotification = async (
  userEmail: string,
  userName: string,
  reminderTitle: string,
  reminderMessage: string,
  dueDate: string,
  priority?: string
): Promise<void> => {
  try {
    const templateData: ReminderNotificationEmailData = {
      userName,
      userEmail,
      reminderTitle,
      reminderMessage,
      dueDate,
      priority,
      taskUrl: `${getClientUrl()}/tasks`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(reminderNotificationTemplate, templateData);
    const subject = "Reminder - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Reminder notification email sent successfully:", {
      userEmail,
      userName,
      reminderTitle
    });
  } catch (error) {
    logger.error("Error sending reminder notification email:", error);
    throw error;
  }
};

/**
 * Sends a challenge notification email to the user.
 *
 * @param userEmail - The email address of the user to send the challenge notification email to.
 * @param userName - The name of the user to personalize the email.
 * @param challengeName - The name of the challenge.
 * @param challengeDescription - The description of the challenge.
 * @param duration - The duration of the challenge.
 * @param participants - The number of participants in the challenge.
 * @param reward - The reward for the challenge.
 * @param startDate - The start date of the challenge.
 * @param endDate - The end date of the challenge.
 * @returns A Promise that resolves when the email is sent successfully.
 * @throws Will throw an error if sending the email fails.
 */
export const generateAndSendChallengeNotification = async (
  userEmail: string,
  userName: string,
  challengeName: string,
  challengeDescription: string,
  duration: string,
  participants: number,
  reward: string,
  startDate: string,
  endDate: string
): Promise<void> => {
  try {
    const templateData: ChallengeNotificationEmailData = {
      userName,
      userEmail,
      challengeName,
      challengeDescription,
      duration,
      participants,
      reward,
      startDate,
      endDate,
      challengeUrl: `${getClientUrl()}/challenges`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(challengeNotificationTemplate, templateData);
    const subject = "New Challenge Available! - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Challenge notification email sent successfully:", {
      userEmail,
      userName,
      challengeName
    });
  } catch (error) {
    logger.error("Error sending challenge notification email:", error);
    throw error;
  }
}; 