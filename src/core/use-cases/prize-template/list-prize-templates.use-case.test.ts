/**
 * Tests pour ListPrizeTemplatesUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListPrizeTemplatesUseCase } from './list-prize-templates.use-case';
import type { PrizeTemplateRepository } from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('ListPrizeTemplatesUseCase', () => {
  let listPrizeTemplatesUseCase: ListPrizeTemplatesUseCase;
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

    listPrizeTemplatesUseCase = new ListPrizeTemplatesUseCase(
      mockPrizeTemplateRepository,
      mockBrandRepository,
    );
  });

  it('should list all prize templates for user brands', async () => {
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
      {
        id: 'brand-2',
        name: 'Brand 2',
        logoUrl: 'https://example.com/logo2.png',
        ownerId: userId,
        primaryColor: '#5B21B6',
        secondaryColor: '#FACC15',
        font: 'inter',
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockPrizeTemplates1 = [
      {
        id: 'prize-template-1',
        brandId: 'brand-1',
        name: 'Café offert',
        description: null,
        value: 2.5,
        color: '#8B5CF6',
        iconUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockPrizeTemplates2 = [
      {
        id: 'prize-template-2',
        brandId: 'brand-2',
        name: '-10%',
        description: null,
        value: null,
        color: '#8B5CF6',
        iconUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(mockBrandRepository.findByOwnerId).mockResolvedValue(mockBrands);
    vi.mocked(mockPrizeTemplateRepository.findManyByBrandId)
      .mockResolvedValueOnce(mockPrizeTemplates1)
      .mockResolvedValueOnce(mockPrizeTemplates2);

    const result = await listPrizeTemplatesUseCase.execute(userId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.id).toBe('prize-template-1');
      expect(result.data[1]?.id).toBe('prize-template-2');
    }
  });

  it('should return empty array if user has no brands', async () => {
    const userId = 'user-123';

    vi.mocked(mockBrandRepository.findByOwnerId).mockResolvedValue([]);

    const result = await listPrizeTemplatesUseCase.execute(userId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });
});
