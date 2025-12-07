/**
 * Dashboard Router
 * Routes tRPC pour les statistiques du dashboard
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '@/infrastructure/database/prisma-client';

export const dashboardRouter = createTRPCRouter({
  /**
   * Récupère les statistiques globales du dashboard
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Récupérer toutes les stats en parallèle
    const [storesCount, campaignsCount, participantsCount, activeStoresCount] = await Promise.all([
      // Nombre total de stores (via Brand)
      prisma.store.count({
        where: {
          brand: {
            ownerId: userId,
          },
        },
      }),

      // Nombre total de campagnes (via Brand)
      prisma.campaign.count({
        where: {
          store: {
            brand: {
              ownerId: userId,
            },
          },
        },
      }),

      // Nombre total de participants (via Brand)
      prisma.participant.count({
        where: {
          campaign: {
            store: {
              brand: {
                ownerId: userId,
              },
            },
          },
        },
      }),

      // Nombre de stores actifs (avec au moins une campagne active)
      prisma.store.count({
        where: {
          brand: {
            ownerId: userId,
          },
          campaigns: {
            some: {
              isActive: true,
            },
          },
        },
      }),
    ]);

    // Calculer les campagnes actives
    const activeCampaignsCount = await prisma.campaign.count({
      where: {
        store: {
          brand: {
            ownerId: userId,
          },
        },
        isActive: true,
      },
    });

    return {
      stores: {
        total: storesCount,
        active: activeStoresCount,
      },
      campaigns: {
        total: campaignsCount,
        active: activeCampaignsCount,
      },
      participants: {
        total: participantsCount,
      },
    };
  }),

  /**
   * Récupère les statistiques détaillées pour les graphiques
   */
  getDetailedStats: protectedProcedure
    .input(
      z.object({
        period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Calculer la date de début selon la période
      const now = new Date();
      const startDate = new Date();

      switch (input.period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Récupérer les participants par jour
      const participants = await prisma.participant.findMany({
        where: {
          campaign: {
            store: {
              brand: {
                ownerId: userId,
              },
            },
          },
          participatedAt: {
            gte: startDate,
          },
        },
        select: {
          participatedAt: true,
          hasWon: true,
        },
        orderBy: {
          participatedAt: 'asc',
        },
      });

      return {
        participants,
        period: input.period,
      };
    }),
});
