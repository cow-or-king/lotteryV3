/**
 * Email Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { Email } from '@/core/value-objects/email.vo';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const result = Email.create('test@example.com');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.getValue()).toBe('test@example.com');
      }
    });

    it('should normalize email to lowercase', () => {
      const result = Email.create('TEST@EXAMPLE.COM');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.getValue()).toBe('test@example.com');
      }
    });

    it('should trim whitespace', () => {
      const result = Email.create('  test@example.com  ');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.getValue()).toBe('test@example.com');
      }
    });

    it('should fail for invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test@.com',
        'test@example',
        '',
        '   ',
        'test @example.com',
      ];

      invalidEmails.forEach((invalidEmail) => {
        const result = Email.create(invalidEmail);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.name).toBe('InvalidEmailError');
        }
      });
    });
  });

  describe('isValid', () => {
    it('should validate correct email formats', () => {
      expect(Email.isValid('test@example.com')).toBe(true);
      expect(Email.isValid('user.name@example.co.uk')).toBe(true);
      expect(Email.isValid('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(Email.isValid('invalid')).toBe(false);
      expect(Email.isValid('@example.com')).toBe(false);
      expect(Email.isValid('test@')).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');

      expect(email1.success && email2.success).toBe(true);
      if (email1.success && email2.success) {
        expect(email1.data.equals(email2.data)).toBe(true);
      }
    });

    it('should return true for emails with different casing', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('TEST@EXAMPLE.COM');

      expect(email1.success && email2.success).toBe(true);
      if (email1.success && email2.success) {
        expect(email1.data.equals(email2.data)).toBe(true);
      }
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');

      expect(email1.success && email2.success).toBe(true);
      if (email1.success && email2.success) {
        expect(email1.data.equals(email2.data)).toBe(false);
      }
    });
  });
});
