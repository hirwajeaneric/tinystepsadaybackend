// Message Notification Email Templates

export const messageNotificationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Message - Tiny Steps A Day</title>
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
            text-align: left;
        }
        .message-details {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .priority-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .priority-urgent { background-color: #dc3545; color: white; }
        .priority-high { background-color: #fd7e14; color: white; }
        .priority-medium { background-color: #ffc107; color: #212529; }
        .priority-low { background-color: #28a745; color: white; }
        .category-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-left: 10px;
        }
        .category-general { background-color: #6c757d; color: white; }
        .category-support { background-color: #007bff; color: white; }
        .category-mentorship { background-color: #28a745; color: white; }
        .category-billing { background-color: #fd7e14; color: white; }
        .category-technical { background-color: #dc3545; color: white; }
        .category-feedback { background-color: #e83e8c; color: white; }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
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
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        .info-item {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #667eea;
        }
        .info-label {
            font-weight: bold;
            color: #495057;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-value {
            color: #212529;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{imageUrl}}" alt="Tiny Steps A Day Logo" class="logo">
            <h1>New Contact Message</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>A new contact message has been received and requires your attention.</p>
            
            <div class="message-details">
                <div class="priority-badge priority-{{priority}}">{{priority}}</div>
                <div class="category-badge category-{{category}}">{{category}}</div>
                
                <h3>{{subject}}</h3>
                <p><strong>From:</strong> {{senderName}} ({{senderEmail}})</p>
                <p><strong>Message:</strong></p>
                <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; border: 1px solid #dee2e6;">
                    {{message}}
                </div>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Message ID</div>
                    <div class="info-value">{{messageId}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Received</div>
                    <div class="info-value">{{receivedAt}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Source</div>
                    <div class="info-value">{{source}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Tags</div>
                    <div class="info-value">{{tags}}</div>
                </div>
            </div>
            
            <a href="{{managementUrl}}" class="action-button">
                View & Respond
            </a>
            
            <p>This link will take you directly to the message in your management dashboard where you can view the full details and respond to the sender.</p>
            
            <p>Please respond promptly to ensure excellent customer service.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const messageReplyNotificationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Response to Your Message - Tiny Steps A Day</title>
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
            color: white !important;
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
            text-align: left;
        }
        .reply-box {
            background-color: #f8f9fa;
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .original-message {
            background-color: #e9ecef;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
            font-style: italic;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .sender-info {
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
            <h1>Response to Your Message</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>Thank you for contacting Tiny Steps A Day. We've received your message and here's our response:</p>
            
            <div class="reply-box">
                <h3>Our Response:</h3>
                <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; border: 1px solid #dee2e6;">
                    {{replyContent}}
                </div>
            </div>
            
            <div class="sender-info">
                <strong>Response from:</strong> {{senderName}}<br>
                <strong>Subject:</strong> {{subject}}
            </div>
            
            <div class="original-message">
                <h4>Your Original Message:</h4>
                <p>{{originalMessage}}</p>
            </div>
            
            <p>If you have any follow-up questions or need further assistance, please don't hesitate to reply to this email or contact us through our website.</p>
            
            <p>Thank you for choosing Tiny Steps A Day!</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`; 