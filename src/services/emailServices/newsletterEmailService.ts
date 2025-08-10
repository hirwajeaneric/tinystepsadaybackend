import {
  welcomeNewsletterTemplate,
  unsubscribeConfirmationTemplate,
  newsletterUpdateTemplate
} from '../emailTemplates/newsletterTemplates';
import {
  BaseEmailTemplateData,
  sendMail,
  getClientUrl,
  getImageUrl
} from './shared/emailUtils';
import logger from '../../utils/logger';

// Extended interfaces for newsletter email types
interface WelcomeNewsletterEmailData extends BaseEmailTemplateData {
  clientUrl: string;
  subscriptionType: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}

interface UnsubscribeConfirmationEmailData extends BaseEmailTemplateData {
  clientUrl: string;
  resubscribeUrl: string;
}

interface NewsletterUpdateEmailData extends BaseEmailTemplateData {
  clientUrl: string;
  updateTitle: string;
  updateContent: string;
  ctaUrl?: string;
  ctaText?: string;
  unsubscribeUrl: string;
}

/**
 * Sends a welcome email to new newsletter subscribers
 *
 * @param userEmail - The email address of the new subscriber
 * @param userName - The name of the subscriber (optional)
 * @param subscriptionType - The type of subscription (FOOTER, MODAL, BOOK_PUBLISH)
 * @returns A Promise that resolves when the email is sent successfully
 * @throws Will throw an error if sending the email fails
 */
export const sendWelcomeNewsletterEmail = async (
  userEmail: string,
  userName?: string,
  subscriptionType: string = "FOOTER"
): Promise<void> => {
  try {
    const templateData: WelcomeNewsletterEmailData = {
      userName: (userName || userEmail.split('@')[0]) as string, // Use email prefix if no name provided
      userEmail,
      imageUrl: getImageUrl(),
      clientUrl: getClientUrl(),
      subscriptionType,
      unsubscribeUrl: `${getClientUrl()}/unsubscribe?email=${encodeURIComponent(userEmail)}&type=${subscriptionType}`,
      preferencesUrl: `${getClientUrl()}/preferences?email=${encodeURIComponent(userEmail)}`,
    };

    const processedHtml = welcomeNewsletterTemplate(templateData);
    const subject = "Welcome to Our Newsletter! 🎉 - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Welcome newsletter email sent successfully:", {
      userEmail,
      userName,
      subscriptionType
    });
  } catch (error) {
    logger.error("Error sending welcome newsletter email:", error);
    throw error;
  }
};

/**
 * Sends an unsubscribe confirmation email
 *
 * @param userEmail - The email address of the subscriber
 * @param userName - The name of the subscriber (optional)
 * @returns A Promise that resolves when the email is sent successfully
 * @throws Will throw an error if sending the email fails
 */
export const sendUnsubscribeConfirmationEmail = async (
  userEmail: string,
  userName?: string
): Promise<void> => {
  try {
    const templateData: UnsubscribeConfirmationEmailData = {
      userName: (userName || userEmail.split('@')[0]) as string,
      userEmail,
      imageUrl: getImageUrl(),
      clientUrl: getClientUrl(),
      resubscribeUrl: `${getClientUrl()}/subscribe?email=${encodeURIComponent(userEmail)}`,
    };

    const processedHtml = unsubscribeConfirmationTemplate(templateData);
    const subject = "You've Been Unsubscribed - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Unsubscribe confirmation email sent successfully:", {
      userEmail,
      userName
    });
  } catch (error) {
    logger.error("Error sending unsubscribe confirmation email:", error);
    throw error;
  }
};

/**
 * Sends a newsletter update email to subscribers
 *
 * @param userEmail - The email address of the subscriber
 * @param userName - The name of the subscriber (optional)
 * @param updateTitle - The title of the update
 * @param updateContent - The content of the update (HTML)
 * @param ctaUrl - Optional call-to-action URL
 * @param ctaText - Optional call-to-action text
 * @returns A Promise that resolves when the email is sent successfully
 * @throws Will throw an error if sending the email fails
 */
export const sendNewsletterUpdateEmail = async (
  userEmail: string,
  userName: string | undefined,
  updateTitle: string,
  updateContent: string,
  ctaUrl?: string,
  ctaText?: string
): Promise<void> => {
  try {
    const templateData: NewsletterUpdateEmailData = {
      userName: (userName || userEmail.split('@')[0]) as string,
      userEmail,
      imageUrl: getImageUrl(),
      clientUrl: getClientUrl(),
      updateTitle,
      updateContent,
      ctaUrl,
      ctaText,
      unsubscribeUrl: `${getClientUrl()}/unsubscribe?email=${encodeURIComponent(userEmail)}`,
    };

    const processedHtml = newsletterUpdateTemplate(templateData);
    const subject = `${updateTitle} - Tiny Steps A Day`;

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Newsletter update email sent successfully:", {
      userEmail,
      userName,
      updateTitle
    });
  } catch (error) {
    logger.error("Error sending newsletter update email:", error);
    throw error;
  }
};

/**
 * Sends a book launch notification email to book publish subscribers
 *
 * @param userEmail - The email address of the subscriber
 * @param userName - The name of the subscriber (optional)
 * @param bookName - The name of the book
 * @param bookId - The ID of the book
 * @param bookUrl - The URL to purchase/view the book
 * @returns A Promise that resolves when the email is sent successfully
 * @throws Will throw an error if sending the email fails
 */
export const sendBookLaunchEmail = async (
  userEmail: string,
  userName: string | undefined,
  bookName: string,
  bookId: string,
  bookUrl: string
): Promise<void> => {
  try {
    const updateTitle = `🎉 New Book Launch: ${bookName}`;
    const updateContent = `
      <h3>Exciting News!</h3>
      <p>We're thrilled to announce the launch of our new book: <strong>${bookName}</strong></p>
      <p>As a subscriber who showed interest in this book, you're among the first to know about its release!</p>
      <p>This book is packed with insights, strategies, and practical tools to help you on your journey of personal growth and transformation.</p>
      <p><strong>What's inside:</strong></p>
      <ul>
        <li>Practical strategies for personal development</li>
        <li>Mindfulness techniques and exercises</li>
        <li>Real-life examples and case studies</li>
        <li>Actionable steps for immediate implementation</li>
      </ul>
      <p>Don't miss out on this opportunity to take your personal growth to the next level!</p>
    `;

    await sendNewsletterUpdateEmail(
      userEmail,
      userName,
      updateTitle,
      updateContent,
      bookUrl,
      "Get Your Copy Now"
    );

    logger.info("Book launch email sent successfully:", {
      userEmail,
      userName,
      bookName,
      bookId
    });
  } catch (error) {
    logger.error("Error sending book launch email:", error);
    throw error;
  }
};

/**
 * Sends a course announcement email to subscribers
 *
 * @param userEmail - The email address of the subscriber
 * @param userName - The name of the subscriber (optional)
 * @param courseName - The name of the course
 * @param courseDescription - The description of the course
 * @param courseUrl - The URL to enroll in the course
 * @param discountCode - Optional discount code
 * @returns A Promise that resolves when the email is sent successfully
 * @throws Will throw an error if sending the email fails
 */
export const sendCourseAnnouncementEmail = async (
  userEmail: string,
  userName: string | undefined,
  courseName: string,
  courseDescription: string,
  courseUrl: string,
  discountCode?: string
): Promise<void> => {
  try {
    const updateTitle = `📚 New Course: ${courseName}`;
    let updateContent = `
      <h3>New Course Available!</h3>
      <p>We're excited to announce our latest course: <strong>${courseName}</strong></p>
      <p>${courseDescription}</p>
      <p>This course is designed to help you develop new skills, gain insights, and make meaningful progress in your personal and professional life.</p>
    `;

    if (discountCode) {
      updateContent += `
        <p><strong>Special Offer:</strong> Use code <code>${discountCode}</code> to get a discount on this course!</p>
      `;
    }

    updateContent += `
      <p>Enroll now and start your learning journey today!</p>
    `;

    await sendNewsletterUpdateEmail(
      userEmail,
      userName,
      updateTitle,
      updateContent,
      courseUrl,
      "Enroll Now"
    );

    logger.info("Course announcement email sent successfully:", {
      userEmail,
      userName,
      courseName,
      discountCode
    });
  } catch (error) {
    logger.error("Error sending course announcement email:", error);
    throw error;
  }
}; 