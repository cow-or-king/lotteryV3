import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListPrizeSetsUseCase } from './list-prize-sets.use-case';
import type { PrizeSetRepository } from '@/core/ports/prize-set.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('ListPrizeSetsUseCase', () => {
  let useCase: ListPrizeSetsUseCase;
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
    useCase = new ListPrizeSetsUseCase(mockPrizeSetRepository, mockBrandRepository);
  });

  it('should list all prize sets for user brands', async () => {
    const userId = 'user-123';
    const mockBrands = [
      {
        id: 'brand-1',
        name: 'Brand 1',
        logoUrl: 'https://example.com/logo1.png',
        ownerId: userId,
        primaryColor: '#5B21B6',
        secondaryColor: '#FACC15',
        font: 'inter',
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const mockPrizeSets = [
      {
        id: 'prize-set-1',
        brandId: 'brand-1',
        name: 'Lot 1',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      },
    ];

    vi.mocked(mockBrandRepository.findByOwnerId).mockResolvedValue(mockBrands);
    vi.mocked(mockPrizeSetRepository.findManyByBrandId).mockResolvedValue(mockPrizeSets);

    const result = await useCase.execute(userId);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }
  });
});
