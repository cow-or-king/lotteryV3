/**
 * Tests pour UpdatePrizeTemplateUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdatePrizeTemplateUseCase } from './update-prize-template.use-case';
import type { PrizeTemplateRepository } from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('UpdatePrizeTemplateUseCase', () => {
  let updatePrizeTemplateUseCase: UpdatePrizeTemplateUseCase;
  let mockPrizeTemplateRepository: PrizeTemplateRepository;
  let mockBrandRepository: BrandRepository;

  beforeEach(() => {
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

    updatePrizeTemplateUseCase = new UpdatePrizeTemplateUseCase(
      mockPrizeTemplateRepository,
      mockBrandRepository,
    );
  });

  it('should update a prize template', async () => {
    const userId = 'user-123';
    const brandId = 'brand-123';
    const input = {
      id: 'prize-template-123',
      name: 'Café offert MODIFIÉ',
      description: 'Description modifiée',
    };

    const mockPrizeTemplate = {
      id: input.id,
      brandId,
      name: 'Café offert',
      description: 'Original',
      value: 2.5,
      color: '#8B5CF6',
      iconUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
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

    const mockUpdatedPrizeTemplate = {
      ...mockPrizeTemplate,
      name: input.name,
      description: input.description,
      updatedAt: new Date(),
    };

    vi.mocked(mockPrizeTemplateRepository.findById).mockResolvedValue(mockPrizeTemplate);
    vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
    vi.mocked(mockPrizeTemplateRepository.update).mockResolvedValue(mockUpdatedPrizeTemplate);

    const result = await updatePrizeTemplateUseCase.execute(input, userId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe(input.name);
    }
  });

  it('should return error if prize template not found', async () => {
    const userId = 'user-123';
    const input = {
      id: 'non-existent-prize-template',
      name: 'Nouveau nom',
    };

    vi.mocked(mockPrizeTemplateRepository.findById).mockResolvedValue(null);

    const result = await updatePrizeTemplateUseCase.execute(input, userId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Gain non trouvé');
    }
  });

  it('should return error if prize template does not belong to user', async () => {
    const userId = 'user-123';
    const brandId = 'brand-123';
    const input = {
      id: 'prize-template-123',
      name: 'Nouveau nom',
    };

    const mockPrizeTemplate = {
      id: input.id,
      brandId,
      name: 'Café offert',
      description: null,
      value: null,
      color: '#8B5CF6',
      iconUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockBrand = {
      id: brandId,
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

    vi.mocked(mockPrizeTemplateRepository.findById).mockResolvedValue(mockPrizeTemplate);
    vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);

    const result = await updatePrizeTemplateUseCase.execute(input, userId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('appartient pas');
    }
  });
});
