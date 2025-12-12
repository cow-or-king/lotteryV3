/**
 * Game Router
 * Routes tRPC pour la gestion des jeux
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import type { GameType, GameStatus } from '@prisma/client';

// Validation schemas
const createGameSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: z.enum([
    'WHEEL',
    'SCRATCH',
    'SLOT_MACHINE',
    'MEMORY',
    'SHAKE',
    'WHEEL_MINI',
    'DICE',
    'MYSTERY_BOX',
  ]),
  config: z.record(z.unknown()), // JSON config flexible selon le type de jeu
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  vibrationEnabled: z.boolean().default(true),
  active: z.boolean().default(true),
});

const updateGameSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).optional(),
  config: z.record(z.unknown()).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  vibrationEnabled: z.boolean().optional(),
  active: z.boolean().optional(),
});

const recordGamePlaySchema = z.object({
  gameId: z.string().cuid(),
  result: z.record(z.unknown()), // Résultat flexible selon le type de jeu
  prizeWon: z.boolean(),
  prizeValue: z.string().optional(),
});

export const gameRouter = createTRPCRouter({
  /**
   * Créer un nouveau jeu
   */
  create: protectedProcedure.input(createGameSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    const game = await ctx.db.game.create({
      data: {
        ...input,
        userId,
      },
    });

    return game;
  }),

  /**
   * Récupérer tous les jeux de l'utilisateur
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const games = await ctx.db.game.findMany({
      where: {
        userId,
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
      const userId = ctx.session.user.id;

      const game = await ctx.db.game.findFirst({
        where: {
          id: input.id,
          userId,
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
    const userId = ctx.session.user.id;
    const { id, ...data } = input;

    // Vérifier que le jeu appartient à l'utilisateur
    const game = await ctx.db.game.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!game) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Jeu non trouvé',
      });
    }

    const updatedGame = await ctx.db.game.update({
      where: { id },
      data,
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
      const userId = ctx.session.user.id;

      // Vérifier que le jeu appartient à l'utilisateur
      const game = await ctx.db.game.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Jeu non trouvé',
        });
      }

      await ctx.db.game.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Enregistrer une partie jouée
   */
  recordPlay: protectedProcedure.input(recordGamePlaySchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Vérifier que le jeu appartient à l'utilisateur
    const game = await ctx.db.game.findFirst({
      where: {
        id: input.gameId,
        userId,
      },
    });

    if (!game) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Jeu non trouvé',
      });
    }

    const gamePlay = await ctx.db.gamePlay.create({
      data: {
        gameId: input.gameId,
        result: input.result,
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
      const userId = ctx.session.user.id;

      // Vérifier que le jeu appartient à l'utilisateur
      const game = await ctx.db.game.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!game) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Jeu non trouvé',
        });
      }

      // Statistiques globales
      const totalPlays = await ctx.db.gamePlay.count({
        where: { gameId: input.id },
      });

      const totalWins = await ctx.db.gamePlay.count({
        where: {
          gameId: input.id,
          prizeWon: true,
        },
      });

      // Parties récentes
      const recentPlays = await ctx.db.gamePlay.findMany({
        where: { gameId: input.id },
        orderBy: { playedAt: 'desc' },
        take: 10,
      });

      // Distribution des gains (derniers 30 jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyStats = await ctx.db.gamePlay.groupBy({
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
      const game = await ctx.db.game.findFirst({
        where: {
          id: input.id,
          active: true,
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
