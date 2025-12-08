/**
 * Sync Reviews From Google Use Case
 * Synchronise les avis Google My Business avec la base de données
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/lib/types/result.type';
import {
  IReviewRepository,
  CreateReviewData,
} from '@/core/repositories/review.repository.interface';
import {
  IGoogleMyBusinessService,
  GoogleReviewData,
} from '@/core/services/google-my-business.service.interface';
import { StoreId } from '@/lib/types/branded.type';

// DTO pour l'input
export interface SyncReviewsFromGoogleInput {
  readonly storeId: StoreId;
  readonly googlePlaceId: string;
  readonly maxResults?: number;
}

// DTO pour l'output
export interface SyncReviewsFromGoogleOutput {
  readonly totalFetched: number;
  readonly synchronized: number;
  readonly failed: number;
}

// Domain Errors
export class InvalidGooglePlaceIdError extends Error {
  constructor(placeId: string) {
    super(`Invalid Google Place ID: ${placeId}`);
    this.name = 'InvalidGooglePlaceIdError';
  }
}

export class GoogleApiError extends Error {
  constructor(message: string) {
    super(`Failed to fetch reviews from Google: ${message}`);
    this.name = 'GoogleApiError';
  }
}

export class SyncError extends Error {
  constructor(message: string) {
    super(`Failed to save reviews: ${message}`);
    this.name = 'SyncError';
  }
}

/**
 * Use Case: Sync Reviews From Google
 * Récupère les avis depuis Google My Business et les synchronise avec la base de données
 */
export class SyncReviewsFromGoogleUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly googleService: IGoogleMyBusinessService,
  ) {}

  async execute(input: SyncReviewsFromGoogleInput): Promise<Result<SyncReviewsFromGoogleOutput>> {
    // 1. Valider le Google Place ID (format: ChI...)
    if (!this.isValidGooglePlaceId(input.googlePlaceId)) {
      return Result.fail(new InvalidGooglePlaceIdError(input.googlePlaceId));
    }

    // 2. Récupérer les avis depuis Google
    const fetchResult = await this.googleService.fetchReviews(input.googlePlaceId, {
      maxResults: input.maxResults,
    });

    if (!fetchResult.success) {
      return Result.fail(new GoogleApiError(fetchResult.error.message));
    }

    const googleReviews = fetchResult.data;

    // 3. Si aucun avis, retourner succès avec 0
    if (googleReviews.length === 0) {
      return Result.ok({
        totalFetched: 0,
        synchronized: 0,
        failed: 0,
      });
    }

    // 4. Transformer les avis Google en CreateReviewData
    const reviewsData: CreateReviewData[] = googleReviews.map((googleReview) =>
      this.mapGoogleReviewToCreateData(googleReview, input.storeId, input.googlePlaceId),
    );

    // 5. Sauvegarder les avis (upsert)
    const saveResult = await this.reviewRepository.upsertMany(reviewsData);

    if (!saveResult.success) {
      return Result.fail(new SyncError(saveResult.error.message));
    }

    // 6. Retourner le résumé
    return Result.ok({
      totalFetched: googleReviews.length,
      synchronized: googleReviews.length,
      failed: 0,
    });
  }

  /**
   * Valide le format d'un Google Place ID
   * Format attendu: commence par "ChI" et contient des caractères alphanumériques
   */
  private isValidGooglePlaceId(placeId: string): boolean {
    if (!placeId || placeId.trim().length === 0) {
      return false;
    }

    // Google Place IDs commencent généralement par "ChI"
    if (!placeId.startsWith('ChI')) {
      return false;
    }

    // Doit contenir au moins 20 caractères
    if (placeId.length < 20) {
      return false;
    }

    return true;
  }

  /**
   * Transforme un avis Google en CreateReviewData
   */
  private mapGoogleReviewToCreateData(
    googleReview: GoogleReviewData,
    storeId: StoreId,
    googlePlaceId: string,
  ): CreateReviewData {
    return {
      googleReviewId: googleReview.googleReviewId,
      storeId,
      authorName: googleReview.authorName,
      authorEmail: googleReview.authorEmail,
      authorGoogleId: googleReview.authorGoogleId,
      authorPhotoUrl: googleReview.authorPhotoUrl,
      rating: googleReview.rating,
      comment: googleReview.comment,
      reviewUrl: googleReview.reviewUrl,
      googlePlaceId,
      photoUrl: googleReview.photoUrl,
      publishedAt: googleReview.publishedAt,
    };
  }
}
