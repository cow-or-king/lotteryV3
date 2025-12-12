/**
 * Store Queries Router
 * Toutes les queries (lectures) pour les stores
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';

// Use Cases
import { ListStoresUseCase, GetStoreByIdUseCase } from '@/core/use-cases/store';

// Repositories
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma-store.repository';
import { PrismaBrandRepository } from '@/infrastructure/repositories/prisma-brand.repository';

// Instancier les repositories
const storeRepository = new PrismaStoreRepository();
const brandRepository = new PrismaBrandRepository();

// Instancier les use cases
const listStoresUseCase = new ListStoresUseCase(storeRepository);
const getStoreByIdUseCase = new GetStoreByIdUseCase(storeRepository, brandRepository);

export const storeQueriesRouter = createTRPCRouter({
  /**
   * Récupère les limites du plan utilisateur
   */
  getLimits: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: ctx.user.id,
      },
    });

    const plan = subscription?.plan || 'FREE';

    const [brandsCount, storesCount] = await Promise.all([
      prisma.brand.count({
        where: {
          ownerId: ctx.user.id,
        },
      }),
      prisma.store.count({
        where: {
          brand: {
            ownerId: ctx.user.id,
          },
        },
      }),
    ]);

    const limits = {
      FREE: {
        maxBrands: 1,
        maxStoresPerBrand: 1,
      },
      STARTER: {
        maxBrands: 3,
        maxStoresPerBrand: 10,
      },
      PRO: {
        maxBrands: 999,
        maxStoresPerBrand: 999,
      },
    };

    const currentLimits = limits[plan as keyof typeof limits] || limits.FREE;

    return {
      plan,
      brandsCount,
      storesCount,
      maxBrands: currentLimits.maxBrands,
      maxStoresPerBrand: currentLimits.maxStoresPerBrand,
      canCreateBrand: brandsCount < currentLimits.maxBrands,
      canCreateStore: storesCount < brandsCount * currentLimits.maxStoresPerBrand,
    };
  }),

  /**
   * Liste tous les stores de l'utilisateur connecté
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await listStoresUseCase.execute(ctx.user.id);

    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error.message,
      });
    }

    // Enrichir avec brandName et logoUrl
    const uniqueBrandIds = [...new Set(result.data.map((store) => store.brandId))];

    const brands = await prisma.brand.findMany({
      where: { id: { in: uniqueBrandIds } },
      select: { id: true, name: true, logoUrl: true, logoStoragePath: true },
    });

    const brandsMap = new Map(brands.map((b) => [b.id, b]));

    const { getStoreFinalLogoUrl } = await import('@/lib/utils/supabase-storage');

    const storesWithBrandInfo = result.data.map((store) => {
      const brand = brandsMap.get(store.brandId);
      const finalLogoUrl = getStoreFinalLogoUrl({
        logoUrl: brand?.logoUrl ?? null,
        logoStoragePath: brand?.logoStoragePath ?? null,
      });

      return {
        ...store,
        brandName: brand?.name || '',
        brandLogoUrl: brand?.logoUrl || '',
        logoUrl: finalLogoUrl,
      };
    });

    return storesWithBrandInfo;
  }),

  /**
   * Récupère un store par son ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await getStoreByIdUseCase.execute({ id: input.id }, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      const brand = await prisma.brand.findUnique({
        where: { id: result.data.brandId },
      });

      return {
        ...result.data,
        brand,
      };
    }),
});
