/**
 * Game CRUD Router
 * Routes tRPC pour les opérations CRUD sur les jeux
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { createGameSchema, updateGameSchema } from './game-schemas';

export const gameCrudRouter = createTRPCRouter({
  /**
   * Créer un nouveau jeu
   */
  create: protectedProcedure.input(createGameSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;

    const game = await ctx.prisma.game.create({
      data: {
        ...input,
        createdBy: userId,
      } as Parameters<typeof ctx.prisma.game.create>[0]['data'],
    });

    return game;
  }),

  /**
   * Récupérer tous les jeux de l'utilisateur
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;

    const games = await ctx.prisma.game.findMany({
      where: {
        createdBy: userId,
      },
      include: {
        _count: {
          select: {
            plays: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return games;
  }),

  /**
   * Récupérer un jeu par ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const game = await ctx.prisma.game.findFirst({
        where: {
          id: input.id,
          createdBy: userId,
        },
        include: {
          _count: {
            select: {
              plays: true,
            },
          },
        },
      });

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Jeu non trouvé',
        });
      }

      return game;
    }),

  /**
   * Mettre à jour un jeu
   */
  update: protectedProcedure.input(updateGameSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    const { id, ...data } = input;

    // Vérifier que le jeu appartient à l'utilisateur
    const game = await ctx.prisma.game.findFirst({
      where: {
        id,
        createdBy: userId,
      },
    });

    if (!game) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Jeu non trouvé',
      });
    }

    const updatedGame = await ctx.prisma.game.update({
      where: { id },
      data: data as Parameters<typeof ctx.prisma.game.update>[0]['data'],
    });

    return updatedGame;
  }),

  /**
   * Supprimer un jeu
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      // Vérifier que le jeu appartient à l'utilisateur
      const game = await ctx.prisma.game.findFirst({
        where: {
          id: input.id,
          createdBy: userId,
        },
      });

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Jeu non trouvé',
        });
      }

      await ctx.prisma.game.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
