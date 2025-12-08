/**
 * ReviewResponse Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { ReviewResponse } from '@/core/value-objects/review-response.vo';
import { UserId } from '@/shared/types/branded.type';

describe('ReviewResponse Value Object', () => {
  const userId = 'user123' as UserId;
  const validContent = 'Merci pour votre retour ! Nous sommes ravis de vous avoir accueilli.';

  describe('create', () => {
    it('should create a valid review response', () => {
      const result = ReviewResponse.create(validContent, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe(validContent);
        expect(result.data.respondedBy).toBe(userId);
        expect(result.data.respondedAt).toBeInstanceOf(Date);
      }
    });

    it('should trim whitespace from content', () => {
      const result = ReviewResponse.create('  ' + validContent + '  ', userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe(validContent);
      }
    });

    it('should accept custom respondedAt date', () => {
      const customDate = new Date('2024-01-01');
      const result = ReviewResponse.create(validContent, userId, customDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.respondedAt).toEqual(customDate);
      }
    });

    it('should fail for empty content', () => {
      const result = ReviewResponse.create('', userId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ReviewResponseError');
        expect(result.error.message).toContain('cannot be empty');
      }
    });

    it('should fail for whitespace-only content', () => {
      const result = ReviewResponse.create('   ', userId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ReviewResponseError');
        expect(result.error.message).toContain('cannot be empty');
      }
    });

    it('should fail for content shorter than 10 characters', () => {
      const result = ReviewResponse.create('Merci !', userId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ReviewResponseError');
        expect(result.error.message).toContain('at least 10 characters');
      }
    });

    it('should fail for content longer than 5000 characters', () => {
      const longContent = 'a'.repeat(5001);
      const result = ReviewResponse.create(longContent, userId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ReviewResponseError');
        expect(result.error.message).toContain('cannot exceed 5000 characters');
      }
    });

    it('should accept content at exactly 10 characters', () => {
      const result = ReviewResponse.create('Merci bien', userId);

      expect(result.success).toBe(true);
    });

    it('should accept content at exactly 5000 characters', () => {
      const maxContent = 'a'.repeat(5000);
      const result = ReviewResponse.create(maxContent, userId);

      expect(result.success).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return content', () => {
      const result = ReviewResponse.create(validContent, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe(validContent);
      }
    });

    it('should return respondedBy', () => {
      const result = ReviewResponse.create(validContent, userId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.respondedBy).toBe(userId);
      }
    });

    it('should return respondedAt', () => {
      const customDate = new Date('2024-01-01');
      const result = ReviewResponse.create(validContent, userId, customDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.respondedAt).toEqual(customDate);
      }
    });
  });

  describe('equals', () => {
    it('should return true for equal responses', () => {
      const date = new Date('2024-01-01');
      const response1 = ReviewResponse.create(validContent, userId, date);
      const response2 = ReviewResponse.create(validContent, userId, date);

      expect(response1.success && response2.success).toBe(true);
      if (response1.success && response2.success) {
        expect(response1.data.equals(response2.data)).toBe(true);
      }
    });

    it('should return false for different content', () => {
      const date = new Date('2024-01-01');
      const response1 = ReviewResponse.create('Merci pour votre retour !', userId, date);
      const response2 = ReviewResponse.create('Merci beaucoup pour votre avis !', userId, date);

      expect(response1.success && response2.success).toBe(true);
      if (response1.success && response2.success) {
        expect(response1.data.equals(response2.data)).toBe(false);
      }
    });

    it('should return false for different respondedBy', () => {
      const date = new Date('2024-01-01');
      const userId2 = 'user456' as UserId;
      const response1 = ReviewResponse.create(validContent, userId, date);
      const response2 = ReviewResponse.create(validContent, userId2, date);

      expect(response1.success && response2.success).toBe(true);
      if (response1.success && response2.success) {
        expect(response1.data.equals(response2.data)).toBe(false);
      }
    });

    it('should return false for different respondedAt', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const response1 = ReviewResponse.create(validContent, userId, date1);
      const response2 = ReviewResponse.create(validContent, userId, date2);

      expect(response1.success && response2.success).toBe(true);
      if (response1.success && response2.success) {
        expect(response1.data.equals(response2.data)).toBe(false);
      }
    });
  });
});
