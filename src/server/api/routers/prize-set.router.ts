/**
 * PrizeSet Router
 * Routes tRPC pour la gestion des lots de gains
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Use Cases
import {
  CreatePrizeSetUseCase,
  UpdatePrizeSetUseCase,
  DeletePrizeSetUseCase,
  ListPrizeSetsUseCase,
  GetPrizeSetByIdUseCase,
  AddItemToSetUseCase,
  RemoveItemFromSetUseCase,
} from '@/core/use-cases/prize-set';

// Repositories (Adapters)
import { PrismaPrizeSetRepository } from '@/infrastructure/repositories/prisma-prize-set.repository';
import { PrismaPrizeTemplateRepository } from '@/infrastructure/repositories/prisma-prize-template.repository';
import { PrismaBrandRepository } from '@/infrastructure/repositories/prisma-brand.repository';

// Instancier les repositories
const prizeSetRepository = new PrismaPrizeSetRepository();
const prizeTemplateRepository = new PrismaPrizeTemplateRepository();
const brandRepository = new PrismaBrandRepository();

// Instancier les use cases
const createPrizeSetUseCase = new CreatePrizeSetUseCase(prizeSetRepository, brandRepository);
const updatePrizeSetUseCase = new UpdatePrizeSetUseCase(prizeSetRepository, brandRepository);
const deletePrizeSetUseCase = new DeletePrizeSetUseCase(prizeSetRepository, brandRepository);
const listPrizeSetsUseCase = new ListPrizeSetsUseCase(prizeSetRepository, brandRepository);
const getPrizeSetByIdUseCase = new GetPrizeSetByIdUseCase(prizeSetRepository, brandRepository);
const addItemToSetUseCase = new AddItemToSetUseCase(
  prizeSetRepository,
  prizeTemplateRepository,
  brandRepository,
);
const removeItemFromSetUseCase = new RemoveItemFromSetUseCase(prizeSetRepository, brandRepository);

export const prizeSetRouter = createTRPCRouter({
  /**
   * Liste tous les prize sets de l'utilisateur connecté
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await listPrizeSetsUseCase.execute(ctx.user.id);

    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error.message,
      });
    }

    return result.data;
  }),

  /**
   * Récupère un prize set par son ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await getPrizeSetByIdUseCase.execute({ id: input.id }, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Crée un nouveau prize set
   */
  create: protectedProcedure
    .input(
      z.object({
        brandId: z.string(),
        name: z.string().min(2, 'Le nom du lot doit contenir au moins 2 caractères'),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await createPrizeSetUseCase.execute(input, ctx.user.id);

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
   * Met à jour un prize set
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await updatePrizeSetUseCase.execute(input, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Supprime un prize set
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await deletePrizeSetUseCase.execute({ id: input.id }, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return { success: true };
    }),

  /**
   * Ajoute un prize template à un prize set
   */
  addItem: protectedProcedure
    .input(
      z.object({
        prizeSetId: z.string(),
        prizeTemplateId: z.string(),
        probability: z.number().min(0).max(100, 'La probabilité doit être entre 0 et 100'),
        quantity: z.number().int().positive('La quantité doit être positive'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await addItemToSetUseCase.execute(input, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Retire un prize template d'un prize set
   */
  removeItem: protectedProcedure
    .input(
      z.object({
        prizeSetId: z.string(),
        prizeTemplateId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await removeItemFromSetUseCase.execute(input, ctx.user.id);

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error.message,
        });
      }

      return { success: true };
    }),
});
