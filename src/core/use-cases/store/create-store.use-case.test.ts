/**
 * Tests pour CreateStoreUseCase
 * TDD: Tests écrits en premier
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateStoreUseCase } from './create-store.use-case';
import type { StoreRepository } from '@/core/ports/store.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

describe('CreateStoreUseCase', () => {
  let createStoreUseCase: CreateStoreUseCase;
  let mockStoreRepository: StoreRepository;
  let mockBrandRepository: BrandRepository;

  beforeEach(() => {
    // Mock repositories
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

    createStoreUseCase = new CreateStoreUseCase(mockStoreRepository, mockBrandRepository);
  });

  describe('execute', () => {
    it('should create a store with existing brandId', async () => {
      // Arrange
      const userId = 'user-123';
      const brandId = 'brand-123';
      const input = {
        brandId,
        name: 'Mon Commerce',
        googleBusinessUrl: 'https://maps.google.com/...',
      };

      const mockBrand = {
        id: brandId,
        name: 'Mon Enseigne',
        logoUrl: 'https://example.com/logo.png',
        ownerId: userId,
        primaryColor: null,
        secondaryColor: null,
        font: null,
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStore = {
        id: 'store-123',
        name: input.name,
        slug: 'mon-enseigne-mon-commerce',
        googleBusinessUrl: input.googleBusinessUrl,
        googlePlaceId: null,
        description: null,
        isActive: true,
        isPaid: false,
        brandId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
      vi.mocked(mockStoreRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(mockStoreRepository.countByBrandId).mockResolvedValue(0);
      vi.mocked(mockStoreRepository.create).mockResolvedValue(mockStore);

      // Act
      const result = await createStoreUseCase.execute(input, userId);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(input.name);
        expect(result.data.brandId).toBe(brandId);
      }
    });

    it('should return error if brand not found', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        brandId: 'non-existent-brand',
        name: 'Mon Commerce',
        googleBusinessUrl: 'https://maps.google.com/...',
      };

      vi.mocked(mockBrandRepository.findById).mockResolvedValue(null);

      // Act
      const result = await createStoreUseCase.execute(input, userId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Enseigne non trouvée');
      }
    });

    it('should return error if brand does not belong to user', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        brandId: 'brand-123',
        name: 'Mon Commerce',
        googleBusinessUrl: 'https://maps.google.com/...',
      };

      const mockBrand = {
        id: input.brandId,
        name: 'Mon Enseigne',
        logoUrl: 'https://example.com/logo.png',
        ownerId: 'different-user', // Différent utilisateur
        primaryColor: null,
        secondaryColor: null,
        font: null,
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);

      // Act
      const result = await createStoreUseCase.execute(input, userId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('appartient pas');
      }
    });

    it('should create a new brand if brandName and logoUrl provided', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        brandName: 'Nouvelle Enseigne',
        logoUrl: 'https://example.com/logo.png',
        name: 'Mon Commerce',
        googleBusinessUrl: 'https://maps.google.com/...',
      };

      const mockNewBrand = {
        id: 'brand-new',
        name: input.brandName,
        logoUrl: input.logoUrl,
        ownerId: userId,
        primaryColor: null,
        secondaryColor: null,
        font: null,
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStore = {
        id: 'store-123',
        name: input.name,
        slug: 'nouvelle-enseigne-mon-commerce',
        googleBusinessUrl: input.googleBusinessUrl,
        googlePlaceId: null,
        description: null,
        isActive: true,
        isPaid: false,
        brandId: mockNewBrand.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockBrandRepository.countByOwnerId).mockResolvedValue(0);
      vi.mocked(mockBrandRepository.create).mockResolvedValue(mockNewBrand);
      vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockNewBrand); // After create
      vi.mocked(mockStoreRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(mockStoreRepository.countByBrandId).mockResolvedValue(0);
      vi.mocked(mockStoreRepository.create).mockResolvedValue(mockStore);

      // Act
      const result = await createStoreUseCase.execute(input, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockBrandRepository.create).toHaveBeenCalledWith({
        name: input.brandName,
        logoUrl: input.logoUrl,
        ownerId: userId,
        isPaid: false,
      });
    });

    it('should return error if neither brandId nor brandName+logoUrl provided', async () => {
      // Arrange
      const userId = 'user-123';
      const input = {
        name: 'Mon Commerce',
        googleBusinessUrl: 'https://maps.google.com/...',
      };

      // Act
      const result = await createStoreUseCase.execute(input, userId);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('soit sélectionner');
      }
    });

    it('should generate unique slug if slug already exists', async () => {
      // Arrange
      const userId = 'user-123';
      const brandId = 'brand-123';
      const input = {
        brandId,
        name: 'Mon Commerce',
        googleBusinessUrl: 'https://maps.google.com/...',
      };

      const mockBrand = {
        id: brandId,
        name: 'Mon Enseigne',
        logoUrl: 'https://example.com/logo.png',
        ownerId: userId,
        primaryColor: null,
        secondaryColor: null,
        font: null,
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStore = {
        id: 'store-123',
        name: input.name,
        slug: 'mon-enseigne-mon-commerce-1',
        googleBusinessUrl: input.googleBusinessUrl,
        googlePlaceId: null,
        description: null,
        isActive: true,
        isPaid: false,
        brandId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
      // Premier slug existe déjà
      vi.mocked(mockStoreRepository.findBySlug)
        .mockResolvedValueOnce({ ...mockStore, slug: 'mon-enseigne-mon-commerce' })
        .mockResolvedValueOnce(null);
      vi.mocked(mockStoreRepository.countByBrandId).mockResolvedValue(0);
      vi.mocked(mockStoreRepository.create).mockResolvedValue(mockStore);

      // Act
      const result = await createStoreUseCase.execute(input, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockStoreRepository.findBySlug).toHaveBeenCalledTimes(2);
    });

    it('should mark second store as paid', async () => {
      // Arrange
      const userId = 'user-123';
      const brandId = 'brand-123';
      const input = {
        brandId,
        name: 'Mon Commerce 2',
        googleBusinessUrl: 'https://maps.google.com/...',
      };

      const mockBrand = {
        id: brandId,
        name: 'Mon Enseigne',
        logoUrl: 'https://example.com/logo.png',
        ownerId: userId,
        primaryColor: null,
        secondaryColor: null,
        font: null,
        isPaid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStore = {
        id: 'store-2',
        name: input.name,
        slug: 'mon-enseigne-mon-commerce-2',
        googleBusinessUrl: input.googleBusinessUrl,
        googlePlaceId: null,
        description: null,
        isActive: true,
        isPaid: true, // Deuxième commerce
        brandId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockBrandRepository.findById).mockResolvedValue(mockBrand);
      vi.mocked(mockStoreRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(mockStoreRepository.countByBrandId).mockResolvedValue(1); // 1 store existe déjà
      vi.mocked(mockStoreRepository.create).mockResolvedValue(mockStore);

      // Act
      const result = await createStoreUseCase.execute(input, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockStoreRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isPaid: true,
        }),
      );
    });
  });
});
