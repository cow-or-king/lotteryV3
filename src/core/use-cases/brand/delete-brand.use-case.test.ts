/**
 * Tests pour DeleteBrandUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteBrandUseCase } from './delete-brand.use-case';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('DeleteBrandUseCase', () => {
  let deleteBrandUseCase: DeleteBrandUseCase;
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

    deleteBrandUseCase = new DeleteBrandUseCase(mockBrandRepository);
  });

  it('should delete a brand successfully', async () => {
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

    vi.mocked(mockBrandRepository.findById).mockResolvedValue(existingBrand);
    vi.mocked(mockBrandRepository.delete).mockResolvedValue(undefined);

    const result = await deleteBrandUseCase.execute({ id: brandId }, userId);

    expect(result.success).toBe(true);
    expect(mockBrandRepository.delete).toHaveBeenCalledWith(brandId);
  });

  it('should return error if brand not found', async () => {
    const userId = 'user-123';
    const brandId = 'non-existent';

    vi.mocked(mockBrandRepository.findById).mockResolvedValue(null);

    const result = await deleteBrandUseCase.execute({ id: brandId }, userId);

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

    const result = await deleteBrandUseCase.execute({ id: brandId }, userId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('appartient pas');
    }
  });
});
