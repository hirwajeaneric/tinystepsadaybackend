import {
  sendMail,
  getClientUrl
} from './shared/emailUtils';
import logger from '../../utils/logger';

/**
 * Send confirmation email to user when they submit a contact message
 * @param userEmail - The email address of the user who submitted the message
 * @param userName - The name of the user
 * @param messageSubject - The subject of the message
 * @param messageContent - The content of the message
 * @param messageId - The ID of the message
 */
export async function generateAndSendContactConfirmationEmail(
  userEmail: string,
  userName: string,
  messageSubject: string,
  messageContent: string,
  messageId: string
): Promise<void> {
  try {
    const subject = 'Message Received - Tiny Steps A Day';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Message Received</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for contacting us! We have received your message and will get back to you as soon as possible.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Your Message Details:</h3>
          <p><strong>Subject:</strong> ${messageSubject}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">
            ${messageContent.replace(/\n/g, '<br>')}
          </div>
          <p><strong>Message ID:</strong> ${messageId}</p>
        </div>
        
        <p>We typically respond within 24-48 hours during business days. If you have any urgent concerns, please don't hesitate to reach out again.</p>
        
        <p>Best regards,<br>The Tiny Steps A Day Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated confirmation email. Please do not reply to this email.</p>
      </div>
    `;

    await sendMail(userEmail, subject, htmlContent);
    logger.info('Contact confirmation email sent successfully', { userEmail, messageId });
  } catch (error) {
    logger.error('Failed to send contact confirmation email:', error);
    throw error;
  }
}

/**
 * Send notification email to management users when a new contact message is received
 * @param managementEmails - Array of management user emails
 * @param messageData - The message data
 * @param messageId - The ID of the message
 */
export async function generateAndSendNewMessageNotificationEmail(
  managementEmails: string[],
  messageData: {
    name: string;
    email: string;
    subject: string;
    message: string;
    category: string;
    priority: string;
    source: string;
  },
  messageId: string
): Promise<void> {
  try {
    const subject = `New Contact Message - ${messageData.subject}`;
    const priorityColor = messageData.priority === 'urgent' ? '#dc3545' : 
                         messageData.priority === 'high' ? '#fd7e14' : 
                         messageData.priority === 'medium' ? '#ffc107' : '#28a745';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">New Contact Message Received</h2>
        <p>Hello Team Member,</p>
        <p>A new contact message has been received and requires your attention.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Message Details:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
            <div>
              <p><strong>From:</strong> ${messageData.name}</p>
              <p><strong>Email:</strong> ${messageData.email}</p>
              <p><strong>Subject:</strong> ${messageData.subject}</p>
            </div>
            <div>
              <p><strong>Category:</strong> ${messageData.category}</p>
              <p><strong>Priority:</strong> <span style="color: ${priorityColor}; font-weight: bold;">${messageData.priority.toUpperCase()}</span></p>
              <p><strong>Source:</strong> ${messageData.source}</p>
            </div>
          </div>
          
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff; margin: 10px 0;">
            ${messageData.message.replace(/\n/g, '<br>')}
          </div>
          
          <p><strong>Message ID:</strong> ${messageId}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${getClientUrl()}/management/messages/${messageId}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Message in Dashboard
          </a>
        </div>
        
        <p>Please respond to this message as soon as possible, especially if it's marked as urgent.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated notification email. Please do not reply to this email.</p>
      </div>
    `;

    // Send to all management users
    for (const email of managementEmails) {
      await sendMail(email, subject, htmlContent);
    }
    
    logger.info('New message notification emails sent successfully', { 
      managementEmails, 
      messageId,
      recipientCount: managementEmails.length 
    });
  } catch (error) {
    logger.error('Failed to send new message notification emails:', error);
    throw error;
  }
}

/**
 * Send notification email to original sender when a reply is sent
 * @param originalSenderEmail - The email of the original message sender
 * @param originalSenderName - The name of the original message sender
 * @param replyContent - The content of the reply
 * @param replySenderName - The name of the person who sent the reply
 * @param originalMessageSubject - The subject of the original message
 * @param messageId - The ID of the message
 */
export async function generateAndSendReplyNotificationEmail(
  originalSenderEmail: string,
  originalSenderName: string,
  replyContent: string,
  replySenderName: string,
  originalMessageSubject: string,
  messageId: string
): Promise<void> {
  try {
    const subject = `Re: ${originalMessageSubject} - Tiny Steps A Day`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Reply to Your Message</h2>
        <p>Hello ${originalSenderName},</p>
        <p>You have received a reply to your message from our team.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Reply Details:</h3>
          <p><strong>From:</strong> ${replySenderName} (Tiny Steps A Day Team)</p>
          <p><strong>Original Subject:</strong> ${originalMessageSubject}</p>
          
          <p><strong>Reply:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #28a745; margin: 10px 0;">
            ${replyContent.replace(/\n/g, '<br>')}
          </div>
          
          <p><strong>Message ID:</strong> ${messageId}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${getClientUrl()}/contact" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Full Conversation
          </a>
        </div>
        
        <p>If you have any follow-up questions, please feel free to reply to this email or contact us again.</p>
        
        <p>Best regards,<br>The Tiny Steps A Day Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated notification email. You can reply to this email to continue the conversation.</p>
      </div>
    `;

    await sendMail(originalSenderEmail, subject, htmlContent);
    logger.info('Reply notification email sent successfully', { 
      originalSenderEmail, 
      messageId,
      replySenderName 
    });
  } catch (error) {
    logger.error('Failed to send reply notification email:', error);
    throw error;
  }
}

/**
 * Send notification email to management users when a reply is sent
 * @param managementEmails - Array of management user emails
 * @param replyData - The reply data
 * @param messageId - The ID of the message
 */
export async function generateAndSendReplySentNotificationEmail(
  managementEmails: string[],
  replyData: {
    originalSenderName: string;
    originalSenderEmail: string;
    replyContent: string;
    replySenderName: string;
    originalMessageSubject: string;
  },
  messageId: string
): Promise<void> {
  try {
    const subject = `Reply Sent - ${replyData.originalMessageSubject}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Reply Sent Successfully</h2>
        <p>Hello Team Member,</p>
        <p>A reply has been sent to a contact message.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Reply Details:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
            <div>
              <p><strong>To:</strong> ${replyData.originalSenderName}</p>
              <p><strong>Email:</strong> ${replyData.originalSenderEmail}</p>
              <p><strong>Subject:</strong> ${replyData.originalMessageSubject}</p>
            </div>
            <div>
              <p><strong>Replied By:</strong> ${replyData.replySenderName}</p>
              <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">SENT</span></p>
            </div>
          </div>
          
          <p><strong>Reply Content:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #28a745; margin: 10px 0;">
            ${replyData.replyContent.replace(/\n/g, '<br>')}
          </div>
          
          <p><strong>Message ID:</strong> ${messageId}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${getClientUrl()}/management/messages/${messageId}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Message Thread
          </a>
        </div>
        
        <p>The reply has been sent successfully and the original sender has been notified.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated notification email. Please do not reply to this email.</p>
      </div>
    `;

    // Send to all management users
    for (const email of managementEmails) {
      await sendMail(email, subject, htmlContent);
    }
    
    logger.info('Reply sent notification emails sent successfully', { 
      managementEmails, 
      messageId,
      replySenderName: replyData.replySenderName,
      recipientCount: managementEmails.length 
    });
  } catch (error) {
    logger.error('Failed to send reply sent notification emails:', error);
    throw error;
  }
} 