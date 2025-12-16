/**
 * Game Play Router
 * Routes tRPC pour l'enregistrement des parties et les statistiques
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { recordGamePlaySchema } from './game-schemas';

export const gamePlayRouter = createTRPCRouter({
  /**
   * Enregistrer une partie jouée
   */
  recordPlay: protectedProcedure.input(recordGamePlaySchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;

    // Vérifier que le jeu appartient à l'utilisateur
    const game = await ctx.prisma.game.findFirst({
      where: {
        id: input.gameId,
        createdBy: userId,
      },
    });

    if (!game) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Jeu non trouvé',
      });
    }

    const gamePlay = await ctx.prisma.gamePlay.create({
      data: {
        gameId: input.gameId,
        result: input.result as Parameters<typeof ctx.prisma.gamePlay.create>[0]['data']['result'],
        prizeWon: input.prizeWon,
        prizeValue: input.prizeValue,
      },
    });

    return gamePlay;
  }),

  /**
   * Récupérer les statistiques d'un jeu
   */
  getStats: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
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

      // Statistiques globales
      const totalPlays = await ctx.prisma.gamePlay.count({
        where: { gameId: input.id },
      });

      const totalWins = await ctx.prisma.gamePlay.count({
        where: {
          gameId: input.id,
          prizeWon: { not: null },
        },
      });

      // Parties récentes
      const recentPlays = await ctx.prisma.gamePlay.findMany({
        where: { gameId: input.id },
        orderBy: { playedAt: 'desc' },
        take: 10,
      });

      // Distribution des gains (derniers 30 jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyStats = await ctx.prisma.gamePlay.groupBy({
        by: ['playedAt'],
        where: {
          gameId: input.id,
          playedAt: {
            gte: thirtyDaysAgo,
          },
        },
        _count: {
          id: true,
        },
      });

      return {
        totalPlays,
        totalWins,
        winRate: totalPlays > 0 ? (totalWins / totalPlays) * 100 : 0,
        recentPlays,
        dailyStats,
      };
    }),

  /**
   * Récupérer un jeu par ID (version publique pour les joueurs)
   */
  getPublicGame: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const game = await ctx.prisma.game.findFirst({
        where: {
          id: input.id,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          type: true,
          config: true,
          primaryColor: true,
          secondaryColor: true,
          vibrationEnabled: true,
        },
      });

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Jeu non trouvé ou inactif',
        });
      }

      return game;
    }),
});
