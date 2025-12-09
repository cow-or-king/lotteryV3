/**
 * Review Router
 * Routes tRPC pour la gestion des avis Google
 * IMPORTANT: ZERO any types
 * Architecture Hexagonale: Router → Use Cases → Repositories
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';

// Use Cases
import { VerifyReviewParticipantUseCase } from '@/core/use-cases/review/verify-review-participant.use-case';
import { RespondToReviewUseCase } from '@/core/use-cases/review/respond-to-review.use-case';
import { GenerateAiResponseUseCase } from '@/core/use-cases/review/generate-ai-response.use-case';
import { SyncReviewsFromGoogleUseCase } from '@/core/use-cases/review/sync-reviews-from-google.use-case';
import { GetReviewByIdUseCase } from '@/core/use-cases/review/get-review-by-id.use-case';
import { ListReviewsByStoreUseCase } from '@/core/use-cases/review/list-reviews-by-store.use-case';
import { GetReviewStatsUseCase } from '@/core/use-cases/review/get-review-stats.use-case';

// Repositories (Adapters)
import { PrismaReviewRepository } from '@/infrastructure/repositories/prisma-review.repository';
import { PrismaResponseTemplateRepository } from '@/infrastructure/repositories/prisma-response-template.repository';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma-store.repository';

// Services
import { GoogleMyBusinessService } from '@/infrastructure/services/google-my-business.service';
import { GoogleMyBusinessMockService } from '@/infrastructure/services/google-my-business-mock.service';
import { ApiKeyEncryptionService } from '@/infrastructure/encryption/api-key-encryption.service';
import { AiResponseGeneratorService } from '@/infrastructure/services/ai-response-generator.service';

// Instancier les repositories
const reviewRepository = new PrismaReviewRepository(prisma);
const templateRepository = new PrismaResponseTemplateRepository(prisma);
const storeRepository = new PrismaStoreRepository();

// En dev: utiliser le mock service avec fake reviews
// En prod: utiliser le vrai service (quand Google API keys configurées)
const useMockService = process.env.USE_MOCK_GOOGLE_SERVICE === 'true';
const googleService = useMockService
  ? new GoogleMyBusinessMockService()
  : new GoogleMyBusinessService();

if (useMockService) {
  console.log('[INFO] Using MOCK Google My Business service with fake reviews');
}

const encryptionService = new ApiKeyEncryptionService();
const aiService = new AiResponseGeneratorService(prisma, encryptionService);

// Instancier les use cases
const verifyParticipantUseCase = new VerifyReviewParticipantUseCase(reviewRepository);
const respondToReviewUseCase = new RespondToReviewUseCase(
  reviewRepository,
  templateRepository,
  googleService,
  encryptionService,
  storeRepository,
);
const generateAiResponseUseCase = new GenerateAiResponseUseCase(reviewRepository, aiService);
const syncReviewsUseCase = new SyncReviewsFromGoogleUseCase(
  reviewRepository,
  googleService,
  storeRepository,
);
const getReviewByIdUseCase = new GetReviewByIdUseCase(reviewRepository);
const listReviewsByStoreUseCase = new ListReviewsByStoreUseCase(reviewRepository, storeRepository);
const getReviewStatsUseCase = new GetReviewStatsUseCase(reviewRepository, storeRepository);

export const reviewRouter = createTRPCRouter({
  /**
   * Vérifie si un participant a laissé un avis pour pouvoir participer à la loterie
   */
  verifyParticipant: protectedProcedure
    .input(
      z.object({
        email: z.string().email('Email invalide'),
        storeId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const result = await verifyParticipantUseCase.execute({
        email: input.email,
        storeId: input.storeId as string & { readonly __brand: unique symbol },
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
   * Répond à un avis Google
   */
  respond: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        responseContent: z.string().min(10, 'La réponse doit contenir au moins 10 caractères'),
        templateId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await respondToReviewUseCase.execute({
        reviewId: input.reviewId as string & { readonly __brand: unique symbol },
        responseContent: input.responseContent,
        templateId: input.templateId,
      });

      if (!result.success) {
        const errorMessage = result.error.message;

        if (errorMessage.includes('not found') || errorMessage.includes('non trouvé')) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: errorMessage,
          });
        }

        if (errorMessage.includes('already responded') || errorMessage.includes('déjà répondu')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: errorMessage,
          });
        }

        if (errorMessage.includes('API key') || errorMessage.includes('credentials')) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: errorMessage,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
        });
      }

      return result.data;
    }),

  /**
   * Synchronise les avis depuis Google My Business
   */
  sync: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Vérifier que le store appartient à l'utilisateur
      const store = await prisma.store.findUnique({
        where: { id: input.storeId },
        include: {
          brand: true,
        },
      });

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found',
        });
      }

      if (store.brand.ownerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this store',
        });
      }

      const result = await syncReviewsUseCase.execute({
        storeId: input.storeId as string & { readonly __brand: unique symbol },
        googlePlaceId: store.googlePlaceId,
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
        reviewId: input.reviewId as string & { readonly __brand: unique symbol },
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
    .query(async ({ ctx, input }) => {
      const result = await listReviewsByStoreUseCase.execute(
        {
          storeId: input.storeId as string & { readonly __brand: unique symbol },
          filters: input.filters,
          limit: input.limit,
          offset: input.offset,
        },
        ctx.user.id,
      );

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
    .query(async ({ ctx, input }) => {
      const result = await getReviewStatsUseCase.execute(
        {
          storeId: input.storeId as string & { readonly __brand: unique symbol },
          filters: input.filters,
        },
        ctx.user.id,
      );

      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error.message,
        });
      }

      return result.data;
    }),

  /**
   * Génère une suggestion de réponse IA pour un avis
   */
  generateAiResponse: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        tone: z.enum(['professional', 'friendly', 'apologetic']).optional(),
        language: z.enum(['fr', 'en']).optional(),
        includeEmojis: z.boolean().optional().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await generateAiResponseUseCase.execute({
        reviewId: input.reviewId as string & { readonly __brand: unique symbol },
        userId: ctx.user.id as string & { readonly __brand: unique symbol },
        tone: input.tone,
        language: input.language,
        includeEmojis: input.includeEmojis,
      });

      if (!result.success) {
        const errorMessage = result.error.message;

        if (errorMessage.includes('not found')) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: errorMessage,
          });
        }

        if (errorMessage.includes('not available') || errorMessage.includes('not configured')) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: "Le service IA n'est pas configuré. Contactez l'administrateur.",
          });
        }

        if (errorMessage.includes('quota')) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Quota IA dépassé pour ce mois.',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
        });
      }

      // Logger l'usage IA pour facturation
      await prisma.aiUsageLog.create({
        data: {
          userId: ctx.user.id,
          reviewId: input.reviewId,
          provider: result.data.provider,
          model: result.data.model,
          promptTokens: Math.floor(result.data.tokensUsed * 0.4), // Estimation
          completionTokens: Math.floor(result.data.tokensUsed * 0.6),
          totalTokens: result.data.tokensUsed,
          estimatedCostUsd: result.data.tokensUsed * 0.00003, // ~$0.03 per 1K tokens
          requestType: 'generate_response',
          wasUsed: false, // Sera mis à true si l'utilisateur utilise la suggestion
        },
      });

      return result.data;
    }),
});
