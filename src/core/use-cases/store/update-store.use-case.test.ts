/**
 * Tests pour UpdateStoreUseCase
 * TDD: Tests écrits en premier
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateStoreUseCase } from './update-store.use-case';
import type { StoreRepository } from '@/core/ports/store.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('UpdateStoreUseCase', () => {
  let updateStoreUseCase: UpdateStoreUseCase;
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

    updateStoreUseCase = new UpdateStoreUseCase(mockStoreRepository, mockBrandRepository);
  });

  describe('execute', () => {
    it('should update a store', async () => {
      // Arrange
      const userId = 'user-123';
      const storeId = 'store-123';
      const brandId = 'brand-123';

      const existingStore = {
        id: storeId,
        name: 'Old Name',
        slug: 'old-slug',
        googleBusinessUrl: 'https://maps.google.com/old',
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

      const updatedStore = {
        ...existingStore,
        name: 'New Name',
        googleBusinessUrl: 'https://maps.google.com/new',
      };

      vi.mocked(mockStoreRepository.findById).mockResolvedValue(existingStore);
      vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
      vi.mocked(mockStoreRepository.update).mockResolvedValue(updatedStore);

      // Act
      const result = await updateStoreUseCase.execute(
        {
          id: storeId,
          name: 'New Name',
          googleBusinessUrl: 'https://maps.google.com/new',
        },
        userId,
      );

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('New Name');
        expect(result.data.googleBusinessUrl).toBe('https://maps.google.com/new');
      }
    });

    it('should return error if store not found', async () => {
      // Arrange
      const userId = 'user-123';
      const storeId = 'non-existent';

      vi.mocked(mockStoreRepository.findById).mockResolvedValue(null);

      // Act
      const result = await updateStoreUseCase.execute({ id: storeId, name: 'New Name' }, userId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Commerce non trouvé');
      }
    });

    it('should return error if store does not belong to user', async () => {
      // Arrange
      const userId = 'user-123';
      const storeId = 'store-123';
      const brandId = 'brand-123';

      const existingStore = {
        id: storeId,
        name: 'Old Name',
        slug: 'old-slug',
        googleBusinessUrl: 'https://maps.google.com/old',
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
        ownerId: 'different-user', // Different user
        primaryColor: null,
        secondaryColor: null,
        font: null,
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockStoreRepository.findById).mockResolvedValue(existingStore);
      vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);

      // Act
      const result = await updateStoreUseCase.execute({ id: storeId, name: 'New Name' }, userId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('appartient pas');
      }
    });

    it('should update only provided fields', async () => {
      // Arrange
      const userId = 'user-123';
      const storeId = 'store-123';
      const brandId = 'brand-123';

      const existingStore = {
        id: storeId,
        name: 'Old Name',
        slug: 'old-slug',
        googleBusinessUrl: 'https://maps.google.com/old',
        googlePlaceId: null,
        description: 'Old description',
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

      const updatedStore = {
        ...existingStore,
        name: 'New Name',
      };

      vi.mocked(mockStoreRepository.findById).mockResolvedValue(existingStore);
      vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
      vi.mocked(mockStoreRepository.update).mockResolvedValue(updatedStore);

      // Act
      const result = await updateStoreUseCase.execute(
        { id: storeId, name: 'New Name' }, // Only name
        userId,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(mockStoreRepository.update).toHaveBeenCalledWith(storeId, {
        name: 'New Name',
      });
    });
  });
});
