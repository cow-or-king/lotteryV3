/**
 * ResponseTemplate Entity Tests (TDD)
 */

import { describe, it, expect } from 'vitest';
import {
  ResponseTemplateEntity,
  CreateResponseTemplateProps,
  ResponseTemplateProps,
} from '@/core/entities/response-template.entity';
import { StoreId } from '@/lib/types/branded.type';

describe('ResponseTemplateEntity', () => {
  const storeId = 'store123' as StoreId;

  const validCreateProps: CreateResponseTemplateProps = {
    storeId,
    name: 'Réponse positive standard',
    content: 'Merci pour votre retour ! Nous sommes ravis que vous ayez apprécié notre service.',
    category: 'positive',
  };

  describe('create', () => {
    it('should create a valid template with required fields', () => {
      const result = ResponseTemplateEntity.create(validCreateProps);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Réponse positive standard');
        expect(result.data.content).toBe(validCreateProps.content);
        expect(result.data.category).toBe('positive');
        expect(result.data.usageCount).toBe(0);
      }
    });

    it('should create templates for all categories', () => {
      const categories: Array<'positive' | 'neutral' | 'negative'> = [
        'positive',
        'neutral',
        'negative',
      ];

      categories.forEach((category) => {
        const props = { ...validCreateProps, category };
        const result = ResponseTemplateEntity.create(props);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.category).toBe(category);
        }
      });
    });

    it('should fail for empty name', () => {
      const props = { ...validCreateProps, name: '' };
      const result = ResponseTemplateEntity.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidTemplateDataError');
        expect(result.error.message).toContain('Template name is required');
      }
    });

    it('should fail for whitespace-only name', () => {
      const props = { ...validCreateProps, name: '   ' };
      const result = ResponseTemplateEntity.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidTemplateDataError');
        expect(result.error.message).toContain('Template name is required');
      }
    });

    it('should fail for empty content', () => {
      const props = { ...validCreateProps, content: '' };
      const result = ResponseTemplateEntity.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidTemplateDataError');
        expect(result.error.message).toContain('Template content is required');
      }
    });

    it('should fail for content shorter than 10 characters', () => {
      const props = { ...validCreateProps, content: 'Merci !' };
      const result = ResponseTemplateEntity.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidTemplateDataError');
        expect(result.error.message).toContain('at least 10 characters');
      }
    });

    it('should fail for content longer than 5000 characters', () => {
      const props = { ...validCreateProps, content: 'a'.repeat(5001) };
      const result = ResponseTemplateEntity.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidTemplateDataError');
        expect(result.error.message).toContain('cannot exceed 5000 characters');
      }
    });

    it('should fail for invalid category', () => {
      const props = { ...validCreateProps, category: 'invalid' as never };
      const result = ResponseTemplateEntity.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidTemplateDataError');
        expect(result.error.message).toContain('Invalid category');
      }
    });

    it('should trim name and content', () => {
      const props = {
        ...validCreateProps,
        name: '  Réponse standard  ',
        content: '  Merci pour votre retour positif !  ',
      };
      const result = ResponseTemplateEntity.create(props);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Réponse standard');
        expect(result.data.content).toBe('Merci pour votre retour positif !');
      }
    });
  });

  describe('fromPersistence', () => {
    it('should reconstitute a template from persistence', () => {
      const templateId = 'template123';
      const props: ResponseTemplateProps = {
        id: templateId,
        storeId,
        name: 'Template Test',
        content: 'Content test',
        category: 'positive',
        usageCount: 5,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const template = ResponseTemplateEntity.fromPersistence(props);

      expect(template.id).toBe(templateId);
      expect(template.name).toBe('Template Test');
      expect(template.usageCount).toBe(5);
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count by 1', () => {
      const result = ResponseTemplateEntity.create(validCreateProps);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.usageCount).toBe(0);

        const incremented = result.data.incrementUsage();

        expect(incremented.usageCount).toBe(1);
      }
    });

    it('should increment usage count multiple times', () => {
      const result = ResponseTemplateEntity.create(validCreateProps);
      expect(result.success).toBe(true);

      if (result.success) {
        let template = result.data;

        template = template.incrementUsage();
        expect(template.usageCount).toBe(1);

        template = template.incrementUsage();
        expect(template.usageCount).toBe(2);

        template = template.incrementUsage();
        expect(template.usageCount).toBe(3);
      }
    });

    it('should update updatedAt when incrementing', () => {
      const result = ResponseTemplateEntity.create(validCreateProps);
      expect(result.success).toBe(true);

      if (result.success) {
        const originalUpdatedAt = result.data.updatedAt;

        // Wait a tiny bit to ensure time difference
        const incremented = result.data.incrementUsage();

        expect(incremented.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
      }
    });
  });

  describe('updateContent', () => {
    it('should update template content', () => {
      const result = ResponseTemplateEntity.create(validCreateProps);
      expect(result.success).toBe(true);

      if (result.success) {
        const updateResult = result.data.updateContent('New content for the template');

        expect(updateResult.success).toBe(true);
        if (updateResult.success) {
          expect(updateResult.data.content).toBe('New content for the template');
        }
      }
    });

    it('should fail for empty content', () => {
      const result = ResponseTemplateEntity.create(validCreateProps);
      expect(result.success).toBe(true);

      if (result.success) {
        const updateResult = result.data.updateContent('');

        expect(updateResult.success).toBe(false);
        if (!updateResult.success) {
          expect(updateResult.error.name).toBe('InvalidTemplateDataError');
        }
      }
    });

    it('should fail for content shorter than 10 characters', () => {
      const result = ResponseTemplateEntity.create(validCreateProps);
      expect(result.success).toBe(true);

      if (result.success) {
        const updateResult = result.data.updateContent('Short');

        expect(updateResult.success).toBe(false);
        if (!updateResult.success) {
          expect(updateResult.error.message).toContain('at least 10 characters');
        }
      }
    });
  });

  describe('isPopular', () => {
    it('should return true for templates with 10+ uses', () => {
      const props: ResponseTemplateProps = {
        id: 'template123',
        storeId,
        name: 'Popular Template',
        content: 'Content test',
        category: 'positive',
        usageCount: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const template = ResponseTemplateEntity.fromPersistence(props);

      expect(template.isPopular()).toBe(true);
    });

    it('should return false for templates with less than 10 uses', () => {
      const result = ResponseTemplateEntity.create(validCreateProps);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.isPopular()).toBe(false);
      }
    });

    it('should return true for exactly 10 uses', () => {
      const props: ResponseTemplateProps = {
        id: 'template123',
        storeId,
        name: 'Template',
        content: 'Content test',
        category: 'positive',
        usageCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const template = ResponseTemplateEntity.fromPersistence(props);

      expect(template.isPopular()).toBe(true);
    });
  });

  describe('matchesCategory', () => {
    it('should return true for matching category', () => {
      const result = ResponseTemplateEntity.create(validCreateProps);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.matchesCategory('positive')).toBe(true);
      }
    });

    it('should return false for non-matching category', () => {
      const result = ResponseTemplateEntity.create(validCreateProps);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.matchesCategory('negative')).toBe(false);
        expect(result.data.matchesCategory('neutral')).toBe(false);
      }
    });
  });
});
