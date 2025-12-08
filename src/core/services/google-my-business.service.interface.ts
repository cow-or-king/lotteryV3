/**
 * Google My Business Service Interface
 * Port pour l'intégration avec Google My Business API
 * IMPORTANT: Interface uniquement, implémentation dans /infrastructure
 */

import { Result } from '@/shared/types/result.type';

/**
 * Données d'un avis retourné par l'API Google
 */
export interface GoogleReviewData {
  readonly googleReviewId: string;
  readonly authorName: string;
  readonly authorEmail?: string;
  readonly authorGoogleId?: string;
  readonly authorPhotoUrl?: string;
  readonly rating: number;
  readonly comment?: string;
  readonly reviewUrl: string;
  readonly photoUrl?: string;
  readonly publishedAt: Date;
}

/**
 * Options pour récupérer les avis
 */
export interface FetchReviewsOptions {
  readonly maxResults?: number; // Limite de résultats (défaut: 100)
  readonly orderBy?: 'MOST_RECENT' | 'HIGHEST_RATING' | 'LOWEST_RATING';
  readonly minRating?: number; // Filtrer par note minimum
}

/**
 * Service pour interagir avec Google My Business API
 */
export interface IGoogleMyBusinessService {
  /**
   * Récupère les avis pour un lieu Google
   * @param googlePlaceId - ID du lieu Google (ex: "ChIJN1t_tDeuEmsRUsoyG83frY4")
   * @param options - Options de filtrage (optionnel)
   * @returns Liste des avis ou erreur
   */
  fetchReviews(
    googlePlaceId: string,
    options?: FetchReviewsOptions,
  ): Promise<Result<readonly GoogleReviewData[]>>;

  /**
   * Publie une réponse à un avis Google
   * @param googleReviewId - ID de l'avis Google
   * @param responseContent - Contenu de la réponse
   * @param apiKey - Clé API Google (cryptée)
   * @returns Succès ou erreur
   */
  publishResponse(
    googleReviewId: string,
    responseContent: string,
    apiKey: string,
  ): Promise<Result<void>>;

  /**
   * Vérifie que les credentials sont valides
   * @param apiKey - Clé API Google (cryptée)
   * @returns true si valide, false sinon
   */
  validateCredentials(apiKey: string): Promise<Result<boolean>>;
}
