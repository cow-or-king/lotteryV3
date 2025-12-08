/**
 * Store Router
 * Routes tRPC pour la gestion des commerces
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';

// Use Cases
import {
  CreateStoreUseCase,
  UpdateStoreUseCase,
  DeleteStoreUseCase,
  ListStoresUseCase,
  GetStoreByIdUseCase,
} from '@/core/use-cases/store';

// Repositories (Adapters)
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma-store.repository';
import { PrismaBrandRepository } from '@/infrastructure/repositories/prisma-brand.repository';

// Services
import { ApiKeyEncryptionService } from '@/infrastructure/encryption/api-key-encryption.service';

// Instancier les repositories
const storeRepository = new PrismaStoreRepository();
const brandRepository = new PrismaBrandRepository();

// Instancier les services
const encryptionService = new ApiKeyEncryptionService();

// Instancier les use cases
const createStoreUseCase = new CreateStoreUseCase(storeRepository, brandRepository);
const updateStoreUseCase = new UpdateStoreUseCase(
  storeRepository,
  brandRepository,
  encryptionService,
);
const deleteStoreUseCase = new DeleteStoreUseCase(storeRepository, brandRepository);
const listStoresUseCase = new ListStoresUseCase(storeRepository);
const getStoreByIdUseCase = new GetStoreByIdUseCase(storeRepository, brandRepository);

export const storeRouter = createTRPCRouter({
  /**
   * Récupère les limites du plan utilisateur
   */
  getLimits: protectedProcedure.query(async ({ ctx }) => {
    // Récupérer la subscription
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: ctx.user.id,
      },
    });

    const plan = subscription?.plan || 'FREE';

    // Compter les brands et stores existants
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

    // Définir les limites selon le plan
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
   * Architecture Hexagonale: Router → ListStoresUseCase → StoreRepository
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await listStoresUseCase.execute(ctx.user.id);

    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error.message,
      });
    }

    // Enrichir avec brandName et logoUrl pour l'UI
    // Récupérer tous les brand IDs uniques pour éviter le N+1 query
    const uniqueBrandIds = [...new Set(result.data.map((store) => store.brandId))];

    // Une seule requête pour récupérer tous les brands
    const brands = await prisma.brand.findMany({
      where: { id: { in: uniqueBrandIds } },
      select: { id: true, name: true, logoUrl: true },
    });

    // Créer un map pour un accès O(1)
    const brandsMap = new Map(brands.map((b) => [b.id, b]));

    // Mapper les stores avec leurs brand info
    const storesWithBrandInfo = result.data.map((store) => {
      const brand = brandsMap.get(store.brandId);
      return {
        ...store,
        brandName: brand?.name || '',
        logoUrl: brand?.logoUrl || '',
      };
    });

    return storesWithBrandInfo;
  }),

  /**
   * Récupère un store par son ID
   * Architecture Hexagonale: Router → GetStoreByIdUseCase → StoreRepository
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

      // Enrichir avec les infos Brand pour l'UI
      const brand = await prisma.brand.findUnique({
        where: { id: result.data.brandId },
      });

      return {
        ...result.data,
        brand,
      };
    }),

  /**
   * Crée un nouveau store
   * Architecture Hexagonale: Router → CreateStoreUseCase → StoreRepository
   * Workflow:
   * 1. Si brandId fourni: utiliser ce brand existant
   * 2. Sinon: créer un nouveau brand avec brandName + logoUrl
   */
  create: protectedProcedure
    .input(
      z.object({
        // Option 1: Utiliser un brand existant
        brandId: z.string().optional(),
        // Option 2: Créer un nouveau brand
        brandName: z
          .string()
          .min(2, "Le nom de l'enseigne doit contenir au moins 2 caractères")
          .optional(),
        logoUrl: z.string().url('URL du logo invalide').optional(),
        // Infos du commerce (toujours requis)
        name: z.string().min(2, 'Le nom du commerce doit contenir au moins 2 caractères'),
        googleBusinessUrl: z.string().url('URL Google Business invalide'),
        // Google Place ID optionnel (nécessaire seulement pour synchronisation Google)
        googlePlaceId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createStoreUseCase.execute(input, ctx.user.id);

      if (!result.success) {
        const errorMessage = result.error.message;

        // Mapper les erreurs métier vers les codes HTTP appropriés
        if (errorMessage.includes('non trouvée') || errorMessage.includes('appartient pas')) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: errorMessage,
          });
        }

        if (errorMessage.includes('devez soit')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: errorMessage,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
        });
      }

      // Enrichir avec les infos Brand pour l'UI
      const brand = await prisma.brand.findUnique({
        where: { id: result.data.brandId },
      });

      return {
        ...result.data,
        brand,
      };
    }),

  /**
   * Met à jour un store
   * Architecture Hexagonale: Router → UpdateStoreUseCase → StoreRepository
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        googleBusinessUrl: z.string().url().optional(),
        googlePlaceId: z.string().optional(),
        googleApiKey: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await updateStoreUseCase.execute(input, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Supprime un store
   * Architecture Hexagonale: Router → DeleteStoreUseCase → StoreRepository
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await deleteStoreUseCase.execute({ id: input.id }, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return { success: true };
    }),
});
