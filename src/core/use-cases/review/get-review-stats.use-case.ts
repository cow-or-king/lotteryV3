/**
 * Get Review Stats Use Case
 * Récupère les statistiques des avis d'un store
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/lib/types/result.type';
import {
  IReviewRepository,
  ReviewFilters,
  ReviewStats,
} from '@/core/repositories/review.repository.interface';
import { StoreId } from '@/lib/types/branded.type';

// DTO pour l'input
export interface GetReviewStatsInput {
  readonly storeId: StoreId;
  readonly filters?: ReviewFilters;
}

// DTO pour l'output
export interface GetReviewStatsOutput extends ReviewStats {}

/**
 * Use Case: Get Review Stats
 * Récupère les statistiques des avis pour un store
 */
export class GetReviewStatsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(input: GetReviewStatsInput): Promise<Result<GetReviewStatsOutput>> {
    // 1. Récupérer les statistiques
    const stats = await this.reviewRepository.getStatsByStore(input.storeId, input.filters);

    // 2. Retourner les statistiques
    return Result.ok(stats);
  }
}
