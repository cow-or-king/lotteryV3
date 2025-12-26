/**
 * Resend Email Service Implementation
 * IMPORTANT: ZERO any types
 */

import { Resend } from 'resend';
import { Result } from '@/core/result';
import {
  EmailService,
  EmailOptions,
  EmailResponse,
  EmailRecipient,
} from '@/core/ports/email.service';

/**
 * Format email recipient for Resend
 */
function formatRecipient(recipient: EmailRecipient): string {
  if (recipient.name) {
    return `${recipient.name} <${recipient.email}>`;
  }
  return recipient.email;
}

/**
 * Format email recipients array
 */
function formatRecipients(recipients: EmailRecipient | EmailRecipient[]): string | string[] {
  if (Array.isArray(recipients)) {
    return recipients.map(formatRecipient);
  }
  return formatRecipient(recipients);
}

/**
 * Resend Email Service
 */
export class ResendEmailService implements EmailService {
  private resend: Resend;
  private defaultFrom: EmailRecipient;

  constructor(apiKey: string, defaultFrom?: EmailRecipient) {
    this.resend = new Resend(apiKey);
    this.defaultFrom = defaultFrom || {
      email: 'onboarding@resend.dev',
      name: 'ReviewLottery',
    };
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<Result<EmailResponse>> {
    try {
      const from = options.from || this.defaultFrom;

      const response = await this.resend.emails.send({
        from: formatRecipient(from) as string,
        to: formatRecipients(options.to),
        replyTo: options.replyTo ? formatRecipient(options.replyTo) : undefined,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });

      if (response.error) {
        return Result.fail(new Error(`Failed to send email: ${response.error.message}`));
      }

      if (!response.data) {
        return Result.fail(new Error('Failed to send email: No response data'));
      }

      return Result.ok({
        id: response.data.id,
        success: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(new Error(`Failed to send email: ${message}`));
    }
  }

  /**
   * Send a batch of emails
   */
  async sendBatch(emails: EmailOptions[]): Promise<Result<EmailResponse[]>> {
    try {
      const results = await Promise.all(emails.map((email) => this.sendEmail(email)));

      const errors = results.filter((r) => !r.success);
      if (errors.length > 0) {
        const errorMessages = errors
          .map((r) => (!r.success ? r.error.message : ''))
          .filter(Boolean)
          .join(', ');
        return Result.fail(new Error(`Failed to send ${errors.length} emails: ${errorMessages}`));
      }

      const responses = results.map((r) => (r.success ? r.data : { id: '', success: false }));
      return Result.ok(responses);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(new Error(`Failed to send batch emails: ${message}`));
    }
  }
}

/**
 * Create Resend Email Service instance
 */
export function createResendEmailService(
  apiKey?: string,
  defaultFrom?: EmailRecipient,
): ResendEmailService {
  const key = apiKey || process.env.RESEND_API_KEY || '';
  if (!key) {
    throw new Error('RESEND_API_KEY is not defined');
  }
  return new ResendEmailService(key, defaultFrom);
}
