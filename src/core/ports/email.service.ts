/**
 * Port: Email Service
 * Interface pour l'envoi d'emails (Hexagonal Architecture)
 * IMPORTANT: ZERO any types
 */

import { Result } from '@/core/result';

/**
 * Email recipient
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Email options
 */
export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  from?: EmailRecipient;
  replyTo?: EmailRecipient;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

/**
 * Email response
 */
export interface EmailResponse {
  id: string;
  success: boolean;
}

/**
 * Email Service Port
 */
export interface EmailService {
  /**
   * Send an email
   */
  sendEmail(options: EmailOptions): Promise<Result<EmailResponse>>;

  /**
   * Send a batch of emails
   */
  sendBatch(emails: EmailOptions[]): Promise<Result<EmailResponse[]>>;
}
