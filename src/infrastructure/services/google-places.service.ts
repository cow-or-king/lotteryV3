/**
 * Google Places Service - Production Implementation
 * Utilise Places API (New) pour récupérer les avis Google
 * IMPORTANT: ZERO any types
 *
 * NOTE: Cette API est READ-ONLY - impossible de publier des réponses
 */

import { Result } from '@/lib/types/result.type';
import {
  IGoogleMyBusinessService,
  GoogleReviewData,
  FetchReviewsOptions,
} from '@/core/services/google-my-business.service.interface';

export class GooglePlacesService implements IGoogleMyBusinessService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://places.googleapis.com/v1';

  constructor() {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) {
      throw new Error('GOOGLE_PLACES_API_KEY is not configured in environment variables');
    }
    this.apiKey = key;
  }

  /**
   * Récupère les avis Google pour un lieu via Places API (New)
   */
  async fetchReviews(
    googlePlaceId: string,
    options?: FetchReviewsOptions,
  ): Promise<Result<readonly GoogleReviewData[]>> {
    try {
      console.log(`[Places API] Fetching reviews for Place ID: ${googlePlaceId}`);

      // Appel à l'API Places (New)
      // Doc: https://developers.google.com/maps/documentation/places/web-service/place-details
      const response = await fetch(
        `${this.baseUrl}/places/${googlePlaceId}?fields=reviews&key=${this.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Places API] Error response:', errorText);

        return Result.fail(
          new Error(`Places API error (${response.status}): ${response.statusText}. ${errorText}`),
        );
      }

      const data = await response.json();
      const reviews = data.reviews || [];

      console.log(`[Places API] Found ${reviews.length} reviews`);

      // Transformer au format du domaine
      const googleReviews: GoogleReviewData[] = reviews.map(
        (review: {
          name: string;
          authorAttribution?: { displayName?: string; uri?: string };
          rating: number;
          text?: { text?: string };
          publishTime: string;
          relativePublishTimeDescription?: string;
        }) => ({
          googleReviewId: review.name || `${googlePlaceId}_${review.publishTime}`,
          authorName: review.authorAttribution?.displayName || 'Anonymous',
          rating: review.rating,
          comment: review.text?.text || null,
          reviewUrl:
            review.authorAttribution?.uri ||
            `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`,
          publishedAt: new Date(review.publishTime),
        }),
      );

      return Result.ok(googleReviews);
    } catch (error) {
      console.error('[Places API] Error fetching reviews:', error);
      return Result.fail(
        new Error('Failed to fetch reviews from Places API: ' + (error as Error).message),
      );
    }
  }

  /**
   * Places API ne permet PAS de publier des réponses
   * Il faut utiliser My Business API avec OAuth2 pour cela
   */
  async publishResponse(
    googleReviewId: string,
    responseContent: string,
    apiKey: string,
  ): Promise<Result<void>> {
    return Result.fail(
      new Error(
        'Publishing responses is not available with Places API. Use My Business API with OAuth2 instead.',
      ),
    );
  }

  /**
   * Valide l'API Key en testant un appel simple
   */
  async validateCredentials(apiKey: string): Promise<Result<boolean>> {
    try {
      // Test avec le Place ID du Google HQ à Mountain View
      const testPlaceId = 'ChIJj61dQgK6j4AR4GeTYWZsKWw';

      const response = await fetch(
        `${this.baseUrl}/places/${testPlaceId}?fields=name&key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return Result.ok(response.ok);
    } catch (error) {
      console.error('[Places API] Validation error:', error);
      return Result.ok(false);
    }
  }
}
