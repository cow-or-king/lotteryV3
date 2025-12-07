/**
 * Tests pour GetPrizeTemplateByIdUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetPrizeTemplateByIdUseCase } from './get-prize-template-by-id.use-case';
import type { PrizeTemplateRepository } from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('GetPrizeTemplateByIdUseCase', () => {
  let getPrizeTemplateByIdUseCase: GetPrizeTemplateByIdUseCase;
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

    getPrizeTemplateByIdUseCase = new GetPrizeTemplateByIdUseCase(
      mockPrizeTemplateRepository,
      mockBrandRepository,
    );
  });

  it('should get a prize template by id', async () => {
    const userId = 'user-123';
    const brandId = 'brand-123';
    const input = { id: 'prize-template-123' };

    const mockPrizeTemplate = {
      id: input.id,
      brandId,
      name: 'Café offert',
      description: 'Un café gratuit',
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

    vi.mocked(mockPrizeTemplateRepository.findById).mockResolvedValue(mockPrizeTemplate);
    vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);

    const result = await getPrizeTemplateByIdUseCase.execute(input, userId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(input.id);
      expect(result.data.name).toBe('Café offert');
    }
  });

  it('should return error if prize template not found', async () => {
    const userId = 'user-123';
    const input = { id: 'non-existent-prize-template' };

    vi.mocked(mockPrizeTemplateRepository.findById).mockResolvedValue(null);

    const result = await getPrizeTemplateByIdUseCase.execute(input, userId);

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

    const result = await getPrizeTemplateByIdUseCase.execute(input, userId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('appartient pas');
    }
  });
});
