import { Resend } from 'resend';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/WelcomeEmail';
import PasswordResetEmail from '@/emails/PasswordResetEmail';
import MonthlyInsightsEmail from '@/emails/MonthlyInsightsEmail';

// Initialize Resend with API key
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('[EmailService] VITE_RESEND_API_KEY no está configurado. Los emails no se enviarán.');
}

const resend = new Resend(resendApiKey);

// Email configuration
const FROM_EMAIL = 'Compounding <onboarding@resend.dev>'; // Cambiar por tu dominio verificado
const REPLY_TO = 'support@compounding.app'; // Tu email de soporte

// Types
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WelcomeEmailData {
  to: string;
  userName: string;
  loginUrl: string;
}

export interface PasswordResetEmailData {
  to: string;
  userName: string;
  resetUrl: string;
  expirationTime?: string;
}

export interface MonthlyInsightsEmailData {
  to: string;
  userName: string;
  month: string;
  totalExpenses: string;
  totalIncome: string;
  savings: string;
  savingsRate: string;
  topCategory: string;
  budgetPerformance: 'great' | 'good' | 'warning';
  dashboardUrl: string;
  unsubscribeUrl: string;
}

/**
 * Send Welcome Email to new users
 */
export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<EmailResponse> => {
  try {
    if (!resendApiKey) {
      console.warn('[EmailService] Welcome email NOT sent (API key missing)');
      return { success: false, error: 'API key not configured' };
    }

    const emailHtml = await render(
      WelcomeEmail({
        userName: data.userName,
        loginUrl: data.loginUrl,
      })
    );

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: '¡Bienvenido a Compounding! 🎯',
      html: emailHtml,
      replyTo: REPLY_TO,
    });

    if (response.error) {
      console.error('[EmailService] Error sending welcome email:', response.error);
      return { success: false, error: response.error.message };
    }

    console.info('[EmailService] Welcome email sent successfully:', response.data?.id);
    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('[EmailService] Exception sending welcome email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (
  data: PasswordResetEmailData
): Promise<EmailResponse> => {
  try {
    if (!resendApiKey) {
      console.warn('[EmailService] Password reset email NOT sent (API key missing)');
      return { success: false, error: 'API key not configured' };
    }

    const emailHtml = await render(
      PasswordResetEmail({
        userName: data.userName,
        resetUrl: data.resetUrl,
        expirationTime: data.expirationTime || '1 hora',
      })
    );

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: 'Restablece tu contraseña de Compounding 🔐',
      html: emailHtml,
      replyTo: REPLY_TO,
    });

    if (response.error) {
      console.error('[EmailService] Error sending password reset email:', response.error);
      return { success: false, error: response.error.message };
    }

    console.info('[EmailService] Password reset email sent successfully:', response.data?.id);
    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('[EmailService] Exception sending password reset email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Send Monthly Insights Email (optional, user must opt-in)
 */
export const sendMonthlyInsightsEmail = async (
  data: MonthlyInsightsEmailData
): Promise<EmailResponse> => {
  try {
    if (!resendApiKey) {
      console.warn('[EmailService] Monthly insights email NOT sent (API key missing)');
      return { success: false, error: 'API key not configured' };
    }

    const emailHtml = await render(
      MonthlyInsightsEmail({
        userName: data.userName,
        month: data.month,
        totalExpenses: data.totalExpenses,
        totalIncome: data.totalIncome,
        savings: data.savings,
        savingsRate: data.savingsRate,
        topCategory: data.topCategory,
        budgetPerformance: data.budgetPerformance,
        dashboardUrl: data.dashboardUrl,
        unsubscribeUrl: data.unsubscribeUrl,
      })
    );

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `${data.month}: Tu resumen financiero 📊`,
      html: emailHtml,
      replyTo: REPLY_TO,
    });

    if (response.error) {
      console.error('[EmailService] Error sending monthly insights email:', response.error);
      return { success: false, error: response.error.message };
    }

    console.info('[EmailService] Monthly insights email sent successfully:', response.data?.id);
    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('[EmailService] Exception sending monthly insights email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Validate email address format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
