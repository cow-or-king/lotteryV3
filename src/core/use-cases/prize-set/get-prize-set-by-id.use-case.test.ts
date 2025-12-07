import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetPrizeSetByIdUseCase } from './get-prize-set-by-id.use-case';
import type { PrizeSetRepository } from '@/core/ports/prize-set.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('GetPrizeSetByIdUseCase', () => {
  let useCase: GetPrizeSetByIdUseCase;
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
    useCase = new GetPrizeSetByIdUseCase(mockPrizeSetRepository, mockBrandRepository);
  });

  it('should get a prize set by id', async () => {
    const userId = 'user-123';
    const input = { id: 'prize-set-123' };
    const mockPrizeSet = {
      id: input.id,
      brandId: 'brand-123',
      name: 'Lot',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    };
    const mockBrand = {
      id: 'brand-123',
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

    vi.mocked(mockPrizeSetRepository.findById).mockResolvedValue(mockPrizeSet);
    vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);

    const result = await useCase.execute(input, userId);
    expect(result.success).toBe(true);
  });
});
