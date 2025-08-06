import { unsubscribeNotificationTemplate } from '../emailTemplates/adminNotificationTemplates';
import {
  BaseEmailTemplateData,
  sendMail,
  getClientUrl,
  getImageUrl
} from './shared/emailUtils';
import logger from '../../utils/logger';

// Extended interface for admin notification email data
interface UnsubscribeNotificationEmailData extends BaseEmailTemplateData {
  clientUrl: string;
  adminName: string;
  subscriberEmail: string;
  subscriptionType: string;
  unsubscribeReason?: string;
  unsubscribeTime: string;
  totalSubscribers: number;
  activeSubscribers: number;
}

/**
 * Sends unsubscribe notification email to admins
 *
 * @param adminEmails - Array of admin email addresses
 * @param adminName - Name of the admin (will be used for all admins)
 * @param subscriberEmail - Email of the subscriber who unsubscribed
 * @param subscriptionType - Type of subscription (FOOTER, MODAL, BOOK_PUBLISH)
 * @param unsubscribeReason - Reason for unsubscribing (optional)
 * @param totalSubscribers - Total number of subscribers
 * @param activeSubscribers - Number of active subscribers
 * @returns A Promise that resolves when the email is sent successfully
 * @throws Will throw an error if sending the email fails
 */
export const sendUnsubscribeNotificationToAdmins = async (
  adminEmails: string[],
  adminName: string,
  subscriberEmail: string,
  subscriptionType: string,
  unsubscribeReason?: string,
  totalSubscribers: number = 0,
  activeSubscribers: number = 0
): Promise<void> => {
  try {
    const unsubscribeTime = new Date().toLocaleString();
    
    const templateData: UnsubscribeNotificationEmailData = {
      userName: adminName, // Using adminName as userName for consistency
      userEmail: adminEmails[0] || '', // Using first email for template consistency
      imageUrl: getImageUrl(),
      clientUrl: getClientUrl(),
      adminName,
      subscriberEmail,
      subscriptionType,
      unsubscribeReason,
      unsubscribeTime,
      totalSubscribers,
      activeSubscribers,
    };

    const processedHtml = unsubscribeNotificationTemplate(templateData);
    const subject = `📧 Subscriber Unsubscribed: ${subscriberEmail} - Tiny Steps A Day`;

    // Send to all admin emails
    const emailPromises = adminEmails.map(email => 
      sendMail(email, subject, processedHtml)
    );

    await Promise.all(emailPromises);

    logger.info("Unsubscribe notification emails sent to admins successfully:", {
      adminEmails,
      subscriberEmail,
      subscriptionType,
      unsubscribeReason,
      totalSubscribers,
      activeSubscribers
    });
  } catch (error) {
    logger.error("Error sending unsubscribe notification emails to admins:", error);
    throw error;
  }
};

/**
 * Get admin emails from environment variables
 * @returns Array of admin email addresses
 */
export const getAdminEmails = (): string[] => {
  const adminEmails = process.env['ADMIN_EMAILS'];
  if (!adminEmails) {
    logger.warn("ADMIN_EMAILS environment variable not set");
    return [];
  }
  
  return adminEmails.split(',').map(email => email.trim()).filter(email => email);
}; 