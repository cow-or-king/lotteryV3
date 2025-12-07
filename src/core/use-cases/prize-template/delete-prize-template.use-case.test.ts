/**
 * Tests pour DeletePrizeTemplateUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeletePrizeTemplateUseCase } from './delete-prize-template.use-case';
import type { PrizeTemplateRepository } from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('DeletePrizeTemplateUseCase', () => {
  let deletePrizeTemplateUseCase: DeletePrizeTemplateUseCase;
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

    deletePrizeTemplateUseCase = new DeletePrizeTemplateUseCase(
      mockPrizeTemplateRepository,
      mockBrandRepository,
    );
  });

  it('should delete a prize template', async () => {
    const userId = 'user-123';
    const brandId = 'brand-123';
    const input = { id: 'prize-template-123' };

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
      ownerId: userId,
      primaryColor: '#5B21B6',
      secondaryColor: '#FACC15',
      font: 'inter',
      isPaid: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockPrizeTemplateRepository.findById).mockResolvedValue(mockPrizeTemplate);
    vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
    vi.mocked(mockPrizeTemplateRepository.delete).mockResolvedValue(undefined);

    const result = await deletePrizeTemplateUseCase.execute(input, userId);

    expect(result.success).toBe(true);
    expect(mockPrizeTemplateRepository.delete).toHaveBeenCalledWith(input.id);
  });

  it('should return error if prize template not found', async () => {
    const userId = 'user-123';
    const input = { id: 'non-existent-prize-template' };

    vi.mocked(mockPrizeTemplateRepository.findById).mockResolvedValue(null);

    const result = await deletePrizeTemplateUseCase.execute(input, userId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Gain non trouvé');
    }
  });

  it('should return error if prize template does not belong to user', async () => {
    const userId = 'user-123';
    const brandId = 'brand-123';
    const input = { id: 'prize-template-123' };

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

    const result = await deletePrizeTemplateUseCase.execute(input, userId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('appartient pas');
    }
  });
});
