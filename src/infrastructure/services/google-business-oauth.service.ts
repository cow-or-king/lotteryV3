/**
 * Google Business OAuth Service
 * Service pour récupérer les avis Google Business via OAuth2
 * Utilise les tokens stockés dans GoogleBusinessToken
 *
 * Architecture: Infrastructure Layer
 * IMPORTANT: ZERO any types
 */

import { Result } from '@/lib/types/result.type';
import { google } from 'googleapis';
import { prisma } from '@/infrastructure/database/prisma-client';
import { decryptToken } from '@/lib/encryption/token-encryption.service';

/**
 * Données d'un avis Google Business
 */
export interface GoogleBusinessReview {
  readonly reviewId: string;
  readonly reviewer: {
    readonly profilePhotoUrl?: string;
    readonly displayName: string;
    readonly isAnonymous: boolean;
  };
  readonly starRating: 'STAR_RATING_UNSPECIFIED' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  readonly comment?: string;
  readonly createTime: string;
  readonly updateTime: string;
  readonly reviewReply?: {
    readonly comment: string;
    readonly updateTime: string;
  };
  readonly name: string; // Format: accounts/{accountId}/locations/{locationId}/reviews/{reviewId}
}

/**
 * Service pour interagir avec Google Business Profile API via OAuth
 */
export class GoogleBusinessOAuthService {
  /**
   * Crée un client OAuth2 avec les tokens du store
   */
  private async createOAuth2Client(storeId: string) {
    const tokenRecord = await prisma.googleBusinessToken.findUnique({
      where: { storeId },
    });

    if (!tokenRecord) {
      throw new Error('No Google Business token found for this store');
    }

    // Vérifier que le token n'est pas expiré
    if (tokenRecord.expiresAt < new Date()) {
      throw new Error('Google Business token has expired. Please reconnect your account.');
    }

    // Déchiffrer les tokens
    const accessToken = decryptToken(tokenRecord.accessToken);
    const refreshToken = decryptToken(tokenRecord.refreshToken);

    // Créer le client OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_BUSINESS_CLIENT_ID,
      process.env.GOOGLE_BUSINESS_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-business/callback`,
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return { oauth2Client, tokenRecord };
  }

  /**
   * Récupère les avis Google Business pour un store
   * Utilise Google My Business API v4 (direct REST endpoint)
   * Doc: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list
   */
  async fetchReviews(storeId: string): Promise<Result<GoogleBusinessReview[]>> {
    try {
      console.log('[GoogleBusinessOAuth] Fetching reviews for storeId:', storeId);

      const { oauth2Client, tokenRecord } = await this.createOAuth2Client(storeId);

      if (!tokenRecord.accountId || !tokenRecord.locationId) {
        return Result.fail(
          new Error('No location selected. Please select a Google Business location first.'),
        );
      }

      // Construire le nom de la location
      // Format: accounts/{accountId}/locations/{locationId}
      const locationName = `${tokenRecord.accountId}/locations/${tokenRecord.locationId}`;

      console.log('[GoogleBusinessOAuth] Fetching reviews for location:', locationName);

      // Utiliser l'API REST directement (My Business v4)
      // Endpoint: GET https://mybusiness.googleapis.com/v4/{locationName}/reviews
      const accessTokenResult = await oauth2Client.getAccessToken();
      if (!accessTokenResult.token) {
        return Result.fail(new Error('Failed to get access token'));
      }

      const url = `https://mybusiness.googleapis.com/v4/${locationName}/reviews`;

      console.log('[GoogleBusinessOAuth] Calling API:', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessTokenResult.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GoogleBusinessOAuth] API Error:', response.status, errorText);
        return Result.fail(new Error(`Failed to fetch reviews (${response.status}): ${errorText}`));
      }

      const data = (await response.json()) as { reviews?: GoogleBusinessReview[] };
      const reviews = data.reviews || [];

      console.log('[GoogleBusinessOAuth] Fetched', reviews.length, 'reviews');

      return Result.ok(reviews);
    } catch (error) {
      console.error('[GoogleBusinessOAuth] Error fetching reviews:', error);
      return Result.fail(
        new Error(
          `Failed to fetch Google Business reviews: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  /**
   * Publie une réponse à un avis Google Business
   */
  async replyToReview(
    storeId: string,
    reviewName: string,
    replyText: string,
  ): Promise<Result<void>> {
    try {
      console.log('[GoogleBusinessOAuth] Replying to review:', reviewName);

      const { oauth2Client } = await this.createOAuth2Client(storeId);

      const accessTokenResult = await oauth2Client.getAccessToken();
      if (!accessTokenResult.token) {
        return Result.fail(new Error('Failed to get access token'));
      }

      // Endpoint: PUT https://mybusiness.googleapis.com/v4/{reviewName}/reply
      const url = `https://mybusiness.googleapis.com/v4/${reviewName}/reply`;

      console.log('[GoogleBusinessOAuth] Calling API:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessTokenResult.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: replyText,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GoogleBusinessOAuth] API Error:', response.status, errorText);
        return Result.fail(
          new Error(`Failed to reply to review (${response.status}): ${errorText}`),
        );
      }

      console.log('[GoogleBusinessOAuth] Successfully replied to review');

      return Result.ok(undefined);
    } catch (error) {
      console.error('[GoogleBusinessOAuth] Error replying to review:', error);
      return Result.fail(
        new Error(
          `Failed to reply to review: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  /**
   * Supprime une réponse à un avis Google Business
   */
  async deleteReply(storeId: string, reviewName: string): Promise<Result<void>> {
    try {
      console.log('[GoogleBusinessOAuth] Deleting reply for review:', reviewName);

      const { oauth2Client } = await this.createOAuth2Client(storeId);

      const accessTokenResult = await oauth2Client.getAccessToken();
      if (!accessTokenResult.token) {
        return Result.fail(new Error('Failed to get access token'));
      }

      // Endpoint: DELETE https://mybusiness.googleapis.com/v4/{reviewName}/reply
      const url = `https://mybusiness.googleapis.com/v4/${reviewName}/reply`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessTokenResult.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GoogleBusinessOAuth] API Error:', response.status, errorText);
        return Result.fail(new Error(`Failed to delete reply (${response.status}): ${errorText}`));
      }

      console.log('[GoogleBusinessOAuth] Successfully deleted reply');

      return Result.ok(undefined);
    } catch (error) {
      console.error('[GoogleBusinessOAuth] Error deleting reply:', error);
      return Result.fail(
        new Error(
          `Failed to delete reply: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }
}

// Export singleton instance
export const googleBusinessOAuthService = new GoogleBusinessOAuthService();
