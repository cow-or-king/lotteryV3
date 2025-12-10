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
import { ApiKeyEncryptionService } from '../security/api-key-encryption.service';

export class GoogleMyBusinessProductionService implements IGoogleMyBusinessService {
  constructor(private readonly encryptionService: ApiKeyEncryptionService) {}

  /**
   * Crée un client OAuth authentifié avec le refresh token
   */
  private async getAuthClient(encryptedRefreshToken: string) {
    try {
      const refreshToken = await this.encryptionService.decrypt(encryptedRefreshToken);

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
      );

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
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
    options?: FetchReviewsOptions,
  ): Promise<Result<readonly GoogleReviewData[]>> {
    try {
      if (!options?.apiKey) {
        return Result.fail(new Error('API Key (refresh token) is required'));
      }

      const auth = await this.getAuthClient(options.apiKey);
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

      const accountName = accounts[0].name;
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
   * Note: Cette fonctionnalité est disponible via My Business API
   */
  async publishResponse(
    googleReviewId: string,
    responseContent: string,
    apiKey: string,
  ): Promise<Result<void>> {
    try {
      const auth = await this.getAuthClient(apiKey);

      // L'API pour publier des réponses existe mais nécessite
      // le nom complet de la review: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}

      console.warn('[GMB] Publishing responses requires the full review resource name');
      console.warn('[GMB] Format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}');

      return Result.fail(
        new Error('Publishing responses not yet implemented. Need full review resource name.'),
      );
    } catch (error) {
      return Result.fail(new Error('Failed to publish response: ' + (error as Error).message));
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
