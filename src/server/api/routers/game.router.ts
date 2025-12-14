/**
 * Game Router
 * Routes tRPC pour la gestion des jeux
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

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
  config: z.record(z.string(), z.unknown()), // JSON config flexible selon le type de jeu
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  vibrationEnabled: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

const updateGameSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  vibrationEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const recordGamePlaySchema = z.object({
  gameId: z.string().cuid(),
  result: z.record(z.string(), z.unknown()), // Résultat flexible selon le type de jeu
  prizeWon: z.string().optional(),
  prizeValue: z.number().optional(),
});

export const gameRouter = createTRPCRouter({
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

  /**
   * Sauvegarder un design de machine à sous
   */
  saveSlotMachineDesign: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Le nom est requis'),
        design: z.object({
          reelsCount: z.number().min(3).max(5),
          symbolsPerReel: z.number().min(1),
          backgroundColor: z.string(),
          reelBorderColor: z.string(),
          symbols: z.array(
            z.object({
              id: z.string(),
              icon: z.string(),
              value: z.number(),
              color: z.string(),
            }),
          ),
          winPatterns: z.array(
            z.object({
              id: z.string(),
              matchCount: z.union([z.literal(2), z.literal(3)]),
              symbol: z.string(),
              multiplier: z.number(),
              probability: z.number(),
              label: z.string(),
            }),
          ),
          spinDuration: z.number(),
          spinEasing: z.enum(['LINEAR', 'EASE_OUT', 'BOUNCE']),
          reelDelay: z.number(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const game = await ctx.prisma.game.create({
        data: {
          name: input.name,
          type: 'SLOT_MACHINE',
          config: input.design as Parameters<typeof ctx.prisma.game.create>[0]['data']['config'],
          primaryColor: input.design.backgroundColor,
          secondaryColor: input.design.reelBorderColor,
          vibrationEnabled: true,
          isActive: true,
          createdBy: userId,
        },
      });

      return game;
    }),

  /**
   * Sauvegarder un design de roue rapide (wheel mini)
   */
  saveWheelMiniDesign: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Le nom est requis'),
        design: z.object({
          segments: z.union([z.literal(4), z.literal(6), z.literal(8)]),
          colors: z.array(z.string()).min(2).max(2),
          style: z.enum(['FLAT', 'GRADIENT']),
          spinDuration: z.number().min(1000).max(4000),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const game = await ctx.prisma.game.create({
        data: {
          name: input.name,
          type: 'WHEEL_MINI',
          config: input.design as Parameters<typeof ctx.prisma.game.create>[0]['data']['config'],
          primaryColor: input.design.colors[0] || '#8B5CF6',
          secondaryColor: input.design.colors[1] || '#EC4899',
          vibrationEnabled: true,
          isActive: true,
          createdBy: userId,
        },
      });

      return game;
    }),
});
