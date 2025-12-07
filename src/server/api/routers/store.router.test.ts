/**
 * Tests d'intégration pour Store Router
 * Vérifie le bon fonctionnement des routes tRPC
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { appRouter } from '../root';
import { createInnerTRPCContext } from '../trpc';
import { prisma } from '@/infrastructure/database/prisma-client';

describe('Store Router Integration Tests', () => {
  let userId: string;
  let brandId: string;
  let storeId: string;

  // Setup mock context
  const createMockContext = () => {
    return createInnerTRPCContext({
      userId: userId as any, // Cast to UserId branded type
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    });
  };

  beforeEach(async () => {
    // Créer un utilisateur de test
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
      },
    });
    userId = user.id;

    // Créer une subscription
    await prisma.subscription.create({
      data: {
        userId,
        plan: 'FREE',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Créer un brand de test
    const brand = await prisma.brand.create({
      data: {
        name: 'Test Brand',
        logoUrl: 'https://example.com/logo.png',
        ownerId: userId,
      },
    });
    brandId = brand.id;

    // Créer un store de test
    const store = await prisma.store.create({
      data: {
        name: 'Test Store',
        slug: 'test-brand-test-store',
        googleBusinessUrl: 'https://maps.google.com/test',
        brandId,
      },
    });
    storeId = store.id;
  });

  afterEach(async () => {
    // Cleanup dans l'ordre inverse des dépendances
    await prisma.store.deleteMany({ where: { brandId } });
    await prisma.brand.deleteMany({ where: { ownerId: userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  describe('getLimits', () => {
    it('should return subscription limits for FREE plan', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.store.getLimits();

      expect(result).toMatchObject({
        plan: 'FREE',
        maxBrands: 1,
        maxStoresPerBrand: 1,
        brandsCount: 1,
        storesCount: 1,
        canCreateBrand: false, // Already has 1 brand
        canCreateStore: false, // Already has 1 store
      });
    });
  });

  describe('list', () => {
    it('should list all stores for the authenticated user', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.store.list();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: storeId,
        name: 'Test Store',
        slug: 'test-brand-test-store',
        brandId,
        brandName: 'Test Brand',
      });
    });

    it('should return empty array if user has no stores', async () => {
      // Delete the test store
      await prisma.store.deleteMany({ where: { brandId } });

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.store.list();

      expect(result).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should return a store by id', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.store.getById({ id: storeId });

      expect(result).toMatchObject({
        id: storeId,
        name: 'Test Store',
        slug: 'test-brand-test-store',
        brand: {
          id: brandId,
          name: 'Test Brand',
        },
      });
    });

    it('should throw NOT_FOUND if store does not exist', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.store.getById({ id: 'non-existent-id' })).rejects.toThrow(
        'Commerce non trouvé',
      );
    });

    it('should throw NOT_FOUND if store belongs to different user', async () => {
      // Créer un autre user et son brand/store
      const otherUser = await prisma.user.create({
        data: { email: `other-${Date.now()}@example.com` }, // Unique email
      });

      const otherBrand = await prisma.brand.create({
        data: {
          name: 'Other Brand',
          logoUrl: 'https://example.com/other.png',
          ownerId: otherUser.id,
        },
      });

      const otherStore = await prisma.store.create({
        data: {
          name: 'Other Store',
          slug: `other-brand-other-store-${Date.now()}`,
          googleBusinessUrl: 'https://maps.google.com/other',
          brandId: otherBrand.id,
        },
      });

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.store.getById({ id: otherStore.id })).rejects.toThrow(
        'Commerce non trouvé',
      );

      // Cleanup
      await prisma.store.delete({ where: { id: otherStore.id } });
      await prisma.brand.delete({ where: { id: otherBrand.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });

  describe('create', () => {
    it('should create a store with existing brand', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Delete existing store first to respect limits
      await prisma.store.deleteMany({ where: { brandId } });

      const result = await caller.store.create({
        brandId,
        name: 'New Store',
        googleBusinessUrl: 'https://maps.google.com/new',
      });

      expect(result).toMatchObject({
        name: 'New Store',
        slug: 'test-brand-new-store',
        brandId,
      });

      // Cleanup
      await prisma.store.delete({ where: { id: result.id } });
    });

    it('should create a store with new brand', async () => {
      // Delete existing brand first to respect limits
      await prisma.store.deleteMany({ where: { brandId } });
      await prisma.brand.delete({ where: { id: brandId } });

      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.store.create({
        brandName: 'New Brand',
        logoUrl: 'https://example.com/new-logo.png',
        name: 'New Store',
        googleBusinessUrl: 'https://maps.google.com/new',
      });

      expect(result).toMatchObject({
        name: 'New Store',
        brand: {
          name: 'New Brand',
          logoUrl: 'https://example.com/new-logo.png',
        },
      });

      // Cleanup
      await prisma.store.delete({ where: { id: result.id } });
      await prisma.brand.delete({ where: { id: result.brand.id } });
    });

    it('should throw error if neither brandId nor brandName provided', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.store.create({
          name: 'New Store',
          googleBusinessUrl: 'https://maps.google.com/new',
        }),
      ).rejects.toThrow('sélectionner une enseigne');
    });
  });

  describe('update', () => {
    it('should update a store', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.store.update({
        id: storeId,
        name: 'Updated Store',
        googleBusinessUrl: 'https://maps.google.com/updated',
      });

      expect(result).toMatchObject({
        id: storeId,
        name: 'Updated Store',
        googleBusinessUrl: 'https://maps.google.com/updated',
      });
    });

    it('should throw NOT_FOUND if store does not exist', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.store.update({
          id: 'non-existent-id',
          name: 'Updated Store',
        }),
      ).rejects.toThrow('Commerce non trouvé');
    });
  });

  describe('delete', () => {
    it('should delete a store', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.store.delete({ id: storeId });

      expect(result).toEqual({ success: true });

      // Vérifier que le store a bien été supprimé
      const deletedStore = await prisma.store.findUnique({
        where: { id: storeId },
      });
      expect(deletedStore).toBeNull();
    });

    it('should throw NOT_FOUND if store does not exist', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.store.delete({ id: 'non-existent-id' })).rejects.toThrow(
        'Commerce non trouvé',
      );
    });
  });
});
