/**
 * PrizeTemplate Router
 * Routes tRPC pour la gestion des gains (templates)
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Use Cases
import {
  CreatePrizeTemplateUseCase,
  UpdatePrizeTemplateUseCase,
  DeletePrizeTemplateUseCase,
  ListPrizeTemplatesUseCase,
  GetPrizeTemplateByIdUseCase,
} from '@/core/use-cases/prize-template';

// Repositories (Adapters)
import { PrismaPrizeTemplateRepository } from '@/infrastructure/repositories/prisma-prize-template.repository';
import { PrismaBrandRepository } from '@/infrastructure/repositories/prisma-brand.repository';

// Instancier les repositories
const prizeTemplateRepository = new PrismaPrizeTemplateRepository();
const brandRepository = new PrismaBrandRepository();

// Instancier les use cases
const createPrizeTemplateUseCase = new CreatePrizeTemplateUseCase(
  prizeTemplateRepository,
  brandRepository,
);
const updatePrizeTemplateUseCase = new UpdatePrizeTemplateUseCase(
  prizeTemplateRepository,
  brandRepository,
);
const deletePrizeTemplateUseCase = new DeletePrizeTemplateUseCase(
  prizeTemplateRepository,
  brandRepository,
);
const listPrizeTemplatesUseCase = new ListPrizeTemplatesUseCase(
  prizeTemplateRepository,
  brandRepository,
);
const getPrizeTemplateByIdUseCase = new GetPrizeTemplateByIdUseCase(
  prizeTemplateRepository,
  brandRepository,
);

export const prizeTemplateRouter = createTRPCRouter({
  /**
   * Liste tous les prize templates de l'utilisateur connecté
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await listPrizeTemplatesUseCase.execute(ctx.user.id);

    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error.message,
      });
    }

    return result.data;
  }),

  /**
   * Récupère un prize template par son ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await getPrizeTemplateByIdUseCase.execute({ id: input.id }, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Crée un nouveau prize template
   */
  create: protectedProcedure
    .input(
      z.object({
        brandId: z.string().nullable(), // null = gain commun à toutes les enseignes
        name: z.string().min(2, 'Le nom du gain doit contenir au moins 2 caractères'),
        description: z.string().optional(),
        minPrice: z.number().positive().optional(),
        maxPrice: z.number().positive().optional(),
        color: z
          .string()
          .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Couleur invalide')
          .optional(),
        iconUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createPrizeTemplateUseCase.execute(input, ctx.user.id);

      if (!result.success) {
        const errorMessage = result.error.message;

        if (errorMessage.includes('non trouvée') || errorMessage.includes('appartient pas')) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: errorMessage,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
        });
      }

      return result.data;
    }),

  /**
   * Met à jour un prize template
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        minPrice: z.number().positive().optional(),
        maxPrice: z.number().positive().optional(),
        color: z
          .string()
          .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          .optional(),
        iconUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await updatePrizeTemplateUseCase.execute(input, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Supprime un prize template
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await deletePrizeTemplateUseCase.execute({ id: input.id }, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return { success: true };
    }),
});
