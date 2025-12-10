/**
 * Admin Router
 * Routes tRPC pour la gestion super-admin
 * IMPORTANT: ZERO any types, Architecture Hexagonale
 */

import { z } from 'zod';
import { createTRPCRouter, superAdminProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';
import { ApiKeyEncryptionService } from '@/infrastructure/encryption/api-key-encryption.service';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const encryptionService = new ApiKeyEncryptionService();

export const adminRouter = createTRPCRouter({
  /**
   * Liste toutes les configurations IA
   * Accessible uniquement par super-admin
   */
  listAiConfigs: superAdminProcedure.query(async () => {
    const configs = await prisma.aiServiceConfig.findMany({
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    // Masquer les clés API (ne montrer que les 4 derniers caractères)
    return configs.map((config) => ({
      ...config,
      apiKey: `***${config.apiKey.slice(-4)}`,
    }));
  }),

  /**
   * Récupère une configuration par ID
   */
  getAiConfigById: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const config = await prisma.aiServiceConfig.findUnique({
        where: { id: input.id },
      });

      if (!config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Configuration not found',
        });
      }

      // Masquer la clé API
      return {
        ...config,
        apiKey: `***${config.apiKey.slice(-4)}`,
      };
    }),

  /**
   * Crée une nouvelle configuration IA
   */
  createAiConfig: superAdminProcedure
    .input(
      z.object({
        provider: z.enum(['openai', 'anthropic']),
        apiKey: z.string().min(10, 'API key too short'),
        model: z.string().min(1, 'Model is required'),
        maxTokens: z.number().int().min(100).max(4000).default(1000),
        temperature: z.number().min(0).max(2).default(0.7),
        systemPrompt: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Chiffrer l'API key
      const encryptResult = encryptionService.encrypt(input.apiKey);
      if (!encryptResult.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to encrypt API key',
        });
      }

      // Créer la configuration
      const config = await prisma.aiServiceConfig.create({
        data: {
          provider: input.provider,
          apiKey: encryptResult.data,
          model: input.model,
          maxTokens: input.maxTokens,
          temperature: input.temperature,
          systemPrompt: input.systemPrompt || null,
          isActive: false, // Nouvelle config inactive par défaut
          apiKeyStatus: 'active',
          totalRequestsCount: 0,
          totalTokensUsed: 0,
        },
      });

      return {
        ...config,
        apiKey: `***${config.apiKey.slice(-4)}`,
      };
    }),

  /**
   * Met à jour une configuration existante
   */
  updateAiConfig: superAdminProcedure
    .input(
      z.object({
        id: z.string(),
        apiKey: z.string().min(10).optional(),
        model: z.string().min(1).optional(),
        maxTokens: z.number().int().min(100).max(4000).optional(),
        temperature: z.number().min(0).max(2).optional(),
        systemPrompt: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, apiKey, ...rest } = input;

      // Vérifier que la config existe
      const existing = await prisma.aiServiceConfig.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Configuration not found',
        });
      }

      // Si nouvelle API key, la chiffrer
      let encryptedApiKey: string | undefined;
      if (apiKey) {
        const encryptResult = encryptionService.encrypt(apiKey);
        if (!encryptResult.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to encrypt API key',
          });
        }
        encryptedApiKey = encryptResult.data;
      }

      // Mettre à jour
      const updated = await prisma.aiServiceConfig.update({
        where: { id },
        data: {
          ...(encryptedApiKey && { apiKey: encryptedApiKey }),
          ...rest,
        },
      });

      return {
        ...updated,
        apiKey: `***${updated.apiKey.slice(-4)}`,
      };
    }),

  /**
   * Active une configuration (désactive toutes les autres)
   */
  activateAiConfig: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const config = await prisma.aiServiceConfig.findUnique({
        where: { id: input.id },
      });

      if (!config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Configuration not found',
        });
      }

      // Désactiver toutes les autres configs
      await prisma.aiServiceConfig.updateMany({
        where: { id: { not: input.id } },
        data: { isActive: false },
      });

      // Activer celle-ci
      const activated = await prisma.aiServiceConfig.update({
        where: { id: input.id },
        data: { isActive: true },
      });

      return {
        ...activated,
        apiKey: `***${activated.apiKey.slice(-4)}`,
      };
    }),

  /**
   * Désactive une configuration
   */
  deactivateAiConfig: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const deactivated = await prisma.aiServiceConfig.update({
        where: { id: input.id },
        data: { isActive: false },
      });

      return {
        ...deactivated,
        apiKey: `***${deactivated.apiKey.slice(-4)}`,
      };
    }),

  /**
   * Supprime une configuration
   */
  deleteAiConfig: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.aiServiceConfig.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Teste la connexion avec un provider IA
   */
  testAiConnection: superAdminProcedure
    .input(
      z.object({
        provider: z.enum(['openai', 'anthropic']),
        apiKey: z.string().min(10),
        model: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        if (input.provider === 'openai') {
          const client = new OpenAI({ apiKey: input.apiKey });
          // Test simple avec une completion
          const completion = await client.chat.completions.create({
            model: input.model,
            messages: [{ role: 'user', content: 'Test connection' }],
            max_tokens: 10,
          });

          return {
            success: true,
            provider: 'openai',
            model: input.model,
            message: 'Connection successful',
            tokensUsed: completion.usage?.total_tokens || 0,
          };
        } else if (input.provider === 'anthropic') {
          const client = new Anthropic({ apiKey: input.apiKey });
          // Test simple avec un message
          const message = await client.messages.create({
            model: input.model,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Test connection' }],
          });

          return {
            success: true,
            provider: 'anthropic',
            model: input.model,
            message: 'Connection successful',
            tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
          };
        }

        throw new Error('Unsupported provider');
      } catch (error) {
        const err = error as Error;
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Connection failed: ${err.message}`,
        });
      }
    }),

  /**
   * Récupère les statistiques d'usage IA
   */
  getAiUsageStats: superAdminProcedure
    .input(
      z.object({
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
      }),
    )
    .query(async ({ input }) => {
      const where = {
        ...(input.fromDate && { createdAt: { gte: input.fromDate } }),
        ...(input.toDate && { createdAt: { lte: input.toDate } }),
      };

      const [totalLogs, usedLogs, totalTokens, totalCost] = await Promise.all([
        // Total de requêtes
        prisma.aiUsageLog.count({ where }),
        // Requêtes réellement utilisées
        prisma.aiUsageLog.count({ where: { ...where, wasUsed: true } }),
        // Total de tokens
        prisma.aiUsageLog.aggregate({
          where,
          _sum: { totalTokens: true },
        }),
        // Coût total estimé
        prisma.aiUsageLog.aggregate({
          where,
          _sum: { estimatedCostUsd: true },
        }),
      ]);

      // Stats par provider
      const byProvider = await prisma.aiUsageLog.groupBy({
        by: ['provider'],
        where,
        _count: true,
        _sum: {
          totalTokens: true,
          estimatedCostUsd: true,
        },
      });

      return {
        totalRequests: totalLogs,
        usedRequests: usedLogs,
        totalTokens: totalTokens._sum.totalTokens || 0,
        totalCostUsd: totalCost._sum.estimatedCostUsd || 0,
        byProvider: byProvider.map((p) => ({
          provider: p.provider,
          requests: p._count,
          tokens: p._sum.totalTokens || 0,
          costUsd: p._sum.estimatedCostUsd || 0,
        })),
      };
    }),

  /**
   * Récupère les statistiques globales de la plateforme
   * Accessible uniquement aux SUPER_ADMIN
   */
  getPlatformStats: superAdminProcedure.query(async () => {
    // Stats utilisateurs
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
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
                { fullName: { contains: input.search, mode: 'insensitive' as const } },
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
            fullName: true,
            role: true,
            createdAt: true,
            lastLoginAt: true,
            _count: {
              select: {
                stores: true,
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
          const storesCount = client._count.stores;

          // Stats reviews pour ce client
          const reviewsCount = await prisma.review.count({
            where: {
              store: {
                ownerId: client.id,
              },
            },
          });

          const reviewsWithResponseCount = await prisma.review.count({
            where: {
              store: {
                ownerId: client.id,
              },
              hasResponse: true,
            },
          });

          return {
            id: client.id,
            email: client.email,
            fullName: client.fullName,
            role: client.role,
            createdAt: client.createdAt,
            lastLoginAt: client.lastLoginAt,
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
      });

      if (!client) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Client non trouvé',
        });
      }

      // Stats reviews globales du client
      const reviewsStats = await prisma.review.aggregate({
        where: {
          store: {
            ownerId: client.id,
          },
        },
        _count: { id: true },
        _avg: { rating: true },
      });

      const reviewsWithResponse = await prisma.review.count({
        where: {
          store: {
            ownerId: client.id,
          },
          hasResponse: true,
        },
      });

      return {
        id: client.id,
        email: client.email,
        fullName: client.fullName,
        role: client.role,
        createdAt: client.createdAt,
        lastLoginAt: client.lastLoginAt,
        stores: client.stores.map((store) => ({
          id: store.id,
          name: store.name,
          isActive: store.isActive,
          googleApiKeyStatus: store.googleApiKeyStatus,
          createdAt: store.createdAt,
          reviewsCount: store._count.reviews,
        })),
        stats: {
          totalStores: client.stores.length,
          activeStores: client.stores.filter((s) => s.isActive).length,
          totalReviews: reviewsStats._count.id,
          reviewsWithResponse,
          responseRate:
            reviewsStats._count.id > 0 ? (reviewsWithResponse / reviewsStats._count.id) * 100 : 0,
          averageRating: reviewsStats._avg.rating ?? 0,
        },
      };
    }),
});
