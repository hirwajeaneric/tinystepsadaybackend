// Authentication Email Templates
// All templates follow the base structure but vary for different use cases

export const emailVerificationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Tiny Steps A Day</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .verification-code {
            background-color: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 4px;
            color: #495057;
            font-family: 'Courier New', monospace;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .verification-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 40px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            margin: 30px 0;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .verification-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        .manual-link {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #495057;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{imageUrl}}" alt="Tiny Steps A Day Logo" class="logo">
            <h1>Verify Your Email Address</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>Thank you for signing up with Tiny Steps A Day. To complete your registration, please verify your email address.</p>
            
            <div class="verification-code">
                {{verificationCode}}
            </div>
            
            <p>Enter this code on the verification page to activate your account.</p>
            
            <a href="{{verificationUrl}}" class="verification-button">
                Go to Verification Page
            </a>
            
            <div class="warning">
                <strong>Important:</strong> This verification code will expire in 24 hours for security reasons.
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <div class="manual-link">
                {{verificationUrl}}
            </div>
            
            <p>If you didn't create an account with Tiny Steps A Day, you can safely ignore this email.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const passwordResetTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Tiny Steps A Day</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 40px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            margin: 30px 0;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .security-note {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #0c5460;
        }
        .manual-link {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #495057;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{imageUrl}}" alt="Tiny Steps A Day Logo" class="logo">
            <h1>Reset Your Password</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>We received a request to reset your password for your Tiny Steps A Day account.</p>
            
            <a href="{{resetUrl}}" class="reset-button">
                Reset My Password
            </a>
            
            <div class="security-note">
                <strong>Security Note:</strong> This link will expire in 15 minutes for your security.
            </div>
            
            <div class="warning">
                <strong>Important:</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately.
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <div class="manual-link">
                {{resetUrl}}
            </div>
            
            <p>This link will take you to our secure password reset page where you can create a new password.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`;

export const passwordChangedTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed - Tiny Steps A Day</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .success-icon {
            font-size: 48px;
            color: #28a745;
            margin: 20px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .info-box {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #0c5460;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{imageUrl}}" alt="Tiny Steps A Day Logo" class="logo">
            <h1>Password Successfully Changed</h1>
        </div>
        
        <div class="content">
            <div class="success-icon">✅</div>
            <h2>Hello {{userName}}!</h2>
            <p>Your password has been successfully changed for your Tiny Steps A Day account.</p>
            
            <div class="info-box">
                <strong>Change Details:</strong><br>
                • Time: {{changeTime}}<br>
                • IP Address: {{ipAddress}}<br>
                • Device: {{deviceInfo}}
            </div>
            
            <div class="warning">
                <strong>Security Alert:</strong> If you didn't make this change, please contact our support team immediately and consider changing your password again.
            </div>
            
            <p>For your security, all active sessions on other devices have been automatically logged out.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`;

export const accountActivatedTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Activated - Tiny Steps A Day</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .welcome-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .welcome-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{imageUrl}}" alt="Tiny Steps A Day Logo" class="logo">
            <h1>Welcome to Tiny Steps A Day!</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>Great news! Your account has been successfully activated and you're now ready to start your journey with Tiny Steps A Day.</p>
            
            <a href="{{loginUrl}}" class="welcome-button">
                Start Your Journey
            </a>
            
            <p>You can now log in to your account and explore all the features we have to offer.</p>
            
            <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const accountDeactivatedTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Deactivated - Tiny Steps A Day</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .reactivate-button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .reactivate-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .info-box {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{imageUrl}}" alt="Tiny Steps A Day Logo" class="logo">
            <h1>Account Deactivated</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>Your Tiny Steps A Day account has been deactivated as requested.</p>
            
            <div class="info-box">
                <strong>Deactivation Details:</strong><br>
                • Time: {{deactivationTime}}<br>
                • Reason: {{reason}}<br>
                • Requested by: {{requestedBy}}
            </div>
            
            <p>If you change your mind and would like to reactivate your account, please contact our support team.</p>
            
            <a href="{{supportUrl}}" class="reactivate-button">
                Contact Support
            </a>
            
            <p>We're sorry to see you go, but we understand. Thank you for being part of our community!</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`; 