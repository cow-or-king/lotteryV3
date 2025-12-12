/**
 * Review Queries Router
 * Toutes les queries (lectures) pour les reviews
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { BrandedTypes } from '@/lib/types/branded.type';

// Use Cases
import { VerifyReviewParticipantUseCase } from '@/core/use-cases/review/verify-review-participant.use-case';
import { GetReviewByIdUseCase } from '@/core/use-cases/review/get-review-by-id.use-case';
import { ListReviewsByStoreUseCase } from '@/core/use-cases/review/list-reviews-by-store.use-case';
import { GetReviewStatsUseCase } from '@/core/use-cases/review/get-review-stats.use-case';

// Repositories
import { PrismaReviewRepository } from '@/infrastructure/repositories/prisma-review.repository';
import { prisma } from '@/infrastructure/database/prisma-client';

// Services
import { AiResponseGeneratorService } from '@/infrastructure/services/ai-response-generator.service';
import { ApiKeyEncryptionService } from '@/infrastructure/encryption/api-key-encryption.service';

// Instancier repositories & services
const reviewRepository = new PrismaReviewRepository(prisma);
const encryptionService = new ApiKeyEncryptionService();
const aiService = new AiResponseGeneratorService(prisma, encryptionService);

// Instancier use cases
const verifyParticipantUseCase = new VerifyReviewParticipantUseCase(reviewRepository);
const getReviewByIdUseCase = new GetReviewByIdUseCase(reviewRepository);
const listReviewsByStoreUseCase = new ListReviewsByStoreUseCase(reviewRepository);
const getReviewStatsUseCase = new GetReviewStatsUseCase(reviewRepository);

export const reviewQueriesRouter = createTRPCRouter({
  /**
   * Vérifie si un participant a laissé un avis pour pouvoir participer à la loterie
   */
  verifyParticipant: protectedProcedure
    .input(
      z.object({
        email: z.string().email('Email invalide'),
        storeId: z.string(),
        campaignId: z.string(),
        participantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const result = await verifyParticipantUseCase.execute({
        email: input.email,
        storeId: BrandedTypes.storeId(input.storeId),
        campaignId: BrandedTypes.campaignId(input.campaignId),
        participantId: BrandedTypes.participantId(input.participantId),
      });

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Récupère un avis par son ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const result = await getReviewByIdUseCase.execute({
        reviewId: BrandedTypes.reviewId(input.reviewId),
      });

      if (!result.success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Liste les avis d'un commerce avec filtres et pagination
   */
  listByStore: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        filters: z
          .object({
            campaignId: z.string().optional(),
            rating: z.number().int().min(1).max(5).optional(),
            hasResponse: z.boolean().optional(),
            isVerified: z.boolean().optional(),
            status: z.enum(['PENDING', 'PROCESSED', 'ARCHIVED']).optional(),
            fromDate: z.date().optional(),
            toDate: z.date().optional(),
          })
          .optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      const result = await listReviewsByStoreUseCase.execute({
        storeId: BrandedTypes.storeId(input.storeId),
        filters: input.filters
          ? {
              ...input.filters,
              campaignId: input.filters.campaignId
                ? BrandedTypes.campaignId(input.filters.campaignId)
                : undefined,
            }
          : undefined,
        limit: input.limit,
        offset: input.offset,
      });

      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Récupère les statistiques des avis d'un commerce
   */
  getStats: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        filters: z
          .object({
            campaignId: z.string().optional(),
            rating: z.number().int().min(1).max(5).optional(),
            hasResponse: z.boolean().optional(),
            isVerified: z.boolean().optional(),
            status: z.enum(['PENDING', 'PROCESSED', 'ARCHIVED']).optional(),
            fromDate: z.date().optional(),
            toDate: z.date().optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ input }) => {
      const result = await getReviewStatsUseCase.execute({
        storeId: BrandedTypes.storeId(input.storeId),
        filters: input.filters
          ? {
              ...input.filters,
              campaignId: input.filters.campaignId
                ? BrandedTypes.campaignId(input.filters.campaignId)
                : undefined,
            }
          : undefined,
      });

      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Vérifie si le service IA est disponible (endpoint public)
   * Permet au frontend d'afficher ou masquer les fonctionnalités IA
   */
  getAiServiceStatus: protectedProcedure.query(async () => {
    const isAvailable = await aiService.isAvailable();
    const activeProvider = await aiService.getActiveProvider();

    return {
      isAvailable,
      provider: activeProvider,
    };
  }),
});
