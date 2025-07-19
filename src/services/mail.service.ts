import { Resend } from "resend";
import fs from "fs";
import path from "path";
import logger from "../utils/logger";

const resend = new Resend(process.env["RESEND_API_KEY"] as string);

// Email template interface
interface EmailTemplateData {
  userName: string;
  userEmail: string;
  verificationCode: string;
  verificationUrl?: string;
}

// Load email template
const loadEmailTemplate = (): string => {
  try {
    const templatePath = path.join(__dirname, "emailTemplate.html");
    return fs.readFileSync(templatePath, "utf-8");
  } catch (error) {
    logger.error("Error loading email template:", error);
    throw new Error("Failed to load email template");
  }
};

// Process template with data
const processTemplate = (template: string, data: EmailTemplateData): string => {
  let processedTemplate = template;
  
  // Replace placeholders with actual data
  processedTemplate = processedTemplate.replace(/{{userName}}/g, data.userName);
  processedTemplate = processedTemplate.replace(/{{userEmail}}/g, data.userEmail);
  processedTemplate = processedTemplate.replace(/{{verificationCode}}/g, data.verificationCode);
  
  if (data.verificationUrl) {
    processedTemplate = processedTemplate.replace(/{{verificationUrl}}/g, data.verificationUrl);
  } else {
    // Remove the verification URL button if no URL provided
    processedTemplate = processedTemplate.replace(
      /<div style="text-align: center;">\s*<a href="{{verificationUrl}}" class="button">Verify Email Address<\/a>\s*<\/div>/g,
      ""
    );
  }
  
  return processedTemplate;
};

// Generate verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Tiny Steps A Day <hello@tinystepsaday.com>",
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      logger.error("Resend API error:", error);
      throw error;
    }

    logger.info("Email sent successfully:", { to, subject });
    return data;
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
};

// Send verification code email
export const sendVerificationCode = async (
  userEmail: string,
  userName: string,
  verificationCode: string,
  verificationUrl?: string
): Promise<void> => {
  try {
    const template = loadEmailTemplate();
    const templateData: EmailTemplateData = {
      userName,
      userEmail,
      verificationCode,
      ...(verificationUrl && { verificationUrl }),
    };

    const processedHtml = processTemplate(template, templateData);
    const subject = "Verify Your Email - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);
    
    logger.info("Verification code email sent successfully:", { 
      userEmail, 
      userName,
      verificationCode 
    });
  } catch (error) {
    logger.error("Error sending verification code email:", error);
    throw error;
  }
};

// Convenience function to generate and send verification code
export const generateAndSendVerificationCode = async (
  userEmail: string,
  userName: string,
  verificationUrl?: string
): Promise<string> => {
  const verificationCode = generateVerificationCode();
  await sendVerificationCode(userEmail, userName, verificationCode, verificationUrl);
  return verificationCode;
};