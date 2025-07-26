import {
  paymentSuccessTemplate,
  paymentFailedTemplate,
  subscriptionRenewalTemplate,
  subscriptionCancelledTemplate
} from '../emailTemplates/paymentTemplates';
import {
  BaseEmailTemplateData,
  processTemplate,
  sendMail,
  getClientUrl,
  getImageUrl
} from './shared/emailUtils';
import logger from '../../utils/logger';

// Extended interfaces for payment email types
interface PaymentSuccessEmailData extends BaseEmailTemplateData {
  transactionId: string;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  description: string;
  receiptUrl: string;
}

interface PaymentFailedEmailData extends BaseEmailTemplateData {
  transactionId: string;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  errorMessage: string;
  retryUrl: string;
}

interface SubscriptionRenewalEmailData extends BaseEmailTemplateData {
  planName: string;
  amount: string;
  renewalDate: string;
  paymentMethod: string;
  subscriptionUrl: string;
}

interface SubscriptionCancelledEmailData extends BaseEmailTemplateData {
  planName: string;
  cancellationDate: string;
  accessUntil: string;
  reason: string;
  reactivateUrl: string;
}



// Payment Email Functions

export const generateAndSendPaymentSuccessEmail = async (
  userEmail: string,
  userName: string,
  transactionId: string,
  amount: string,
  paymentMethod: string,
  description: string
): Promise<void> => {
  try {
    const templateData: PaymentSuccessEmailData = {
      userName,
      userEmail,
      transactionId,
      amount,
      paymentMethod,
      paymentDate: new Date().toLocaleDateString(),
      description,
      receiptUrl: `${getClientUrl()}/receipts/${transactionId}`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(paymentSuccessTemplate, templateData);
    const subject = "Payment Successful - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Payment success email sent successfully:", {
      userEmail,
      userName,
      transactionId
    });
  } catch (error) {
    logger.error("Error sending payment success email:", error);
    throw error;
  }
};

export const generateAndSendPaymentFailedEmail = async (
  userEmail: string,
  userName: string,
  transactionId: string,
  amount: string,
  paymentMethod: string,
  errorMessage: string
): Promise<void> => {
  try {
    const templateData: PaymentFailedEmailData = {
      userName,
      userEmail,
      transactionId,
      amount,
      paymentMethod,
      paymentDate: new Date().toLocaleDateString(),
      errorMessage,
      retryUrl: `${getClientUrl()}/payment/retry/${transactionId}`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(paymentFailedTemplate, templateData);
    const subject = "Payment Failed - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Payment failed email sent successfully:", {
      userEmail,
      userName,
      transactionId
    });
  } catch (error) {
    logger.error("Error sending payment failed email:", error);
    throw error;
  }
};

export const generateAndSendSubscriptionRenewalEmail = async (
  userEmail: string,
  userName: string,
  planName: string,
  amount: string,
  renewalDate: string,
  paymentMethod: string
): Promise<void> => {
  try {
    const templateData: SubscriptionRenewalEmailData = {
      userName,
      userEmail,
      planName,
      amount,
      renewalDate,
      paymentMethod,
      subscriptionUrl: `${getClientUrl()}/subscription`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(subscriptionRenewalTemplate, templateData);
    const subject = "Subscription Renewal - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Subscription renewal email sent successfully:", {
      userEmail,
      userName,
      planName
    });
  } catch (error) {
    logger.error("Error sending subscription renewal email:", error);
    throw error;
  }
};

export const generateAndSendSubscriptionCancelledEmail = async (
  userEmail: string,
  userName: string,
  planName: string,
  cancellationDate: string,
  accessUntil: string,
  reason: string
): Promise<void> => {
  try {
    const templateData: SubscriptionCancelledEmailData = {
      userName,
      userEmail,
      planName,
      cancellationDate,
      accessUntil,
      reason,
      reactivateUrl: `${getClientUrl()}/subscription/reactivate`,
      imageUrl: getImageUrl(),
    };

    const processedHtml = processTemplate(subscriptionCancelledTemplate, templateData);
    const subject = "Subscription Cancelled - Tiny Steps A Day";

    await sendMail(userEmail, subject, processedHtml);

    logger.info("Subscription cancelled email sent successfully:", {
      userEmail,
      userName,
      planName
    });
  } catch (error) {
    logger.error("Error sending subscription cancelled email:", error);
    throw error;
  }
}; 