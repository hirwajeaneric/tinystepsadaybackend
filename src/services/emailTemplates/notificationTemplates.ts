// Notification Email Templates
// Templates for various notification types

export const generalNotificationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - Tiny Steps A Day</title>
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
        .notification-content {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
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
        .timestamp {
            color: #6c757d;
            font-size: 14px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{imageUrl}}" alt="Tiny Steps A Day Logo" class="logo">
            <h1>{{title}}</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            
            <div class="notification-content">
                {{message}}
            </div>
            
            {{#if actionUrl}}
                <a href="{{actionUrl}}" class="action-button">
                    {{actionText}}
                </a>
            {{/if}}
            
            <div class="timestamp">
                Sent on {{timestamp}}
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const achievementNotificationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Achievement Unlocked! - Tiny Steps A Day</title>
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
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #333;
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
        .achievement-badge {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px auto;
            font-size: 40px;
            color: #333;
        }
        .achievement-details {
            background-color: #fff8dc;
            border: 2px solid #ffd700;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .view-achievement-button {
            display: inline-block;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #333;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .view-achievement-button:hover {
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
            <h1>🎉 Achievement Unlocked!</h1>
        </div>
        
        <div class="content">
            <h2>Congratulations, {{userName}}!</h2>
            
            <div class="achievement-badge">
                🏆
            </div>
            
            <div class="achievement-details">
                <h3>{{achievementName}}</h3>
                <p>{{achievementDescription}}</p>
                <p><strong>Points Earned:</strong> {{pointsEarned}}</p>
                <p><strong>Unlocked on:</strong> {{unlockDate}}</p>
            </div>
            
            <p>Keep up the great work! Every small step counts towards your bigger goals.</p>
            
            <a href="{{achievementUrl}}" class="view-achievement-button">
                View Your Achievements
            </a>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const reminderNotificationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reminder - Tiny Steps A Day</title>
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
        .reminder-box {
            background-color: #e3f2fd;
            border: 2px solid #17a2b8;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .reminder-icon {
            font-size: 48px;
            color: #17a2b8;
            margin: 10px 0;
        }
        .complete-button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .complete-button:hover {
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
            <h1>⏰ Reminder</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            
            <div class="reminder-icon">⏰</div>
            
            <div class="reminder-box">
                <h3>{{reminderTitle}}</h3>
                <p>{{reminderMessage}}</p>
                <p><strong>Due:</strong> {{dueDate}}</p>
                {{#if priority}}
                    <p><strong>Priority:</strong> <span style="color: #dc3545;">{{priority}}</span></p>
                {{/if}}
            </div>
            
            <p>Don't forget to take care of this important task!</p>
            
            <a href="{{taskUrl}}" class="complete-button">
                Complete Task
            </a>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const challengeNotificationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Challenge Available! - Tiny Steps A Day</title>
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
            background: linear-gradient(135deg, #e83e8c 0%, #dc3545 100%);
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
        .challenge-card {
            background-color: #f8f9fa;
            border: 2px solid #e83e8c;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .challenge-stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
        }
        .stat {
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #e83e8c;
        }
        .stat-label {
            font-size: 12px;
            color: #6c757d;
        }
        .join-challenge-button {
            display: inline-block;
            background: linear-gradient(135deg, #e83e8c 0%, #dc3545 100%);
            color: white !important;
            padding: 18px 40px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 4px 15px rgba(232, 62, 140, 0.3);
        }
        .join-challenge-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(232, 62, 140, 0.4);
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
            <h1>🏆 New Challenge Available!</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            
            <div class="challenge-card">
                <h3>{{challengeName}}</h3>
                <p>{{challengeDescription}}</p>
                
                <div class="challenge-stats">
                    <div class="stat">
                        <div class="stat-value">{{duration}}</div>
                        <div class="stat-label">Duration</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">{{participants}}</div>
                        <div class="stat-label">Participants</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">{{reward}}</div>
                        <div class="stat-label">Reward</div>
                    </div>
                </div>
                
                <p><strong>Starts:</strong> {{startDate}}</p>
                <p><strong>Ends:</strong> {{endDate}}</p>
            </div>
            
            <p>Ready to take on this challenge? Join now and compete with others!</p>
            
            <a href="{{challengeUrl}}" class="join-challenge-button">
                Join Challenge
            </a>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`; 