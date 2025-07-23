import { Resend } from "resend";
import logger from "../utils/logger";

const resend = new Resend(process.env["RESEND_API_KEY"] as string);

// Email template interface
interface EmailTemplateData {
    userName: string;
    userEmail: string;
    verificationCode: string;
    verificationUrl?: string;
    imageUrl: string;
}

// Embedded email template
const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tiny Steps A Day</title>
    <style>
        /* Reset styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8f9fa;
        }

        /* Container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #A98FF3 0%, #8B7FD8 100%);
            padding: 40px 30px;
            text-align: center;
        }

        .logo {
            width: 80px;
            height: 80px;
            background-color: #ffffff;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #A98FF3;
        }

        .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 400;
        }

        /* Content */
        .content {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 20px;
        }

        .message {
            font-size: 16px;
            color: #666666;
            margin-bottom: 30px;
            line-height: 1.7;
        }

        /* Verification Code Section */
        .verification-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
        }

        .verification-title {
            font-size: 18px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 15px;
        }

        .verification-code {
            background: linear-gradient(135deg, #A98FF3 0%, #8B7FD8 100%);
            color: #ffffff;
            font-size: 32px;
            font-weight: 700;
            padding: 20px;
            border-radius: 8px;
            letter-spacing: 8px;
            margin: 20px 0;
            display: inline-block;
            min-width: 200px;
        }

        .verification-note {
            font-size: 14px;
            color: #888888;
            margin-top: 15px;
        }

        /* Button */
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #A98FF3 0%, #8B7FD8 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }

        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(169, 143, 243, 0.3);
        }

        /* Footer */
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }

        .footer p {
            font-size: 14px;
            color: #888888;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #A98FF3;
            text-decoration: none;
            font-weight: 500;
        }

        .social-link:hover {
            text-decoration: underline;
        }

        /* Mobile Responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }

            .header {
                padding: 30px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .content {
                padding: 30px 20px;
            }

            .verification-section {
                padding: 20px;
                margin: 20px 0;
            }

            .verification-code {
                font-size: 24px;
                letter-spacing: 4px;
                padding: 15px;
                min-width: 150px;
            }

            .footer {
                padding: 20px;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #1a1a1a;
            }

            .email-container {
                background-color: #2d2d2d;
            }

            .content {
                color: #e0e0e0;
            }

            .greeting {
                color: #ffffff;
            }

            .message {
                color: #cccccc;
            }

            .verification-section {
                background-color: #3a3a3a;
            }

            .verification-title {
                color: #ffffff;
            }

            .footer {
                background-color: #3a3a3a;
                border-top-color: #4a4a4a;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <img src="{{imageUrl}}" alt="Tiny Steps A Day Logo" class="logo" style="width: 80px; height: 80px; background-color: #ffffff; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; object-fit: contain;" />
            <h1>Tiny Steps A Day</h1>
            <p>Building habits, one step at a time</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">Hello {{userName}},</div>
            
            <div class="message">
                Welcome to Tiny Steps A Day! We're excited to have you join our community of habit builders. 
                To get started, please verify your email address using the verification code below.
            </div>

            <!-- Verification Code Section -->
            <div class="verification-section">
                <div class="verification-title">Your Verification Code</div>
                <div class="verification-code">{{verificationCode}}</div>
                <div class="verification-note">
                    This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
                </div>
            </div>

            <div class="message">
                Once verified, you'll be able to access all features and start building your daily habits. 
                If you have any questions, feel free to reach out to our support team.
            </div>

            <div style="text-align: center; color: white;">
                <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© 2025 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}. If you didn't create an account, please ignore this email.</p>
            
            <div class="social-links">
                <a href="#" class="social-link">Privacy Policy</a>
                <a href="#" class="social-link">Terms of Service</a>
                <a href="#" class="social-link">Support</a>
            </div>
        </div>
    </div>
</body>
</html>`;

// Load email template
const loadEmailTemplate = (): string => {
    return EMAIL_TEMPLATE;
};

const clientUrl = process.env["FRONTEND_URL"] as string;

// Process template with data
const processTemplate = (template: string, data: EmailTemplateData): string => {
    let processedTemplate = template;

    // Replace placeholders with actual data
    processedTemplate = processedTemplate.replace(/{{userName}}/g, data.userName);
    processedTemplate = processedTemplate.replace(/{{userEmail}}/g, data.userEmail);
    processedTemplate = processedTemplate.replace(/{{verificationCode}}/g, data.verificationCode);
    processedTemplate = processedTemplate.replace(/{{imageUrl}}/g, data.imageUrl);

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
            imageUrl: `${clientUrl}/tinystepsaday-logo.png`,
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
    verificationUrl: string,
    verificationCode: string
): Promise<string> => {
    await sendVerificationCode(userEmail, userName, verificationCode, verificationUrl);
    return verificationCode as string;
};