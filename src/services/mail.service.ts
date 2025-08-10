// Import all email functions from separate services
export {
  generateAndSendVerificationEmail,
  generateAndSendPasswordResetEmail,
  generateAndSendPasswordChangedEmail,
  generateAndSendAccountActivatedEmail,
  generateAndSendAccountDeactivatedEmail
} from './emailServices/authEmailService';

export {
  generateAndSendRoleChangedEmail,
  generateAndSendAccountStatusChangedEmail,
  generateAndSendWelcomeEmail,
  generateAndSendProfileUpdatedEmail
} from './emailServices/userManagementEmailService';

export {
  generateAndSendGeneralNotification,
  generateAndSendAchievementNotification,
  generateAndSendReminderNotification,
  generateAndSendChallengeNotification
} from './emailServices/notificationEmailService';

export {
  generateAndSendPaymentSuccessEmail,
  generateAndSendPaymentFailedEmail,
  generateAndSendSubscriptionRenewalEmail,
  generateAndSendSubscriptionCancelledEmail
} from './emailServices/paymentEmailService';

export {
  generateAndSendContactConfirmationEmail,
  generateAndSendNewMessageNotificationEmail,
  generateAndSendReplyNotificationEmail,
  generateAndSendReplySentNotificationEmail
} from './emailServices/messageEmailService';

// Legacy functions for backward compatibility
import { generateAndSendVerificationEmail } from './emailServices/authEmailService';
export const sendVerificationCode = generateAndSendVerificationEmail;
export const generateAndSendVerificationCode = generateAndSendVerificationEmail; 