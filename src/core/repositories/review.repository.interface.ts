/**
 * Review Repository Interface
 * Contrat pour la persistence des avis Google
 * IMPORTANT: Interface uniquement, ZERO implémentation ici
 */

import { Result } from '@/shared/types/result.type';
import { ReviewId, StoreId, UserId } from '@/shared/types/branded.type';

export type ReviewStatus = 'NEW' | 'PENDING_RESPONSE' | 'RESPONDED' | 'IGNORED';
export type ReviewSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface ReviewData {
  readonly id: ReviewId;
  readonly googleReviewId: string;
  readonly storeId: StoreId;
  readonly authorName: string;
  readonly authorPhotoUrl: string | null;
  readonly rating: number; // 1-5
  readonly comment: string | null;
  readonly reviewTime: Date;
  readonly responseText: string | null;
  readonly respondedAt: Date | null;
  readonly respondedBy: UserId | null;
  readonly status: ReviewStatus;
  readonly sentiment: ReviewSentiment | null;
  readonly syncedAt: Date;
}

export interface CreateReviewData {
  readonly googleReviewId: string;
  readonly storeId: StoreId;
  readonly authorName: string;
  readonly authorPhotoUrl?: string;
  readonly rating: number;
  readonly comment?: string;
  readonly reviewTime: Date;
  readonly sentiment?: ReviewSentiment;
}

export interface IReviewRepository {
  /**
   * Trouve un avis par son ID
   */
  findById(id: ReviewId): Promise<ReviewData | null>;

  /**
   * Trouve un avis par ID Google
   */
  findByGoogleId(googleReviewId: string): Promise<ReviewData | null>;

  /**
   * Trouve tous les avis d'un store
   */
  findByStore(
    storeId: StoreId,
    options?: {
      limit?: number;
      offset?: number;
      status?: ReviewStatus;
      minRating?: number;
      maxRating?: number;
      sentiment?: ReviewSentiment;
      orderBy?: 'reviewTime' | 'rating' | 'status';
      order?: 'asc' | 'desc';
    },
  ): Promise<ReviewData[]>;

  /**
   * Trouve les avis nécessitant une réponse
   */
  findPendingResponse(storeId: StoreId): Promise<ReviewData[]>;

  /**
   * Crée ou met à jour un avis (upsert)
   */
  upsert(data: CreateReviewData): Promise<Result<ReviewData>>;

  /**
   * Crée plusieurs avis en batch
   */
  upsertMany(reviews: CreateReviewData[]): Promise<Result<void>>;

  /**
   * Enregistre une réponse à un avis
   */
  saveResponse(id: ReviewId, responseText: string, respondedBy: UserId): Promise<Result<void>>;

  /**
   * Met à jour le statut d'un avis
   */
  updateStatus(id: ReviewId, status: ReviewStatus): Promise<Result<void>>;

  /**
   * Met à jour le sentiment d'un avis
   */
  updateSentiment(id: ReviewId, sentiment: ReviewSentiment): Promise<Result<void>>;

  /**
   * Marque un avis comme ignoré
   */
  ignore(id: ReviewId): Promise<Result<void>>;

  /**
   * Compte les avis par statut
   */
  countByStatus(storeId: StoreId): Promise<{
    new: number;
    pendingResponse: number;
    responded: number;
    ignored: number;
  }>;

  /**
   * Calcule les statistiques d'avis
   */
  getReviewStats(storeId: StoreId): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
    sentimentDistribution: Record<ReviewSentiment, number>;
    responseRate: number;
    averageResponseTime: number; // en heures
  }>;

  /**
   * Trouve les avis récents pour analyse
   */
  findRecentForAnalysis(storeId: StoreId, since: Date): Promise<ReviewData[]>;

  /**
   * Marque la dernière synchronisation
   */
  updateLastSync(storeId: StoreId, syncedAt: Date): Promise<Result<void>>;

  /**
   * Export des avis pour analyse
   */
  exportForAnalysis(storeId: StoreId, startDate: Date, endDate: Date): Promise<ReviewData[]>;
}
