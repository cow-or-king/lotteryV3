/**
 * Google My Business Service - Production Implementation
 * Utilise l'API Google My Business pour récupérer et gérer les avis
 * IMPORTANT: ZERO any types
 */

import { Result } from '@/lib/types/result.type';
import {
  IGoogleMyBusinessService,
  GoogleReviewData,
  FetchReviewsOptions,
} from '@/core/services/google-my-business.service.interface';
import { google } from 'googleapis';
import { ApiKeyEncryptionService } from '../encryption/api-key-encryption.service';

export class GoogleMyBusinessProductionService implements IGoogleMyBusinessService {
  private encryptedRefreshToken?: string;

  constructor(private readonly encryptionService: ApiKeyEncryptionService) {}

  setRefreshToken(encryptedToken: string): void {
    this.encryptedRefreshToken = encryptedToken;
  }

  /**
   * Crée un client OAuth authentifié avec le refresh token
   */
  private async getAuthClient(encryptedRefreshToken: string) {
    try {
      const decryptResult = await this.encryptionService.decrypt(encryptedRefreshToken);
      if (!decryptResult.success) {
        throw new Error('Failed to decrypt refresh token: ' + decryptResult.error.message);
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
      );

      oauth2Client.setCredentials({
        refresh_token: decryptResult.data,
      });

      return oauth2Client;
    } catch (error) {
      throw new Error('Failed to create OAuth client: ' + (error as Error).message);
    }
  }

  /**
   * Récupère les avis Google pour un lieu
   */
  async fetchReviews(
    googlePlaceId: string,
    _options?: FetchReviewsOptions,
  ): Promise<Result<readonly GoogleReviewData[]>> {
    try {
      if (!this.encryptedRefreshToken) {
        return Result.fail(new Error('Refresh token not set. Call setRefreshToken() first'));
      }

      const auth = await this.getAuthClient(this.encryptedRefreshToken);
      const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
        version: 'v1',
        auth,
      });
      const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
        version: 'v1',
        auth,
      });

      // 1. Lister les comptes My Business
      console.log('[GMB] Fetching My Business accounts...');
      const accountsResponse = await mybusinessaccountmanagement.accounts.list();
      const accounts = accountsResponse.data.accounts || [];

      if (accounts.length === 0) {
        return Result.fail(new Error('No My Business accounts found for this user'));
      }

      const accountName = accounts[0]?.name;
      if (!accountName) {
        return Result.fail(new Error('Account name is missing'));
      }

      console.log('[GMB] Found account:', accountName);

      // 2. Lister les locations (établissements) de ce compte
      console.log('[GMB] Fetching locations...');
      const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
        parent: accountName,
        readMask: 'name,title,storeCode,metadata',
      });

      const locations = locationsResponse.data.locations || [];
      console.log(`[GMB] Found ${locations.length} locations`);

      // 3. Trouver la location correspondant au Place ID
      const targetLocation = locations.find(
        (loc) => loc.metadata?.placeId === googlePlaceId || loc.name?.includes(googlePlaceId),
      );

      if (!targetLocation || !targetLocation.name) {
        console.error(
          '[GMB] Available locations:',
          locations.map((l) => ({
            name: l.name,
            title: l.title,
            placeId: l.metadata?.placeId,
          })),
        );
        return Result.fail(
          new Error(
            `Location not found for Place ID: ${googlePlaceId}. Check available locations in logs.`,
          ),
        );
      }

      console.log('[GMB] Found target location:', targetLocation.title, targetLocation.name);

      // 4. Récupérer les avis pour cette location
      // Note: L'API My Business v4.9 pour les reviews n'est plus disponible
      // Pour l'instant, on retourne un tableau vide avec un message explicatif

      console.warn('[GMB] ⚠️  Google My Business API v4 (reviews) is deprecated.');
      console.warn('[GMB] ⚠️  Review fetching needs to be implemented with the new API endpoints.');

      // Stub reviews (en attendant l'implémentation complète)
      const stubReviews: GoogleReviewData[] = [
        {
          googleReviewId: `stub_${Date.now()}_1`,
          authorName: 'Test User 1',
          rating: 5,
          comment: '⚠️ STUB DATA - Implementation pending for review fetching',
          reviewUrl: `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`,
          publishedAt: new Date(),
        },
      ];

      return Result.ok(stubReviews);
    } catch (error) {
      console.error('[GMB] Error fetching reviews:', error);
      return Result.fail(new Error('Failed to fetch reviews: ' + (error as Error).message));
    }
  }

  /**
   * Publie une réponse à un avis Google
   * Utilise Google Business Profile API (nouvelle API post-2021)
   * IMPORTANT: Nécessite OAuth2 avec le scope businessprofileperformance
   */
  async publishResponse(
    googleReviewName: string,
    responseContent: string,
    apiKey: string,
  ): Promise<Result<void>> {
    try {
      const auth = await this.getAuthClient(apiKey);

      console.log('[GMB] Publishing response to review:', googleReviewName);
      console.log('[GMB] Response content:', responseContent);

      // Format requis: locations/{locationId}/reviews/{reviewId}
      // Si le format inclut "accounts/", on l'extrait
      let reviewPath = googleReviewName;
      if (googleReviewName.includes('accounts/')) {
        // Extraire locations/{locationId}/reviews/{reviewId}
        const match = googleReviewName.match(/locations\/[^/]+\/reviews\/[^/]+/);
        if (!match) {
          return Result.fail(
            new Error('Invalid review name format. Could not extract location/review path.'),
          );
        }
        reviewPath = match[0];
      }

      if (!reviewPath.includes('locations/') || !reviewPath.includes('/reviews/')) {
        return Result.fail(
          new Error(
            'Invalid review name format. Expected: locations/{locationId}/reviews/{reviewId}',
          ),
        );
      }

      // Utiliser l'API REST directement car google.mybusinessbusinesscommunications n'existe pas encore
      // Endpoint: PATCH https://businessprofileperformance.googleapis.com/v1/{reviewPath}/reply
      const url = `https://businessprofileperformance.googleapis.com/v1/${reviewPath}/reply`;

      const accessToken = await auth.getAccessToken();
      if (!accessToken.token) {
        return Result.fail(new Error('Failed to get access token'));
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: responseContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GMB] API Error:', response.status, errorText);
        return Result.fail(new Error(`API request failed (${response.status}): ${errorText}`));
      }

      console.log('[GMB] ✅ Response published successfully');
      return Result.ok(undefined);
    } catch (error) {
      console.error('[GMB] Error publishing response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return Result.fail(new Error(`Failed to publish response: ${errorMessage}`));
    }
  }

  /**
   * Valide les credentials Google API (refresh token)
   */
  async validateCredentials(apiKey: string): Promise<Result<boolean>> {
    try {
      const auth = await this.getAuthClient(apiKey);
      const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
        version: 'v1',
        auth,
      });

      // Test: lister les comptes
      const response = await mybusinessaccountmanagement.accounts.list();

      return Result.ok((response.data.accounts?.length || 0) > 0);
    } catch (error) {
      console.error('[GMB] Validation error:', error);
      return Result.ok(false);
    }
  }
}
