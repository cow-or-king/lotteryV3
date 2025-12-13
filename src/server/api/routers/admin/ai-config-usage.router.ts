/**
 * Admin AI Configuration Usage Router
 * Gestion des statistiques d'usage IA
 * IMPORTANT: ZERO any types, Architecture Hexagonale
 */

import { z } from 'zod';
import { createTRPCRouter, superAdminProcedure } from '../../trpc';
import { prisma } from '@/infrastructure/database/prisma-client';

/**
 * Router pour les statistiques d'usage IA
 */
export const aiConfigUsageRouter = createTRPCRouter({
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
});
