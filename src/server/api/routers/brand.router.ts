/**
 * Brand Router
 * Routes tRPC pour la gestion des enseignes
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Use Cases
import { UpdateBrandUseCase, DeleteBrandUseCase } from '@/core/use-cases/brand';

// Repositories (Adapters)
import { PrismaBrandRepository } from '@/infrastructure/repositories/prisma-brand.repository';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma-store.repository';

// Instancier les repositories
const brandRepository = new PrismaBrandRepository();
const storeRepository = new PrismaStoreRepository();

// Instancier les use cases
const updateBrandUseCase = new UpdateBrandUseCase(brandRepository);
const deleteBrandUseCase = new DeleteBrandUseCase(brandRepository, storeRepository);

export const brandRouter = createTRPCRouter({
  /**
   * Met à jour une enseigne
   * Architecture Hexagonale: Router → UpdateBrandUseCase → BrandRepository
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        logoUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await updateBrandUseCase.execute(input, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Supprime une enseigne et tous ses commerces
   * Architecture Hexagonale: Router → DeleteBrandUseCase → BrandRepository
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await deleteBrandUseCase.execute({ id: input.id }, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return { success: true };
    }),
});
