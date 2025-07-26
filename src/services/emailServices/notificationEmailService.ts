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