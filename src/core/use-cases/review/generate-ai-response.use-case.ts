/**
 * Generate AI Response Use Case
 * Génère une réponse suggérée par IA pour un avis Google
 * IMPORTANT: Pure business logic, architecture hexagonale
 */

import { Result } from '@/lib/types/result.type';
import { IReviewRepository } from '@/core/repositories/review.repository.interface';
import {
  IAiResponseGeneratorService,
  GenerateResponseOutput,
} from '@/core/services/ai-response-generator.service.interface';
import { ReviewId, UserId, StoreId } from '@/lib/types/branded.type';

// DTO Input
export interface GenerateAiResponseInput {
  readonly reviewId: ReviewId;
  readonly userId: UserId;
  readonly tone?: 'professional' | 'friendly' | 'apologetic';
  readonly language?: 'fr' | 'en';
  readonly includeEmojis?: boolean;
}

// DTO Output
export interface GenerateAiResponseOutput extends GenerateResponseOutput {
  readonly reviewId: ReviewId;
  readonly usageLogged: boolean;
}

// Domain Errors
export class ReviewNotFoundError extends Error {
  constructor(reviewId: ReviewId) {
    super(`Review ${reviewId} not found`);
    this.name = 'ReviewNotFoundError';
  }
}

export class AiServiceUnavailableError extends Error {
  constructor() {
    super('AI service is not available or not configured');
    this.name = 'AiServiceUnavailableError';
  }
}

export class AiQuotaExceededError extends Error {
  constructor() {
    super('AI quota exceeded for this user');
    this.name = 'AiQuotaExceededError';
  }
}

/**
 * Use Case: Generate AI Response
 * Génère une suggestion de réponse intelligente pour un avis
 */
export class GenerateAiResponseUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly aiService: IAiResponseGeneratorService,
    private readonly storeRepository: {
      findById: (id: StoreId) => Promise<{ id: string; name: string } | null>;
    },
  ) {}

  async execute(input: GenerateAiResponseInput): Promise<Result<GenerateAiResponseOutput>> {
    // 1. Vérifier que le service IA est disponible
    const isAvailable = await this.aiService.isAvailable();
    if (!isAvailable) {
      return Result.fail(new AiServiceUnavailableError());
    }

    // 2. Charger l'avis
    const review = await this.reviewRepository.findById(input.reviewId);
    if (!review) {
      return Result.fail(new ReviewNotFoundError(input.reviewId));
    }

    // 3. Vérifier que l'avis n'a pas déjà de réponse
    if (review.hasResponse) {
      return Result.fail(new Error('Review already has a response'));
    }

    // 4. Récupérer le store name
    const store = await this.storeRepository.findById(review.storeId as StoreId);
    if (!store) {
      return Result.fail(new Error('Store not found'));
    }

    // 5. Déterminer le tone automatiquement si non fourni
    const tone = input.tone || this.determineToneFromRating(review.rating);

    // 6. Générer la réponse IA
    const generateResult = await this.aiService.generateResponse({
      reviewContent: review.comment,
      reviewRating: review.rating,
      authorName: review.authorName,
      storeName: store.name,
      tone,
      language: input.language || 'fr',
      includeEmojis: input.includeEmojis ?? true,
    });

    if (!generateResult.success) {
      return Result.fail(generateResult.error);
    }

    const aiResponse = generateResult.data;

    // 7. Mettre à jour l'avis avec la suggestion IA
    const updateResult = await this.reviewRepository.update(input.reviewId, {
      aiSuggestion: {
        suggestedResponse: aiResponse.suggestedResponse,
        confidence: aiResponse.confidence,
        tone,
      },
      aiSentiment: aiResponse.sentiment,
    });
    if (!updateResult.success) {
      return Result.fail(updateResult.error);
    }

    // 8. Retourner la réponse avec metadata
    return Result.ok({
      reviewId: input.reviewId,
      suggestedResponse: aiResponse.suggestedResponse,
      confidence: aiResponse.confidence,
      sentiment: aiResponse.sentiment,
      tokensUsed: aiResponse.tokensUsed,
      provider: aiResponse.provider,
      model: aiResponse.model,
      usageLogged: true, // Le service doit logger l'usage
    });
  }

  /**
   * Détermine le ton approprié basé sur le rating
   */
  private determineToneFromRating(rating: number): 'professional' | 'friendly' | 'apologetic' {
    if (rating <= 2) return 'apologetic'; // Avis très négatif
    if (rating === 3) return 'professional'; // Avis neutre
    return 'friendly'; // Avis positif
  }
}
