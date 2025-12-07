/**
 * Tests pour UpdateBrandUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateBrandUseCase } from './update-brand.use-case';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('UpdateBrandUseCase', () => {
  let updateBrandUseCase: UpdateBrandUseCase;
  let mockBrandRepository: BrandRepository;

  beforeEach(() => {
    mockBrandRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByOwnerId: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      countByOwnerId: vi.fn(),
    };

    updateBrandUseCase = new UpdateBrandUseCase(mockBrandRepository);
  });

  it('should update a brand successfully', async () => {
    const userId = 'user-123';
    const brandId = 'brand-123';

    const existingBrand = {
      id: brandId,
      name: 'Old Name',
      logoUrl: 'https://example.com/old-logo.png',
      ownerId: userId,
      primaryColor: '#5B21B6',
      secondaryColor: '#FACC15',
      font: 'inter',
      isPaid: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedBrand = {
      ...existingBrand,
      name: 'New Name',
      logoUrl: 'https://example.com/new-logo.png',
    };

    vi.mocked(mockBrandRepository.findById).mockResolvedValue(existingBrand);
    vi.mocked(mockBrandRepository.update).mockResolvedValue(updatedBrand);

    const result = await updateBrandUseCase.execute(
      {
        id: brandId,
        name: 'New Name',
        logoUrl: 'https://example.com/new-logo.png',
      },
      userId,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('New Name');
      expect(result.data.logoUrl).toBe('https://example.com/new-logo.png');
    }
    expect(mockBrandRepository.update).toHaveBeenCalledWith(brandId, {
      name: 'New Name',
      logoUrl: 'https://example.com/new-logo.png',
    });
  });

  it('should return error if brand not found', async () => {
    const userId = 'user-123';
    const brandId = 'non-existent';

    vi.mocked(mockBrandRepository.findById).mockResolvedValue(null);

    const result = await updateBrandUseCase.execute({ id: brandId, name: 'New Name' }, userId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Enseigne non trouvée');
    }
  });

  it('should return error if brand does not belong to user', async () => {
    const userId = 'user-123';
    const brandId = 'brand-123';

    const existingBrand = {
      id: brandId,
      name: 'Test Brand',
      logoUrl: 'https://example.com/logo.png',
      ownerId: 'different-user',
      primaryColor: '#5B21B6',
      secondaryColor: '#FACC15',
      font: 'inter',
      isPaid: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockBrandRepository.findById).mockResolvedValue(existingBrand);

    const result = await updateBrandUseCase.execute({ id: brandId, name: 'New Name' }, userId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('appartient pas');
    }
  });

  it('should update only provided fields', async () => {
    const userId = 'user-123';
    const brandId = 'brand-123';

    const existingBrand = {
      id: brandId,
      name: 'Test Brand',
      logoUrl: 'https://example.com/logo.png',
      ownerId: userId,
      primaryColor: '#5B21B6',
      secondaryColor: '#FACC15',
      font: 'inter',
      isPaid: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedBrand = {
      ...existingBrand,
      primaryColor: '#FF0000',
    };

    vi.mocked(mockBrandRepository.findById).mockResolvedValue(existingBrand);
    vi.mocked(mockBrandRepository.update).mockResolvedValue(updatedBrand);

    const result = await updateBrandUseCase.execute(
      {
        id: brandId,
        primaryColor: '#FF0000',
      },
      userId,
    );

    expect(result.success).toBe(true);
    expect(mockBrandRepository.update).toHaveBeenCalledWith(brandId, {
      primaryColor: '#FF0000',
    });
  });
});
