/**
 * List Reviews By Store Use Case
 * Liste les avis d'un store avec filtres et pagination
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { IReviewRepository, ReviewFilters } from '@/core/repositories/review.repository.interface';
import { StoreId, ReviewId } from '@/shared/types/branded.type';

// DTO pour l'input
export interface ListReviewsByStoreInput {
  readonly storeId: StoreId;
  readonly filters?: ReviewFilters;
  readonly limit?: number;
  readonly offset?: number;
}

// DTO pour l'output
export interface ReviewListItemDTO {
  readonly reviewId: ReviewId;
  readonly googleReviewId: string;
  readonly authorName: string;
  readonly rating: number;
  readonly comment: string | null;
  readonly publishedAt: Date;
  readonly hasResponse: boolean;
  readonly isVerified: boolean;
  readonly status: string;
  readonly sentiment: string | null;
  readonly needsAttention: boolean;
  readonly isPositive: boolean;
}

export interface ListReviewsByStoreOutput {
  readonly reviews: readonly ReviewListItemDTO[];
  readonly total: number;
}

/**
 * Use Case: List Reviews By Store
 * Liste les avis d'un store avec filtrage et pagination
 */
export class ListReviewsByStoreUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(input: ListReviewsByStoreInput): Promise<Result<ListReviewsByStoreOutput>> {
    // 1. Récupérer les avis
    const reviews = await this.reviewRepository.findByStore(
      input.storeId,
      input.filters,
      input.limit,
      input.offset,
    );

    // 2. Compter le total
    const total = await this.reviewRepository.countByStore(input.storeId, input.filters);

    // 3. Transformer les entités en DTOs
    const reviewDTOs: ReviewListItemDTO[] = reviews.map((review) => ({
      reviewId: review.id,
      googleReviewId: review.googleReviewId,
      authorName: review.authorName,
      rating: review.rating,
      comment: review.comment,
      publishedAt: review.publishedAt,
      hasResponse: review.hasResponse,
      isVerified: review.isVerified,
      status: review.status,
      sentiment: review.sentiment,
      needsAttention: review.needsAttention(),
      isPositive: review.isPositive(),
    }));

    // 4. Retourner la liste
    return Result.ok({
      reviews: reviewDTOs,
      total,
    });
  }
}
