/**
 * Review Repository Interface
 * Port pour l'accès aux données des avis Google
 * IMPORTANT: Interface uniquement, ZERO implémentation ici
 */

import { Result } from '@/lib/types/result.type';
import { ReviewEntity } from '@/core/entities/review.entity';
import { ReviewId, StoreId, CampaignId, ParticipantId } from '@/lib/types/branded.type';

export interface CreateReviewData {
  readonly googleReviewId: string;
  readonly storeId: StoreId;
  readonly campaignId?: CampaignId;
  readonly authorName: string;
  readonly authorEmail?: string;
  readonly authorGoogleId?: string;
  readonly authorPhotoUrl?: string;
  readonly rating: number;
  readonly comment?: string;
  readonly reviewUrl: string;
  readonly googlePlaceId: string;
  readonly photoUrl?: string;
  readonly publishedAt: Date;
}

export interface UpdateReviewData {
  readonly hasResponse?: boolean;
  readonly responseContent?: string;
  readonly respondedAt?: Date;
  readonly respondedBy?: string;
  readonly isVerified?: boolean;
  readonly participantId?: ParticipantId;
  readonly status?: string;
  readonly aiSuggestion?: unknown; // JSON type from Prisma
  readonly aiSentiment?: string | null;
}

export interface ReviewFilters {
  readonly storeId?: StoreId;
  readonly campaignId?: CampaignId;
  readonly rating?: number;
  readonly hasResponse?: boolean;
  readonly isVerified?: boolean;
  readonly status?: string;
  readonly fromDate?: Date;
  readonly toDate?: Date;
}

export interface ReviewStats {
  readonly total: number;
  readonly averageRating: number;
  readonly ratingDistribution: Record<number, number>; // {1: 5, 2: 10, 3: 15, 4: 20, 5: 50}
  readonly responseRate: number; // percentage
  readonly positiveCount: number; // rating >= 4
  readonly neutralCount: number; // rating = 3
  readonly negativeCount: number; // rating <= 2
  readonly needsAttentionCount: number; // rating <= 3 && !hasResponse
}

export interface IReviewRepository {
  /**
   * Trouve un avis par son ID
   */
  findById(id: ReviewId): Promise<ReviewEntity | null>;

  /**
   * Trouve un avis par son Google Review ID
   */
  findByGoogleReviewId(googleReviewId: string): Promise<ReviewEntity | null>;

  /**
   * Liste les avis d'un store avec filtres optionnels
   */
  findByStore(
    storeId: StoreId,
    filters?: ReviewFilters,
    limit?: number,
    offset?: number,
  ): Promise<ReadonlyArray<ReviewEntity>>;

  /**
   * Liste les avis d'une campagne
   */
  findByCampaign(
    campaignId: CampaignId,
    limit?: number,
    offset?: number,
  ): Promise<ReadonlyArray<ReviewEntity>>;

  /**
   * Trouve un avis par email et store (pour vérification participant)
   */
  findByEmailAndStore(email: string, storeId: StoreId): Promise<ReviewEntity | null>;

  /**
   * Crée un nouvel avis
   */
  create(data: CreateReviewData): Promise<Result<ReviewEntity>>;

  /**
   * Met à jour un avis
   */
  update(id: ReviewId, data: UpdateReviewData): Promise<Result<ReviewEntity>>;

  /**
   * Sauvegarde un avis (update entité complète)
   */
  save(review: ReviewEntity): Promise<Result<ReviewEntity>>;

  /**
   * Supprime un avis (RGPD)
   */
  delete(id: ReviewId): Promise<Result<void>>;

  /**
   * Compte le nombre d'avis pour un store
   */
  countByStore(storeId: StoreId, filters?: ReviewFilters): Promise<number>;

  /**
   * Obtient les statistiques d'avis pour un store
   */
  getStatsByStore(storeId: StoreId, filters?: ReviewFilters): Promise<ReviewStats>;

  /**
   * Vérifie si un avis existe déjà (par Google Review ID)
   */
  exists(googleReviewId: string): Promise<boolean>;

  /**
   * Liste les avis nécessitant une attention (rating <= 3 && !hasResponse)
   */
  findNeedingAttention(storeId: StoreId, limit?: number): Promise<ReadonlyArray<ReviewEntity>>;

  /**
   * Crée ou met à jour plusieurs avis en batch (pour sync Google)
   */
  upsertMany(reviews: CreateReviewData[]): Promise<Result<void>>;
}
