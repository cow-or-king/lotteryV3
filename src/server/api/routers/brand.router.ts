/**
 * Brand Router
 * Routes tRPC pour la gestion des enseignes
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '@/infrastructure/database/prisma-client';
import { TRPCError } from '@trpc/server';

export const brandRouter = createTRPCRouter({
  /**
   * Met à jour une enseigne
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
      // Vérifier que le brand appartient à l'utilisateur
      const existingBrand = await prisma.brand.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
      });

      if (!existingBrand) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Enseigne non trouvée',
        });
      }

      const { id, ...data } = input;

      const brand = await prisma.brand.update({
        where: { id },
        data,
      });

      return brand;
    }),

  /**
   * Supprime une enseigne et tous ses commerces
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le brand appartient à l'utilisateur
      const brand = await prisma.brand.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.user.id,
        },
      });

      if (!brand) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Enseigne non trouvée',
        });
      }

      // La suppression en cascade supprimera automatiquement tous les stores
      await prisma.brand.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
