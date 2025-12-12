/**
 * Review Mutations Router
 * Toutes les mutations (écritures) pour les reviews
 * IMPORTANT: ZERO any types
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/infrastructure/database/prisma-client';
import { BrandedTypes, type UserId } from '@/lib/types/branded.type';

// Use Cases
import { RespondToReviewUseCase } from '@/core/use-cases/review/respond-to-review.use-case';
import { GenerateAiResponseUseCase } from '@/core/use-cases/review/generate-ai-response.use-case';
import { SyncReviewsFromGoogleUseCase } from '@/core/use-cases/review/sync-reviews-from-google.use-case';

// Repositories
import { PrismaReviewRepository } from '@/infrastructure/repositories/prisma-review.repository';
import { PrismaResponseTemplateRepository } from '@/infrastructure/repositories/prisma-response-template.repository';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma-store.repository';
import type { IStoreRepository } from '@/core/repositories/store.repository.interface';

// Services
import { GoogleMyBusinessProductionService } from '@/infrastructure/services/google-my-business-production.service';
import { ApiKeyEncryptionService } from '@/infrastructure/encryption/api-key-encryption.service';
import { AiResponseGeneratorService } from '@/infrastructure/services/ai-response-generator.service';

// Instancier les repositories
const reviewRepository = new PrismaReviewRepository(prisma);
const templateRepository = new PrismaResponseTemplateRepository(prisma);
const storeRepository = new PrismaStoreRepository();

// Instancier encryption service
const encryptionService = new ApiKeyEncryptionService();

// Services
const googleService = new GoogleMyBusinessProductionService(encryptionService);
const aiService = new AiResponseGeneratorService(prisma, encryptionService);

// Store repository adapter
const storeRepositoryAdapter = {
  findById: storeRepository.findById.bind(storeRepository),
  findBySlug: storeRepository.findBySlug.bind(storeRepository),
  slugExists: async (slug: string) => {
    const store = await storeRepository.findBySlug(slug);
    return store !== null;
  },
  findByOwner: async (ownerId: UserId) => {
    return await storeRepository.findManyByOwnerId(ownerId as unknown as string);
  },
  findActiveStores: async () => {
    throw new Error('Not implemented');
  },
  save: async () => {
    throw new Error('Not implemented');
  },
  delete: async () => {
    throw new Error('Not implemented');
  },
  countStoreCampaigns: async () => {
    throw new Error('Not implemented');
  },
  isOwner: async () => {
    throw new Error('Not implemented');
  },
  updatePaymentStatus: async () => {
    throw new Error('Not implemented');
  },
  getStoreStats: async () => {
    throw new Error('Not implemented');
  },
} as unknown as IStoreRepository;

// Instancier les use cases
const respondToReviewUseCase = new RespondToReviewUseCase(
  reviewRepository,
  templateRepository,
  googleService,
  storeRepositoryAdapter,
);
const generateAiResponseUseCase = new GenerateAiResponseUseCase(
  reviewRepository,
  aiService,
  storeRepository,
);
const syncReviewsUseCase = new SyncReviewsFromGoogleUseCase(reviewRepository, googleService);

export const reviewMutationsRouter = createTRPCRouter({
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
        reviewId: BrandedTypes.reviewId(input.reviewId),
        userId: ctx.userId,
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
        storeId: BrandedTypes.storeId(input.storeId),
        googlePlaceId: store.googlePlaceId || '',
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
        reviewId: BrandedTypes.reviewId(input.reviewId),
        userId: ctx.userId,
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
          promptTokens: Math.floor(result.data.tokensUsed * 0.4),
          completionTokens: Math.floor(result.data.tokensUsed * 0.6),
          totalTokens: result.data.tokensUsed,
          estimatedCostUsd: result.data.tokensUsed * 0.00003,
          requestType: 'generate_response',
          wasUsed: false,
        },
      });

      return result.data;
    }),
});
