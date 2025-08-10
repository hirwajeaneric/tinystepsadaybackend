import { BaseEmailTemplateData } from '../emailServices/shared/emailUtils';

/**
 * Admin notification template for unsubscribe events
 */
export const unsubscribeNotificationTemplate = (data: BaseEmailTemplateData & {
  clientUrl: string;
  adminName: string;
  subscriberEmail: string;
  subscriptionType: string;
  unsubscribeReason?: string;
  unsubscribeTime: string;
  totalSubscribers: number;
  activeSubscribers: number;
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscriber Unsubscribed - Admin Notification</title>
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
            border-bottom: 2px solid #e74c3c;
            padding-bottom: 20px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 20px;
        }
        .title {
            color: #e74c3c;
            font-size: 24px;
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
        .notification-box {
            background-color: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
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
            border-radius: 6px;
            border-left: 4px solid #3498db;
        }
        .info-label {
            font-weight: bold;
            color: #2c3e50;
            font-size: 14px;
            margin-bottom: 5px;
        }
        .info-value {
            color: #34495e;
            font-size: 16px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        .stat-item {
            background-color: #e8f5e8;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            border-left: 4px solid #27ae60;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #27ae60;
        }
        .stat-label {
            font-size: 14px;
            color: #2c3e50;
            margin-top: 5px;
        }
        .reason-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
        }
        .reason-label {
            font-weight: bold;
            color: #856404;
            margin-bottom: 5px;
        }
        .reason-value {
            color: #856404;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            color: #7f8c8d;
            font-size: 14px;
        }
        .admin-link {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            transition: background-color 0.3s ease;
        }
        .admin-link:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${data.imageUrl}" alt="Tiny Steps A Day" class="logo">
            <h1 class="title">📧 Subscriber Unsubscribed</h1>
            <p class="subtitle">Admin Notification</p>
        </div>
        
        <div class="content">
            <p>
                Hi ${data.adminName},
            </p>
            
            <div class="notification-box">
                <p>
                    A subscriber has unsubscribed from our newsletter. Here are the details:
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Subscriber Email</div>
                    <div class="info-value">${data.subscriberEmail}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Subscription Type</div>
                    <div class="info-value">${data.subscriptionType}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Unsubscribe Time</div>
                    <div class="info-value">${data.unsubscribeTime}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Admin Name</div>
                    <div class="info-value">${data.adminName}</div>
                </div>
            </div>
            
            ${data.unsubscribeReason ? `
            <div class="reason-box">
                <div class="reason-label">Unsubscribe Reason:</div>
                <div class="reason-value">${data.unsubscribeReason}</div>
            </div>
            ` : ''}
            
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${data.totalSubscribers}</div>
                    <div class="stat-label">Total Subscribers</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${data.activeSubscribers}</div>
                    <div class="stat-label">Active Subscribers</div>
                </div>
            </div>
            
            <p>
                This notification helps you track subscriber engagement and identify potential areas for improvement in your newsletter strategy.
            </p>
        </div>
        
        <div style="text-align: center;">
            <a href="${data.clientUrl}/management/subscribers" class="admin-link">View Subscribers Dashboard</a>
        </div>
        
        <div class="footer">
            <p>
                Tiny Steps A Day - Admin Notification System<br>
                This is an automated notification. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
`; 