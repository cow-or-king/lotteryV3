/**
 * Get Review By ID Use Case
 * Récupère un avis par son ID
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { IReviewRepository } from '@/core/repositories/review.repository.interface';
import { ReviewId } from '@/shared/types/branded.type';

// DTO pour l'input
export interface GetReviewByIdInput {
  readonly reviewId: ReviewId;
}

// DTO pour l'output
export interface ReviewDTO {
  readonly reviewId: ReviewId;
  readonly googleReviewId: string;
  readonly authorName: string;
  readonly authorEmail: string | null;
  readonly rating: number;
  readonly comment: string | null;
  readonly reviewUrl: string;
  readonly publishedAt: Date;
  readonly hasResponse: boolean;
  readonly responseContent: string | null;
  readonly respondedAt: Date | null;
  readonly isVerified: boolean;
  readonly status: string;
  readonly sentiment: string | null;
}

export interface GetReviewByIdOutput extends ReviewDTO {}

// Domain Errors
export class ReviewNotFoundError extends Error {
  constructor(reviewId: ReviewId) {
    super(`Review ${reviewId} not found`);
    this.name = 'ReviewNotFoundError';
  }
}

/**
 * Use Case: Get Review By ID
 * Récupère un avis spécifique par son ID
 */
export class GetReviewByIdUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(input: GetReviewByIdInput): Promise<Result<GetReviewByIdOutput>> {
    // 1. Récupérer l'avis
    const review = await this.reviewRepository.findById(input.reviewId);

    if (!review) {
      return Result.fail(new ReviewNotFoundError(input.reviewId));
    }

    // 2. Transformer l'entité en DTO
    const reviewDTO: ReviewDTO = {
      reviewId: review.id,
      googleReviewId: review.googleReviewId,
      authorName: review.authorName,
      authorEmail: review.authorEmail,
      rating: review.rating,
      comment: review.comment,
      reviewUrl: review.reviewUrl,
      publishedAt: review.publishedAt,
      hasResponse: review.hasResponse,
      responseContent: review.responseContent,
      respondedAt: review.respondedAt,
      isVerified: review.isVerified,
      status: review.status,
      sentiment: review.sentiment,
    };

    // 3. Retourner le DTO
    return Result.ok(reviewDTO);
  }
}
