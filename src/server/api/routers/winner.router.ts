/**
 * Winner Router
 * Routes tRPC pour la gestion des gagnants
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';

export const winnerRouter = createTRPCRouter({
  /**
   * Liste tous les gagnants avec leurs prizes
   * Accessible par les commerçants (filtre par leurs commerces)
   */
  listAll: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(['PENDING', 'CLAIMED', 'EXPIRED']).optional(),
          campaignId: z.string().cuid().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      // Récupérer tous les commerces de l'utilisateur
      const stores = await prisma.store.findMany({
        where: {
          brand: {
            ownerId: ctx.userId,
          },
        },
        select: { id: true },
      });

      const storeIds = stores.map((s) => s.id);

      if (storeIds.length === 0) {
        return [];
      }

      // Récupérer les winners avec leurs prizes et campagnes
      const winners = await prisma.winner.findMany({
        where: {
          prize: {
            campaign: {
              storeId: {
                in: storeIds,
              },
              ...(input?.campaignId ? { id: input.campaignId } : {}),
            },
          },
          ...(input?.status ? { status: input.status } : {}),
        },
        include: {
          prize: {
            include: {
              campaign: {
                include: {
                  store: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return winners.map((winner) => ({
        id: winner.id,
        participantName: winner.participantName,
        participantEmail: winner.participantEmail,
        claimCode: winner.claimCode,
        status: winner.status,
        claimedAt: winner.claimedAt,
        expiresAt: winner.expiresAt,
        createdAt: winner.createdAt,
        prize: {
          id: winner.prize.id,
          name: winner.prize.name,
          description: winner.prize.description,
          value: winner.prize.value,
          color: winner.prize.color,
        },
        campaign: {
          id: winner.prize.campaign.id,
          name: winner.prize.campaign.name,
        },
        store: {
          id: winner.prize.campaign.store.id,
          name: winner.prize.campaign.store.name,
        },
      }));
    }),

  /**
   * Récupère un winner par ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const winner = await prisma.winner.findUnique({
        where: { id: input.id },
        include: {
          prize: {
            include: {
              campaign: {
                include: {
                  store: {
                    include: {
                      brand: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!winner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Gagnant introuvable',
        });
      }

      // Vérifier que l'utilisateur a accès (owner du store)
      if (winner.prize.campaign.store.brand.ownerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas accès à ce gagnant",
        });
      }

      return winner;
    }),

  /**
   * Marque un winner comme réclamé
   */
  markAsClaimed: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le winner existe et que l'utilisateur a accès
      const winner = await prisma.winner.findUnique({
        where: { id: input.id },
        include: {
          prize: {
            include: {
              campaign: {
                include: {
                  store: {
                    include: {
                      brand: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!winner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Gagnant introuvable',
        });
      }

      if (winner.prize.campaign.store.brand.ownerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Vous n'avez pas accès à ce gagnant",
        });
      }

      if (winner.status === 'CLAIMED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce lot a déjà été réclamé',
        });
      }

      if (winner.status === 'EXPIRED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce lot est expiré',
        });
      }

      // Marquer comme réclamé
      const updatedWinner = await prisma.winner.update({
        where: { id: input.id },
        data: {
          status: 'CLAIMED',
          claimedAt: new Date(),
        },
      });

      return updatedWinner;
    }),

  /**
   * Statistiques des gagnants
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Récupérer tous les commerces de l'utilisateur
    const stores = await prisma.store.findMany({
      where: {
        brand: {
          ownerId: ctx.userId,
        },
      },
      select: { id: true },
    });

    const storeIds = stores.map((s) => s.id);

    if (storeIds.length === 0) {
      return {
        total: 0,
        pending: 0,
        claimed: 0,
        expired: 0,
      };
    }

    const [total, pending, claimed, expired] = await Promise.all([
      prisma.winner.count({
        where: {
          prize: {
            campaign: {
              storeId: { in: storeIds },
            },
          },
        },
      }),
      prisma.winner.count({
        where: {
          prize: {
            campaign: {
              storeId: { in: storeIds },
            },
          },
          status: 'PENDING',
        },
      }),
      prisma.winner.count({
        where: {
          prize: {
            campaign: {
              storeId: { in: storeIds },
            },
          },
          status: 'CLAIMED',
        },
      }),
      prisma.winner.count({
        where: {
          prize: {
            campaign: {
              storeId: { in: storeIds },
            },
          },
          status: 'EXPIRED',
        },
      }),
    ]);

    return {
      total,
      pending,
      claimed,
      expired,
    };
  }),
});
