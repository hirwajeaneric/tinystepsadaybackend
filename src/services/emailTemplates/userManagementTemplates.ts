// User Management Email Templates
// Templates for user account management operations

export const roleChangedTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Role Updated - Tiny Steps A Day</title>
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
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
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
        .role-badge {
            display: inline-block;
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 5px;
        }
        .login-button {
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
        .login-button:hover {
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
            <h1>Role Updated</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>Your role in Tiny Steps A Day has been updated.</p>
            
            <div class="info-box">
                <strong>Role Change Details:</strong><br>
                • Previous Role: <span class="role-badge">{{oldRole}}</span><br>
                • New Role: <span class="role-badge">{{newRole}}</span><br>
                • Changed by: {{changedBy}}<br>
                • Time: {{changeTime}}<br>
                • Reason: {{reason}}
            </div>
            
            <p>With your new role, you now have access to additional features and permissions.</p>
            
            <a href="{{loginUrl}}" class="login-button">
                Access Your Account
            </a>
            
            <p>If you have any questions about your new role or permissions, please contact our support team.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const accountStatusChangedTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Status Updated - Tiny Steps A Day</title>
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
        .header.deactivated {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
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
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 5px;
        }
        .status-active {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
        }
        .status-inactive {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
        }
        .action-button {
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
        .action-button:hover {
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
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #0c5460;
        }
        .info-box.deactivated {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header {{#if isDeactivated}}deactivated{{/if}}">
            <img src="{{imageUrl}}" alt="Tiny Steps A Day Logo" class="logo">
            <h1>{{#if isDeactivated}}Account Deactivated{{else}}Account Activated{{/if}}</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>Your Tiny Steps A Day account status has been updated.</p>
            
            <div class="info-box {{#if isDeactivated}}deactivated{{/if}}">
                <strong>Status Change Details:</strong><br>
                • Previous Status: <span class="status-badge {{#if wasActive}}status-active{{else}}status-inactive{{/if}}">{{previousStatus}}</span><br>
                • New Status: <span class="status-badge {{#if isActive}}status-active{{else}}status-inactive{{/if}}">{{newStatus}}</span><br>
                • Changed by: {{changedBy}}<br>
                • Time: {{changeTime}}<br>
                • Reason: {{reason}}
            </div>
            
            {{#if isActive}}
                <p>Your account is now active and you can access all features.</p>
                <a href="{{loginUrl}}" class="action-button">
                    Access Your Account
                </a>
            {{else}}
                <p>Your account has been deactivated. You will no longer be able to access your account until it is reactivated.</p>
                <a href="{{supportUrl}}" class="action-button">
                    Contact Support
                </a>
            {{/if}}
            
            <p>If you have any questions about this change, please contact our support team.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const welcomeEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Tiny Steps A Day!</title>
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
        .feature-list {
            text-align: left;
            margin: 30px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .feature-list li {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
        }
        .feature-list li:before {
            content: "✓";
            color: #28a745;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .get-started-button {
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
        .get-started-button:hover {
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
            <p>Welcome to Tiny Steps A Day! We're excited to have you join our community of learners and achievers.</p>
            
            <p>Here's what you can do with your new account:</p>
            
            <div class="feature-list">
                <ul>
                    <li>Track your daily progress and habits</li>
                    <li>Set and achieve personal goals</li>
                    <li>Connect with like-minded individuals</li>
                    <li>Access exclusive content and resources</li>
                    <li>Join challenges and competitions</li>
                    <li>Monitor your growth over time</li>
                </ul>
            </div>
            
            <a href="{{dashboardUrl}}" class="get-started-button">
                Get Started
            </a>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <p>Happy learning and growing!</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const profileUpdatedTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile Updated - Tiny Steps A Day</title>
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
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
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
        .changes-list {
            text-align: left;
            margin: 30px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .changes-list li {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
        }
        .changes-list li:before {
            content: "•";
            color: #17a2b8;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .view-profile-button {
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
        .view-profile-button:hover {
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{imageUrl}}" alt="Tiny Steps A Day Logo" class="logo">
            <h1>Profile Updated</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>Your Tiny Steps A Day profile has been successfully updated.</p>
            
            <div class="changes-list">
                <strong>Updated Information:</strong>
                <ul>
                    {{#each changes}}
                        <li>{{this}}</li>
                    {{/each}}
                </ul>
            </div>
            
            <div class="warning">
                <strong>Security Note:</strong> If you didn't make these changes, please contact our support team immediately.
            </div>
            
            <a href="{{profileUrl}}" class="view-profile-button">
                View Your Profile
            </a>
            
            <p>Your updated information will be reflected across all our services.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`; 