/**
 * Tests pour DeleteStoreUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteStoreUseCase } from './delete-store.use-case';
import type { StoreRepository } from '@/core/ports/store.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('DeleteStoreUseCase', () => {
  let deleteStoreUseCase: DeleteStoreUseCase;
  let mockStoreRepository: StoreRepository;
  let mockBrandRepository: BrandRepository;

  beforeEach(() => {
    mockStoreRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findManyByBrandId: vi.fn(),
      findManyByOwnerId: vi.fn(),
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

    deleteStoreUseCase = new DeleteStoreUseCase(mockStoreRepository, mockBrandRepository);
  });

  it('should delete a store', async () => {
    const userId = 'user-123';
    const storeId = 'store-123';
    const brandId = 'brand-123';

    const existingStore = {
      id: storeId,
      name: 'Test Store',
      slug: 'test-slug',
      googleBusinessUrl: 'https://maps.google.com/test',
      googlePlaceId: null,
      description: null,
      isActive: true,
      isPaid: false,
      brandId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockBrand = {
      id: brandId,
      name: 'Test Brand',
      logoUrl: 'https://example.com/logo.png',
      ownerId: userId,
      primaryColor: null,
      secondaryColor: null,
      font: null,
      isPaid: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockStoreRepository.findById).mockResolvedValue(existingStore);
    vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
    vi.mocked(mockStoreRepository.delete).mockResolvedValue(undefined);

    const result = await deleteStoreUseCase.execute({ id: storeId }, userId);

    expect(result.success).toBe(true);
    expect(mockStoreRepository.delete).toHaveBeenCalledWith(storeId);
  });

  it('should return error if store not found', async () => {
    const userId = 'user-123';
    const storeId = 'non-existent';

    vi.mocked(mockStoreRepository.findById).mockResolvedValue(null);

    const result = await deleteStoreUseCase.execute({ id: storeId }, userId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Commerce non trouvé');
    }
  });

  it('should return error if store does not belong to user', async () => {
    const userId = 'user-123';
    const storeId = 'store-123';
    const brandId = 'brand-123';

    const existingStore = {
      id: storeId,
      name: 'Test Store',
      slug: 'test-slug',
      googleBusinessUrl: 'https://maps.google.com/test',
      googlePlaceId: null,
      description: null,
      isActive: true,
      isPaid: false,
      brandId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockBrand = {
      id: brandId,
      name: 'Test Brand',
      logoUrl: 'https://example.com/logo.png',
      ownerId: 'different-user',
      primaryColor: null,
      secondaryColor: null,
      font: null,
      isPaid: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockStoreRepository.findById).mockResolvedValue(existingStore);
    vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);

    const result = await deleteStoreUseCase.execute({ id: storeId }, userId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('appartient pas');
    }
  });
});
