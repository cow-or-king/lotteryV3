import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RemoveItemFromSetUseCase } from './remove-item-from-set.use-case';
import type { PrizeSetRepository } from '@/core/ports/prize-set.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('RemoveItemFromSetUseCase', () => {
  let useCase: RemoveItemFromSetUseCase;
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
    useCase = new RemoveItemFromSetUseCase(mockPrizeSetRepository, mockBrandRepository);
  });

  it('should remove item from prize set', async () => {
    const userId = 'user-123';
    const input = { prizeSetId: 'prize-set-123', prizeTemplateId: 'prize-template-123' };
    const mockPrizeSet = {
      id: input.prizeSetId,
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
    vi.mocked(mockPrizeSetRepository.removeItem).mockResolvedValue(undefined);

    const result = await useCase.execute(input, userId);
    expect(result.success).toBe(true);
  });
});
