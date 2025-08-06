import { BaseEmailTemplateData } from '../emailServices/shared/emailUtils';

// Newsletter Email Templates

/**
 * Welcome email template for new newsletter subscribers
 */
export const welcomeNewsletterTemplate = (data: BaseEmailTemplateData & {
  clientUrl: string;
  subscriptionType: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Newsletter!</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 20px;
        }
        .title {
            color: #2c3e50;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #7f8c8d;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .content {
            margin-bottom: 30px;
        }
        .welcome-text {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        .features {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .feature-item {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
        }
        .feature-item:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #27ae60;
            font-weight: bold;
        }
        .cta-buttons {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .btn-primary {
            background-color: #3498db;
            color: white;
        }
        .btn-primary:hover {
            background-color: #2980b9;
        }
        .btn-secondary {
            background-color: #95a5a6;
            color: white;
        }
        .btn-secondary:hover {
            background-color: #7f8c8d;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            color: #7f8c8d;
            font-size: 14px;
        }
        .unsubscribe-link {
            color: #e74c3c;
            text-decoration: none;
        }
        .unsubscribe-link:hover {
            text-decoration: underline;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #3498db;
            text-decoration: none;
        }
        .social-links a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${data.imageUrl}" alt="Tiny Steps A Day" class="logo">
            <h1 class="title">Welcome to Our Newsletter! 🎉</h1>
            <p class="subtitle">You're now part of our mindful community</p>
        </div>
        
        <div class="content">
            <p class="welcome-text">
                Hi ${data.userName || 'there'}! 👋
            </p>
            
            <p>
                Thank you for subscribing to our newsletter! We're excited to have you join our community of like-minded individuals on a journey of self-discovery, growth, and transformation.
            </p>
            
            <div class="features">
                <h3>What you can expect from us:</h3>
                <div class="feature-item">Weekly insights and inspiration for personal growth</div>
                <div class="feature-item">Exclusive content and early access to new programs</div>
                <div class="feature-item">Mindfulness tips and practical strategies</div>
                <div class="feature-item">Community updates and success stories</div>
                <div class="feature-item">Special offers and discounts on our courses</div>
            </div>
            
            <p>
                We're committed to providing you with valuable content that helps you take tiny steps toward your goals every day. Our emails are designed to inspire, educate, and support you on your journey.
            </p>
        </div>
        
        <div class="cta-buttons">
            <a href="${data.clientUrl}/courses" class="btn btn-primary text-white">Explore Our Courses</a>
            <a href="${data.clientUrl}/blog" class="btn btn-secondary text-white">Read Our Blog</a>
        </div>
        
        <div class="footer">
            <p>
                You're receiving this email because you subscribed to our newsletter.
            </p>
            <p>
                <a href="${data.preferencesUrl}" class="unsubscribe-link">Manage Preferences</a> | 
                <a href="${data.unsubscribeUrl}" class="unsubscribe-link">Unsubscribe</a>
            </p>
            <p>
                Tiny Steps A Day<br>
                Guiding you through your journey of self-discovery, growth, and transformation.
            </p>
            <div class="social-links">
                <a href="https://www.instagram.com/tinystepsaday">Instagram</a> |
                <a href="https://www.facebook.com/tinystepsaday">Facebook</a> |
                <a href="https://x.com/tiny_steps_aday">Twitter</a> |
                <a href="https://www.linkedin.com/company/tinystepsaday">LinkedIn</a>
            </div>
        </div>
    </div>
</body>
</html>
`;

/**
 * Unsubscribe confirmation email template
 */
export const unsubscribeConfirmationTemplate = (data: BaseEmailTemplateData & {
  clientUrl: string;
  resubscribeUrl: string;
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You've Been Unsubscribed</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 20px;
        }
        .title {
            color: #2c3e50;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .content {
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background-color: #2980b9;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            color: #7f8c8d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${data.imageUrl}" alt="Tiny Steps A Day" class="logo">
            <h1 class="title">You've Been Unsubscribed</h1>
        </div>
        
        <div class="content">
            <p>
                Hi ${data.userName || 'there'},
            </p>
            
            <p>
                We're sorry to see you go! You've been successfully unsubscribed from our newsletter and will no longer receive our emails.
            </p>
            
            <p>
                If you change your mind and would like to rejoin our community, you can always resubscribe at any time. We'd love to have you back!
            </p>
            
            <p>
                Thank you for being part of our journey. We hope our content has been valuable to you.
            </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resubscribeUrl}" class="btn">Resubscribe to Newsletter</a>
        </div>
        
        <div class="footer">
            <p>
                Tiny Steps A Day<br>
                Guiding you through your journey of self-discovery, growth, and transformation.
            </p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Newsletter update template for important announcements
 */
export const newsletterUpdateTemplate = (data: BaseEmailTemplateData & {
  clientUrl: string;
  updateTitle: string;
  updateContent: string;
  ctaUrl?: string;
  ctaText?: string;
  unsubscribeUrl: string;
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.updateTitle}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 20px;
        }
        .title {
            color: #2c3e50;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .content {
            margin-bottom: 30px;
        }
        .update-content {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background-color: #2980b9;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            color: #7f8c8d;
            font-size: 14px;
        }
        .unsubscribe-link {
            color: #e74c3c;
            text-decoration: none;
        }
        .unsubscribe-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${data.imageUrl}" alt="Tiny Steps A Day" class="logo">
            <h1 class="title">${data.updateTitle}</h1>
        </div>
        
        <div class="content">
            <p>
                Hi ${data.userName || 'there'},
            </p>
            
            <div class="update-content">
                ${data.updateContent}
            </div>
            
            ${data.ctaUrl && data.ctaText ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.ctaUrl}" class="btn">${data.ctaText}</a>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>
                <a href="${data.unsubscribeUrl}" class="unsubscribe-link">Unsubscribe</a>
            </p>
            <p>
                Tiny Steps A Day<br>
                Guiding you through your journey of self-discovery, growth, and transformation.
            </p>
        </div>
    </div>
</body>
</html>
`; 