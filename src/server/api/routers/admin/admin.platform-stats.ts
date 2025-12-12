/**
 * Admin Platform Statistics Router
 * Statistiques globales de la plateforme et gestion des clients
 * IMPORTANT: ZERO any types, Architecture Hexagonale
 */

import { z } from 'zod';
import { createTRPCRouter, superAdminProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';

/**
 * Router pour les statistiques plateforme et gestion clients
 */
export const adminPlatformStatsRouter = createTRPCRouter({
  /**
   * Récupère les statistiques globales de la plateforme
   * Accessible uniquement aux SUPER_ADMIN
   */
  getPlatformStats: superAdminProcedure.query(async () => {
    // Stats utilisateurs
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
        },
      },
    });
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    // Stats commerces
    const totalStores = await prisma.store.count();
    const activeStores = await prisma.store.count({
      where: { isActive: true },
    });
    const storesWithGoogleApi = await prisma.store.count({
      where: {
        googleApiKeyStatus: 'configured',
      },
    });

    // Stats avis
    const totalReviews = await prisma.review.count();
    const reviewsWithResponse = await prisma.review.count({
      where: { hasResponse: true },
    });
    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });

    // Stats IA
    const aiStats = await prisma.aiUsageLog.aggregate({
      _count: { id: true },
      _sum: {
        totalTokens: true,
        estimatedCostUsd: true,
      },
    });

    const aiConfigsCount = await prisma.aiServiceConfig.count();
    const activeAiConfig = await prisma.aiServiceConfig.findFirst({
      where: { isActive: true },
      select: { provider: true, model: true },
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: usersByRole.map((r) => ({
          role: r.role,
          count: r._count.id,
        })),
      },
      stores: {
        total: totalStores,
        active: activeStores,
        withGoogleApi: storesWithGoogleApi,
        apiConfigurationRate: totalStores > 0 ? (storesWithGoogleApi / totalStores) * 100 : 0,
      },
      reviews: {
        total: totalReviews,
        withResponse: reviewsWithResponse,
        responseRate: totalReviews > 0 ? (reviewsWithResponse / totalReviews) * 100 : 0,
        averageRating: avgRating._avg.rating ?? 0,
      },
      ai: {
        totalRequests: aiStats._count.id,
        totalTokens: aiStats._sum.totalTokens ?? 0,
        totalCostUsd: aiStats._sum.estimatedCostUsd ?? 0,
        configsCount: aiConfigsCount,
        activeProvider: activeAiConfig?.provider ?? null,
        activeModel: activeAiConfig?.model ?? null,
      },
    };
  }),

  /**
   * Liste tous les clients (utilisateurs ADMIN) avec leurs stats
   * Accessible uniquement aux SUPER_ADMIN
   */
  listClients: superAdminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const where = {
        role: 'ADMIN' as const,
        ...(input.search
          ? {
              OR: [
                { email: { contains: input.search, mode: 'insensitive' as const } },
                { name: { contains: input.search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      };

      const [clients, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            brands: {
              select: {
                stores: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.user.count({ where }),
      ]);

      // Enrichir avec les stats de chaque client
      const enrichedClients = await Promise.all(
        clients.map(async (client) => {
          const storesCount = client.brands.reduce((acc, brand) => acc + brand.stores.length, 0);

          // Stats reviews pour ce client
          const reviewsCount = await prisma.review.count({
            where: {
              store: {
                brand: {
                  ownerId: client.id,
                },
              },
            },
          });

          const reviewsWithResponseCount = await prisma.review.count({
            where: {
              store: {
                brand: {
                  ownerId: client.id,
                },
              },
              hasResponse: true,
            },
          });

          return {
            id: client.id,
            email: client.email,
            name: client.name,
            role: client.role,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            storesCount,
            reviewsCount,
            reviewsWithResponseCount,
            responseRate: reviewsCount > 0 ? (reviewsWithResponseCount / reviewsCount) * 100 : 0,
          };
        }),
      );

      return {
        clients: enrichedClients,
        totalCount,
        hasMore: input.offset + input.limit < totalCount,
      };
    }),

  /**
   * Récupère les détails d'un client spécifique avec toutes ses stats
   * Accessible uniquement aux SUPER_ADMIN
   */
  getClientDetails: superAdminProcedure
    .input(
      z.object({
        clientId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const client = await prisma.user.findUnique({
        where: { id: input.clientId },
        include: {
          brands: {
            include: {
              stores: {
                select: {
                  id: true,
                  name: true,
                  isActive: true,
                  googleApiKeyStatus: true,
                  createdAt: true,
                  _count: {
                    select: {
                      reviews: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!client) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Client non trouvé',
        });
      }

      // Flatten stores from all brands
      const allStores = client.brands.flatMap((brand) => brand.stores);

      // Stats reviews globales du client
      const reviewsStats = await prisma.review.aggregate({
        where: {
          store: {
            brand: {
              ownerId: client.id,
            },
          },
        },
        _count: { id: true },
        _avg: { rating: true },
      });

      const reviewsWithResponse = await prisma.review.count({
        where: {
          store: {
            brand: {
              ownerId: client.id,
            },
          },
          hasResponse: true,
        },
      });

      return {
        id: client.id,
        email: client.email,
        name: client.name,
        role: client.role,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        stores: allStores.map((store) => ({
          id: store.id,
          name: store.name,
          isActive: store.isActive,
          googleApiKeyStatus: store.googleApiKeyStatus,
          createdAt: store.createdAt,
          reviewsCount: store._count.reviews,
        })),
        stats: {
          totalStores: allStores.length,
          activeStores: allStores.filter((s) => s.isActive).length,
          totalReviews: reviewsStats._count?.id ?? 0,
          reviewsWithResponse,
          responseRate:
            (reviewsStats._count?.id ?? 0) > 0
              ? (reviewsWithResponse / (reviewsStats._count?.id ?? 0)) * 100
              : 0,
          averageRating: reviewsStats._avg?.rating ?? 0,
        },
      };
    }),
});
