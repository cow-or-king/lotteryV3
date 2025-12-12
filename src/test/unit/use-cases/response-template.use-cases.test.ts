/**
 * Response Template Use Cases Tests (TDD)
 * CRUD operations pour les templates de réponse
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CreateResponseTemplateUseCase,
  CreateResponseTemplateInput,
} from '@/core/use-cases/response-template/create-response-template.use-case';
import {
  UpdateResponseTemplateUseCase,
  UpdateResponseTemplateInput,
} from '@/core/use-cases/response-template/update-response-template.use-case';
import {
  ListResponseTemplatesUseCase,
  ListResponseTemplatesInput,
} from '@/core/use-cases/response-template/list-response-templates.use-case';
import {
  DeleteResponseTemplateUseCase,
  DeleteResponseTemplateInput,
} from '@/core/use-cases/response-template/delete-response-template.use-case';
import { ResponseTemplateEntity } from '@/core/entities/response-template.entity';
import { IResponseTemplateRepository } from '@/core/repositories/response-template.repository.interface';
import { StoreId } from '@/lib/types/branded.type';
import { Result } from '@/lib/types/result.type';

describe('ResponseTemplate Use Cases', () => {
  let mockTemplateRepo: IResponseTemplateRepository;
  const storeId = 'store123' as StoreId;
  const templateId = 'template123';

  beforeEach(() => {
    mockTemplateRepo = {
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findByStore: vi.fn(),
      findByStoreAndCategory: vi.fn(),
      findPopularByStore: vi.fn(),
      delete: vi.fn(),
      countByStore: vi.fn(),
    } as unknown as IResponseTemplateRepository;
  });

  describe('CreateResponseTemplateUseCase', () => {
    let useCase: CreateResponseTemplateUseCase;

    beforeEach(() => {
      useCase = new CreateResponseTemplateUseCase(mockTemplateRepo);
    });

    it('should create a response template successfully', async () => {
      const input: CreateResponseTemplateInput = {
        storeId,
        name: 'Positive Response',
        content: 'Thank you for your positive feedback! We appreciate your support.',
        category: 'positive',
      };

      const mockTemplate = ResponseTemplateEntity.create({
        storeId,
        name: input.name,
        content: input.content,
        category: input.category,
      });

      expect(mockTemplate.success).toBe(true);
      if (!mockTemplate.success) {
        return;
      }

      vi.mocked(mockTemplateRepo.create).mockResolvedValue(Result.ok(mockTemplate.data));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(input.name);
        expect(result.data.content).toBe(input.content);
        expect(result.data.category).toBe(input.category);
      }

      expect(mockTemplateRepo.create).toHaveBeenCalledWith({
        storeId,
        name: input.name,
        content: input.content,
        category: input.category,
      });
    });

    it('should fail for invalid template content (too short)', async () => {
      const input: CreateResponseTemplateInput = {
        storeId,
        name: 'Short',
        content: 'Hi!', // Too short
        category: 'positive',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidTemplateDataError');
        expect(result.error.message).toContain('at least 10 characters');
      }
    });

    it('should fail for invalid template name (empty)', async () => {
      const input: CreateResponseTemplateInput = {
        storeId,
        name: '',
        content: 'Thank you for your feedback!',
        category: 'positive',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidTemplateDataError');
        expect(result.error.message).toContain('Template name is required');
      }
    });
  });

  describe('UpdateResponseTemplateUseCase', () => {
    let useCase: UpdateResponseTemplateUseCase;

    beforeEach(() => {
      useCase = new UpdateResponseTemplateUseCase(mockTemplateRepo);
    });

    it('should update a response template successfully', async () => {
      const input: UpdateResponseTemplateInput = {
        templateId,
        name: 'Updated Positive Response',
        content: 'Updated content - Thank you so much!',
      };

      const existingTemplate = ResponseTemplateEntity.create({
        storeId,
        name: 'Old Name',
        content: 'Old content',
        category: 'positive',
      });

      expect(existingTemplate.success).toBe(true);
      if (!existingTemplate.success) {
        return;
      }

      const updatedTemplate = existingTemplate.data.updateName('Updated Positive Response');
      expect(updatedTemplate.success).toBe(true);
      if (!updatedTemplate.success) {
        return;
      }

      const withContent = updatedTemplate.data.updateContent(
        'Updated content - Thank you so much!',
      );
      expect(withContent.success).toBe(true);
      if (!withContent.success) {
        return;
      }

      vi.mocked(mockTemplateRepo.findById).mockResolvedValue(existingTemplate.data);
      vi.mocked(mockTemplateRepo.update).mockResolvedValue(Result.ok(withContent.data));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(input.name);
        expect(result.data.content).toBe(input.content);
      }

      expect(mockTemplateRepo.findById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateRepo.update).toHaveBeenCalled();
    });

    it('should fail when template not found', async () => {
      const input: UpdateResponseTemplateInput = {
        templateId,
        name: 'Updated Name',
      };

      vi.mocked(mockTemplateRepo.findById).mockResolvedValue(null);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('TemplateNotFoundError');
        expect(result.error.message).toContain('not found');
      }
    });
  });

  describe('ListResponseTemplatesUseCase', () => {
    let useCase: ListResponseTemplatesUseCase;

    beforeEach(() => {
      useCase = new ListResponseTemplatesUseCase(mockTemplateRepo);
    });

    it('should list all templates for a store', async () => {
      const input: ListResponseTemplatesInput = {
        storeId,
      };

      const template1Result = ResponseTemplateEntity.create({
        storeId,
        name: 'Template 1',
        content: 'Content 1 with enough characters',
        category: 'positive',
      });

      const template2Result = ResponseTemplateEntity.create({
        storeId,
        name: 'Template 2',
        content: 'Content 2 with enough characters',
        category: 'negative',
      });

      expect(template1Result.success).toBe(true);
      expect(template2Result.success).toBe(true);
      if (!template1Result.success || !template2Result.success) {
        return;
      }

      const templates = [template1Result.data, template2Result.data];

      vi.mocked(mockTemplateRepo.findByStore).mockResolvedValue(templates);

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.templates).toHaveLength(2);
        expect(result.data.total).toBe(2);
      }

      expect(mockTemplateRepo.findByStore).toHaveBeenCalledWith(storeId);
    });

    it('should filter templates by category', async () => {
      const input: ListResponseTemplatesInput = {
        storeId,
        category: 'positive',
      };

      const mockTemplate = ResponseTemplateEntity.create({
        storeId,
        name: 'Positive Template',
        content: 'Thank you!',
        category: 'positive',
      });

      expect(mockTemplate.success).toBe(true);
      if (!mockTemplate.success) {
        return;
      }

      vi.mocked(mockTemplateRepo.findByStoreAndCategory).mockResolvedValue([mockTemplate.data]);

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.templates).toHaveLength(1);
        expect(result.data.templates[0]?.category).toBe('positive');
      }

      expect(mockTemplateRepo.findByStoreAndCategory).toHaveBeenCalledWith(storeId, 'positive');
    });

    it('should return popular templates only', async () => {
      const input: ListResponseTemplatesInput = {
        storeId,
        popularOnly: true,
      };

      const mockTemplate = ResponseTemplateEntity.create({
        storeId,
        name: 'Popular Template',
        content: 'Very popular response!',
        category: 'positive',
      });

      expect(mockTemplate.success).toBe(true);
      if (!mockTemplate.success) {
        return;
      }

      vi.mocked(mockTemplateRepo.findPopularByStore).mockResolvedValue([mockTemplate.data]);

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.templates).toHaveLength(1);
      }

      expect(mockTemplateRepo.findPopularByStore).toHaveBeenCalledWith(storeId);
    });
  });

  describe('DeleteResponseTemplateUseCase', () => {
    let useCase: DeleteResponseTemplateUseCase;

    beforeEach(() => {
      useCase = new DeleteResponseTemplateUseCase(mockTemplateRepo);
    });

    it('should delete a response template successfully', async () => {
      const input: DeleteResponseTemplateInput = {
        templateId,
      };

      const mockTemplate = ResponseTemplateEntity.create({
        storeId,
        name: 'Template to delete',
        content: 'Content to delete',
        category: 'positive',
      });

      expect(mockTemplate.success).toBe(true);
      if (!mockTemplate.success) {
        return;
      }

      vi.mocked(mockTemplateRepo.findById).mockResolvedValue(mockTemplate.data);
      vi.mocked(mockTemplateRepo.delete).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);

      expect(mockTemplateRepo.findById).toHaveBeenCalledWith(templateId);
      expect(mockTemplateRepo.delete).toHaveBeenCalledWith(templateId);
    });

    it('should fail when template not found', async () => {
      const input: DeleteResponseTemplateInput = {
        templateId,
      };

      vi.mocked(mockTemplateRepo.findById).mockResolvedValue(null);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('TemplateNotFoundError');
        expect(result.error.message).toContain('not found');
      }
    });
  });
});
