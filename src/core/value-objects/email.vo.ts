/**
 * Email Value Object
 * RÈGLES:
 * - Immutable
 * - Self-validating
 * - AUCUNE dépendance externe
 */

import { Result } from '@/lib/types/result.type';
import { Email as EmailType } from '@/lib/types/branded.type';

export class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Invalid email format: ${email}`);
    this.name = 'InvalidEmailError';
  }
}

export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email.toLowerCase().trim();
  }

  static create(email: string): Result<Email, InvalidEmailError> {
    const trimmedEmail = email.trim();

    if (!Email.isValid(trimmedEmail)) {
      return Result.fail(new InvalidEmailError(trimmedEmail));
    }

    return Result.ok(new Email(trimmedEmail));
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  toBranded(): EmailType {
    return this.value as EmailType;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
