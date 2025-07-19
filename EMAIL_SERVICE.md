# Email Service Documentation

## Overview

The email service provides professional, mobile-responsive email templates for Tiny Steps A Day. It uses the Resend API for email delivery and includes a customizable HTML template with the brand colors.

## Features

- **Professional Design**: Clean, modern email template using Tiny Steps A Day brand colors
- **Mobile Responsive**: Optimized for all device sizes
- **Dark Mode Support**: Automatic dark mode detection and styling
- **Template Processing**: Dynamic content replacement with user data
- **Error Handling**: Comprehensive error logging and handling

## Brand Colors

- **Primary Purple**: `#A98FF3` (light purple from logo)
- **Secondary Purple**: `#8B7FD8` (darker gradient)
- **White**: `#FFFFFF`
- **Text Colors**: Various grays for readability

## Email Templates

### Verification Email Template

Located at: `src/services/emailTemplate.html`

**Template Variables:**
- `{{userName}}` - User's first name or username
- `{{userEmail}}` - User's email address
- `{{verificationCode}}` - 6-digit verification code
- `{{verificationUrl}}` - Optional verification URL (removes button if not provided)

**Features:**
- Gradient header with logo placeholder
- Prominent verification code display
- Call-to-action button
- Professional footer with links
- Mobile-responsive design

## API Functions

### `sendMail(to, subject, html)`
Send a custom email with raw HTML content.

```typescript
import { sendMail } from './services/mail.service';

await sendMail(
  'user@example.com',
  'Welcome to Tiny Steps A Day',
  '<h1>Hello World</h1>'
);
```

### `sendVerificationCode(userEmail, userName, verificationCode, verificationUrl?)`
Send a verification code email using the template.

```typescript
import { sendVerificationCode } from './services/mail.service';

await sendVerificationCode(
  'user@example.com',
  'John Doe',
  '123456',
  'https://app.tinystepsaday.com/verify?code=123456'
);
```

### `generateAndSendVerificationCode(userEmail, userName, verificationUrl?)`
Generate a random 6-digit code and send verification email.

```typescript
import { generateAndSendVerificationCode } from './services/mail.service';

const verificationCode = await generateAndSendVerificationCode(
  'user@example.com',
  'John Doe',
  'https://app.tinystepsaday.com/verify'
);
```

## Integration with User Service

The user service automatically sends verification emails when new users are created:

```typescript
// In userService.ts - createUser method
const verificationCode = await generateAndSendVerificationCode(
  user.email,
  userName,
  `${process.env['FRONTEND_URL']}/verify-email?email=${user.email}`
);
```

## Environment Variables

Required environment variables:

```env
RESEND_API_KEY=your_resend_api_key_here
FRONTEND_URL=https://your-frontend-domain.com
```

## Customization

### Adding New Email Types

1. Create a new template function in `mail.service.ts`:
```typescript
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string
): Promise<void> => {
  // Implementation
};
```

2. Create a new template HTML file or modify the existing template
3. Add template processing logic for new variables

### Modifying the Template

The email template (`emailTemplate.html`) can be customized by:
- Changing colors in the CSS variables
- Adding new sections or components
- Modifying the layout and styling
- Adding new template variables

### Styling Guidelines

- Use the brand colors consistently
- Ensure mobile responsiveness with media queries
- Test in multiple email clients
- Keep the design clean and professional
- Use semantic HTML for accessibility

## Error Handling

The service includes comprehensive error handling:
- Template loading errors
- Resend API errors
- Email sending failures
- Detailed logging for debugging

## Testing

To test the email service:

1. Set up your `RESEND_API_KEY` environment variable
2. Use the test functions in development
3. Check the logs for any errors
4. Verify emails are received in the target inbox

## Security Considerations

- Never log sensitive information like verification codes in production
- Use environment variables for API keys
- Validate email addresses before sending
- Implement rate limiting for email sending
- Consider email verification expiration times 