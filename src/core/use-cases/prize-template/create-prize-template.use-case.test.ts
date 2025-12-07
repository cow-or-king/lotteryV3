/**
 * Tests pour CreatePrizeTemplateUseCase
 * TDD: Tests écrits en premier
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreatePrizeTemplateUseCase } from './create-prize-template.use-case';
import type { PrizeTemplateRepository } from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('CreatePrizeTemplateUseCase', () => {
  let createPrizeTemplateUseCase: CreatePrizeTemplateUseCase;
  let mockPrizeTemplateRepository: PrizeTemplateRepository;
  let mockBrandRepository: BrandRepository;

  beforeEach(() => {
    // Mock repositories
    mockPrizeTemplateRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findManyByBrandId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      countByBrandId: vi.fn(),
    };

    mockBrandRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      countByOwnerId: vi.fn(),
    };

    createPrizeTemplateUseCase = new CreatePrizeTemplateUseCase(
      mockPrizeTemplateRepository,
      mockBrandRepository,
    );
  });

  describe('execute', () => {
    it('should create a prize template', async () => {
      // Arrange
      const userId = 'user-123';
      const brandId = 'brand-123';
      const input = {
        brandId,
        name: 'Café offert',
        description: 'Un café gratuit',
        value: 2.5,
        color: '#8B5CF6',
      };

      const mockBrand = {
        id: brandId,
        name: 'Mon Enseigne',
        logoUrl: 'https://example.com/logo.png',
        ownerId: userId,
        primaryColor: '#5B21B6',
        secondaryColor: '#FACC15',
        font: 'inter',
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPrizeTemplate = {
        id: 'prize-template-123',
        brandId,
        name: input.name,
        description: input.description,
        value: input.value,
        color: input.color,
        iconUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
      vi.mocked(mockPrizeTemplateRepository.create).mockResolvedValue(mockPrizeTemplate);

      // Act
      const result = await createPrizeTemplateUseCase.execute(input, userId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(input.name);
        expect(result.data.brandId).toBe(brandId);
      }
    });

    it('should return error if brand not found', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        brandId: 'non-existent-brand',
        name: 'Café offert',
      };

      vi.mocked(mockBrandRepository.findById).mockResolvedValue(null);

      // Act
      const result = await createPrizeTemplateUseCase.execute(input, userId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Enseigne non trouvée');
      }
    });

    it('should return error if brand does not belong to user', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        brandId: 'brand-123',
        name: 'Café offert',
      };

      const mockBrand = {
        id: input.brandId,
        name: 'Mon Enseigne',
        logoUrl: 'https://example.com/logo.png',
        ownerId: 'different-user',
        primaryColor: '#5B21B6',
        secondaryColor: '#FACC15',
        font: 'inter',
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);

      // Act
      const result = await createPrizeTemplateUseCase.execute(input, userId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('appartient pas');
      }
    });

    it('should use default color if not provided', async () => {
      // Arrange
      const userId = 'user-123';
      const brandId = 'brand-123';
      const input = {
        brandId,
        name: 'Café offert',
      };

      const mockBrand = {
        id: brandId,
        name: 'Mon Enseigne',
        logoUrl: 'https://example.com/logo.png',
        ownerId: userId,
        primaryColor: '#5B21B6',
        secondaryColor: '#FACC15',
        font: 'inter',
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPrizeTemplate = {
        id: 'prize-template-123',
        brandId,
        name: input.name,
        description: null,
        value: null,
        color: '#8B5CF6',
        iconUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
      vi.mocked(mockPrizeTemplateRepository.create).mockResolvedValue(mockPrizeTemplate);

      // Act
      const result = await createPrizeTemplateUseCase.execute(input, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockPrizeTemplateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          color: '#8B5CF6',
        }),
      );
    });
  });
});
