// Payment Email Templates
// Templates for payment-related notifications

export const paymentSuccessTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful - Tiny Steps A Day</title>
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
        .payment-details {
            background-color: #f8f9fa;
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
        }
        .view-receipt-button {
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
        .view-receipt-button:hover {
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
            <h1>Payment Successful!</h1>
        </div>
        
        <div class="content">
            <div class="success-icon">✅</div>
            <h2>Thank you, {{userName}}!</h2>
            <p>Your payment has been processed successfully.</p>
            
            <div class="payment-details">
                <h3>Payment Details</h3>
                <p><strong>Transaction ID:</strong> {{transactionId}}</p>
                <p><strong>Amount:</strong> <span class="amount">{{amount}}</span></p>
                <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
                <p><strong>Date:</strong> {{paymentDate}}</p>
                <p><strong>Description:</strong> {{description}}</p>
            </div>
            
            <p>You now have access to all the premium features. Enjoy your enhanced experience!</p>
            
            <a href="{{receiptUrl}}" class="view-receipt-button">
                View Receipt
            </a>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
            <p>If you have any questions about this payment, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`;

export const paymentFailedTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed - Tiny Steps A Day</title>
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
        .error-icon {
            font-size: 48px;
            color: #dc3545;
            margin: 20px 0;
        }
        .error-details {
            background-color: #f8d7da;
            border: 2px solid #dc3545;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        .retry-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .retry-button:hover {
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
            <h1>Payment Failed</h1>
        </div>
        
        <div class="content">
            <div class="error-icon">❌</div>
            <h2>Hello {{userName}},</h2>
            <p>We're sorry, but your payment could not be processed.</p>
            
            <div class="error-details">
                <h3>Payment Details</h3>
                <p><strong>Transaction ID:</strong> {{transactionId}}</p>
                <p><strong>Amount:</strong> {{amount}}</p>
                <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
                <p><strong>Date:</strong> {{paymentDate}}</p>
                <p><strong>Error:</strong> {{errorMessage}}</p>
            </div>
            
            <p>Common reasons for payment failure:</p>
            <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                <li>Insufficient funds</li>
                <li>Card expired or invalid</li>
                <li>Billing address mismatch</li>
                <li>Card security code (CVV) incorrect</li>
            </ul>
            
            <a href="{{retryUrl}}" class="retry-button">
                Try Again
            </a>
            
            <p>If you continue to experience issues, please contact our support team.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const subscriptionRenewalTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Renewal - Tiny Steps A Day</title>
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
        .subscription-details {
            background-color: #e3f2fd;
            border: 2px solid #17a2b8;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .manage-subscription-button {
            display: inline-block;
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .manage-subscription-button:hover {
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
            <h1>Subscription Renewal</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}}!</h2>
            <p>Your subscription will be automatically renewed soon.</p>
            
            <div class="subscription-details">
                <h3>Renewal Details</h3>
                <p><strong>Plan:</strong> {{planName}}</p>
                <p><strong>Amount:</strong> {{amount}}</p>
                <p><strong>Renewal Date:</strong> {{renewalDate}}</p>
                <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
            </div>
            
            <p>Your subscription will continue automatically. You can manage your subscription settings anytime.</p>
            
            <a href="{{subscriptionUrl}}" class="manage-subscription-button">
                Manage Subscription
            </a>
            
            <p>Thank you for being a valued member of our community!</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const subscriptionCancelledTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Cancelled - Tiny Steps A Day</title>
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
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
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
        .cancellation-details {
            background-color: #f8f9fa;
            border: 2px solid #6c757d;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{imageUrl}}" alt="Tiny Steps A Day Logo" class="logo">
            <h1>Subscription Cancelled</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{userName}},</h2>
            <p>Your subscription has been cancelled as requested.</p>
            
            <div class="cancellation-details">
                <h3>Cancellation Details</h3>
                <p><strong>Plan:</strong> {{planName}}</p>
                <p><strong>Cancelled on:</strong> {{cancellationDate}}</p>
                <p><strong>Access until:</strong> {{accessUntil}}</p>
                <p><strong>Reason:</strong> {{reason}}</p>
            </div>
            
            <p>You'll continue to have access to premium features until {{accessUntil}}.</p>
            
            <p>We're sorry to see you go! If you change your mind, you can reactivate your subscription anytime.</p>
            
            <a href="{{reactivateUrl}}" class="reactivate-button">
                Reactivate Subscription
            </a>
            
            <p>Thank you for being part of our community!</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Tiny Steps A Day. All rights reserved.</p>
            <p>This email was sent to {{userEmail}}</p>
        </div>
    </div>
</body>
</html>
`; 