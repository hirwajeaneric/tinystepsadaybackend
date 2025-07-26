import { Resend } from 'resend';
import logger from '../../../utils/logger';

// Initialize Resend
const resend = new Resend(process.env['RESEND_API_KEY']);

// Base email template data interface
export interface BaseEmailTemplateData {
  userName: string;
  userEmail: string;
  imageUrl: string;
}

// Generic template processor
export const processTemplate = (template: string, data: Record<string, any>): string => {
  let processedTemplate = template;
  
  // Replace all placeholders with actual values
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processedTemplate = processedTemplate.replace(placeholder, data[key] || '');
  });
  
  return processedTemplate;
};

// Send email using Resend
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

// Get client URL and image URL
export const getClientUrl = (): string => {
  return process.env['CLIENT_URL'] || 'https://www.tinystepsaday.com';
};

export const getImageUrl = (): string => {
  return `${getClientUrl()}/tinystepsaday-logo.png`;
}; 