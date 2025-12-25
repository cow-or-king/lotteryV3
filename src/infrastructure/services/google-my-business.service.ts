/**
 * Google My Business Service (STUB)
 * Implémentation stub de IGoogleMyBusinessService
 *
 * IMPORTANT: Cette implémentation est un STUB pour développement
 * Pour la production, utiliser l'API Google My Business réelle
 * Docs: https://developers.google.com/my-business/reference/rest
 *
 * TODO Production:
 * - Installer @google/maps (npm install @google/maps)
 * - Configurer OAuth2 ou API Key
 * - Implémenter vraie pagination
 * - Gérer rate limiting
 * - Ajouter retry logic
 */

import { Result } from '@/lib/types/result.type';
import {
  IGoogleMyBusinessService,
  GoogleReviewData,
  FetchReviewsOptions,
} from '@/core/services/google-my-business.service.interface';

export class GoogleMyBusinessService implements IGoogleMyBusinessService {
  /**
   * STUB: Récupère les avis Google pour un lieu
   *
   * Production implementation would:
   * 1. Use Google My Business API with OAuth2
   * 2. Authenticate with refresh token
   * 3. Handle pagination with nextPageToken
   * 4. Parse Google's response format
   *
   * See google-my-business-production.service.ts for production implementation
   */
  async fetchReviews(
    googlePlaceId: string,
    _options?: FetchReviewsOptions,
  ): Promise<Result<readonly GoogleReviewData[]>> {
    try {
      // STUB: Fetch reviews implementation placeholder

      // STUB: Retourne un tableau vide
      // En production, faire l'appel API réel ici
      const stubReviews: GoogleReviewData[] = [];

      // STUB: Simuler des données pour développement (optionnel)
      if (process.env.NODE_ENV === 'development') {
        // Générer quelques avis de test
        stubReviews.push({
          googleReviewId: `stub_review_${Date.now()}`,
          authorName: 'Test User',
          rating: 5,
          comment: 'Great service! (STUB DATA)',
          reviewUrl: `https://maps.google.com/stub/${googlePlaceId}`,
          publishedAt: new Date(),
        });
      }

      return Result.ok(stubReviews);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  /**
   * STUB: Publie une réponse à un avis Google
   *
   * Production implementation would:
   * 1. Use Google My Business API
   * 2. Authenticate with OAuth2 (requires business owner consent)
   * 3. POST to /accounts/{accountId}/locations/{locationId}/reviews/{reviewId}/reply
   * 4. Handle API errors (permissions, rate limits)
   *
   * Example:
   * ```typescript
   * const mybusiness = google.mybusinessaccountmanagement('v1');
   * await mybusiness.accounts.locations.reviews.updateReply({
   *   name: `accounts/${accountId}/locations/${locationId}/reviews/${reviewId}`,
   *   requestBody: { comment: responseContent }
   * });
   * ```
   */
  async publishResponse(
    _googleReviewId: string,
    _responseContent: string,
    _apiKey: string,
  ): Promise<Result<void>> {
    try {
      // STUB: Publish response implementation placeholder

      // STUB: En production, décrypter apiKey et faire l'appel API
      // const decryptedKey = await decrypt(apiKey);
      // await googleMyBusinessAPI.publishReply(googleReviewId, responseContent, decryptedKey);

      // STUB: Simuler succès
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  /**
   * STUB: Valide les credentials Google API
   *
   * Production implementation would:
   * 1. Test API key with a simple API call
   * 2. Check permissions/scopes
   * 3. Verify account access
   */
  async validateCredentials(apiKey: string): Promise<Result<boolean>> {
    try {
      // STUB: Validate credentials implementation placeholder

      if (!apiKey || apiKey.trim().length === 0) {
        return Result.ok(false);
      }

      // STUB: En production, faire un appel API de test
      // const testResponse = await googleAPI.test(apiKey);
      // return Result.ok(testResponse.status === 200);

      // STUB: Simuler validation OK si API key fournie
      return Result.ok(true);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}

/**
 * NOTES POUR IMPLÉMENTATION PRODUCTION:
 *
 * 1. Installer les dépendances:
 *    npm install googleapis
 *
 * 2. Configuration OAuth2:
 *    - Créer projet Google Cloud Console
 *    - Activer Google My Business API
 *    - Créer OAuth2 credentials
 *    - Obtenir refresh token du propriétaire du business
 *
 * 3. Rate Limiting:
 *    - My Business API: varie selon le plan (généralement 1,000 requêtes/jour)
 *
 * 4. Gestion d'erreurs spécifiques:
 *    - 403: Permissions insuffisantes
 *    - 429: Rate limit dépassé
 *    - 404: Place ID invalide
 *
 * 5. Décryptage API Key:
 *    - Utiliser ApiKeyEncryptionService.decrypt()
 *    - Ne JAMAIS logger les clés décryptées
 *
 * 6. Tests:
 *    - Créer mocks pour tests unitaires
 *    - Utiliser sandbox Google pour tests d'intégration
 */
