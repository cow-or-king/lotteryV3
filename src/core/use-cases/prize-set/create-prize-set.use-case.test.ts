import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreatePrizeSetUseCase } from './create-prize-set.use-case';
import type { PrizeSetRepository } from '@/core/ports/prize-set.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('CreatePrizeSetUseCase', () => {
  let useCase: CreatePrizeSetUseCase;
  let mockPrizeSetRepository: PrizeSetRepository;
  let mockBrandRepository: BrandRepository;

  beforeEach(() => {
    mockPrizeSetRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findManyByBrandId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      countByBrandId: vi.fn(),
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateItem: vi.fn(),
      findItemsByPrizeSetId: vi.fn(),
    };

    mockBrandRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      countByOwnerId: vi.fn(),
    };

    useCase = new CreatePrizeSetUseCase(mockPrizeSetRepository, mockBrandRepository);
  });

  it('should create a prize set', async () => {
    const userId = 'user-123';
    const brandId = 'brand-123';
    const input = { brandId, name: 'Lot Café', description: 'Lot avec café' };

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

    const mockPrizeSet = {
      id: 'prize-set-123',
      brandId,
      name: input.name,
      description: input.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
    vi.mocked(mockPrizeSetRepository.create).mockResolvedValue(mockPrizeSet);

    const result = await useCase.execute(input, userId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe(input.name);
    }
  });

  it('should return error if brand not found', async () => {
    const userId = 'user-123';
    const input = { brandId: 'non-existent', name: 'Lot Café' };

    vi.mocked(mockBrandRepository.findById).mockResolvedValue(null);

    const result = await useCase.execute(input, userId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Enseigne non trouvée');
    }
  });
});
