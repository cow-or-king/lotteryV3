import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AddItemToSetUseCase } from './add-item-to-set.use-case';
import type { PrizeSetRepository } from '@/core/ports/prize-set.repository';
import type { PrizeTemplateRepository } from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('AddItemToSetUseCase', () => {
  let useCase: AddItemToSetUseCase;
  let mockPrizeSetRepository: PrizeSetRepository;
  let mockPrizeTemplateRepository: PrizeTemplateRepository;
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
    useCase = new AddItemToSetUseCase(
      mockPrizeSetRepository,
      mockPrizeTemplateRepository,
      mockBrandRepository,
    );
  });

  it('should add item to prize set', async () => {
    const userId = 'user-123';
    const input = {
      prizeSetId: 'prize-set-123',
      prizeTemplateId: 'prize-template-123',
      probability: 10,
      quantity: 5,
    };
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
    const mockPrizeTemplate = {
      id: input.prizeTemplateId,
      brandId: 'brand-123',
      name: 'Café',
      description: null,
      value: null,
      color: '#8B5CF6',
      iconUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockItem = {
      id: 'item-123',
      prizeSetId: input.prizeSetId,
      prizeTemplateId: input.prizeTemplateId,
      probability: input.probability,
      quantity: input.quantity,
      createdAt: new Date(),
    };

    vi.mocked(mockPrizeSetRepository.findById).mockResolvedValue(mockPrizeSet);
    vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
    vi.mocked(mockPrizeTemplateRepository.findById).mockResolvedValue(mockPrizeTemplate);
    vi.mocked(mockPrizeSetRepository.addItem).mockResolvedValue(mockItem);

    const result = await useCase.execute(input, userId);
    expect(result.success).toBe(true);
  });
});
