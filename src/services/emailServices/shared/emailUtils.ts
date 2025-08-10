import { Resend } from 'resend';
import logger from '../../../utils/logger';

// Initialize Resend
const resend = new Resend(process.env['RESEND_API_KEY']);

/**
 * Base email template data interface
 * @param userName - The name of the user.
 * @param userEmail - The email address of the user.
 * @param imageUrl - The URL of the image to be used in the email.
 */
export interface BaseEmailTemplateData {
  userName: string;
  userEmail: string;
  imageUrl: string;
}

/**
 * Generic template processor
 * @param template - The template to be processed.
 * @param data - The data to be used in the template.
 * @returns The processed template.
 */
export const processTemplate = (template: string, data: Record<string, any>): string => {
  let processedTemplate = template;
  
  // Replace all placeholders with actual values
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processedTemplate = processedTemplate.replace(placeholder, data[key] || '');
  });
  
  return processedTemplate;
};

/**
 * Send email using Resend
 * @param to - The email address of the recipient.
 * @param subject - The subject of the email.
 * @param html - The HTML content of the email.
 */
export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    await resend.emails.send({
      from: 'Tiny Steps A Day <noreply@tinystepsaday.com>',
      to: [to],
      subject: subject,
      html: html,
    });
    
    logger.info('Email sent successfully:', { to, subject });
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};

/**
 * Get client URL
 * @returns The client URL.
 */
export const getClientUrl = (): string => {
  return process.env['CLIENT_URL'] || 'https://www.tinystepsaday.com';
};

/**
 * Get image URL
 * @returns The image URL.
 */
export const getImageUrl = (): string => {
  return `${getClientUrl()}/tinystepsaday-logo.png`;
}; 