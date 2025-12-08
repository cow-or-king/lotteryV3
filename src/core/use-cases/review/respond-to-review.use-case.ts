/**
 * Respond To Review Use Case
 * Permet à un utilisateur de répondre à un avis Google
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { IReviewRepository } from '@/core/repositories/review.repository.interface';
import { IResponseTemplateRepository } from '@/core/repositories/response-template.repository.interface';
import { ReviewId, UserId } from '@/shared/types/branded.type';

// DTO pour l'input
export interface RespondToReviewInput {
  readonly reviewId: ReviewId;
  readonly userId: UserId;
  readonly responseContent: string;
  readonly templateId?: string;
}

// DTO pour l'output
export interface RespondToReviewOutput {
  readonly reviewId: ReviewId;
  readonly hasResponse: boolean;
  readonly responseContent: string;
  readonly respondedBy: UserId;
  readonly respondedAt: Date;
}

// Domain Errors
export class ReviewNotFoundError extends Error {
  constructor(reviewId: ReviewId) {
    super(`Review ${reviewId} not found`);
    this.name = 'ReviewNotFoundError';
  }
}

export class ReviewResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewResponseError';
  }
}

/**
 * Use Case: Respond To Review
 * Permet à un utilisateur (store owner) de répondre à un avis Google
 */
export class RespondToReviewUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly templateRepository: IResponseTemplateRepository,
  ) {}

  async execute(input: RespondToReviewInput): Promise<Result<RespondToReviewOutput>> {
    // 1. Chercher l'avis par ID
    const review = await this.reviewRepository.findById(input.reviewId);

    if (!review) {
      return Result.fail(new ReviewNotFoundError(input.reviewId));
    }

    // 2. Vérifier que l'avis n'a pas déjà une réponse
    if (review.hasResponse) {
      return Result.fail(new ReviewResponseError('Review already has a response'));
    }

    // 3. Valider la longueur du contenu
    if (input.responseContent.length < 10) {
      return Result.fail(
        new ReviewResponseError('Response content must be at least 10 characters'),
      );
    }

    if (input.responseContent.length > 5000) {
      return Result.fail(new ReviewResponseError('Response content cannot exceed 5000 characters'));
    }

    // 4. Ajouter la réponse à l'avis
    const responseResult = review.addResponse(input.responseContent, input.userId);
    if (!responseResult.success) {
      return Result.fail(responseResult.error);
    }

    // 5. Sauvegarder l'avis mis à jour
    const saveResult = await this.reviewRepository.save(responseResult.data);
    if (!saveResult.success) {
      return Result.fail(saveResult.error);
    }

    const updatedReview = saveResult.data;

    // 6. Si un template a été utilisé, incrémenter son compteur d'usage
    if (input.templateId) {
      await this.templateRepository.incrementUsage(input.templateId);
    }

    // 7. Retourner les informations de la réponse
    return Result.ok({
      reviewId: updatedReview.id,
      hasResponse: updatedReview.hasResponse,
      responseContent: updatedReview.responseContent!,
      respondedBy: updatedReview.respondedBy!,
      respondedAt: updatedReview.respondedAt!,
    });
  }
}
