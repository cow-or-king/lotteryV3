/**
 * Google My Business Mock Service
 * Service mock avec fake reviews pour tester l'UI sans Google API
 *
 * UTILISATION:
 * - En dev: Remplacer GoogleMyBusinessService par GoogleMyBusinessMockService
 * - En prod: Utiliser le vrai service avec API keys
 */

import { Result } from '@/shared/types/result.type';
import type {
  IGoogleMyBusinessService,
  GoogleReviewData,
  FetchReviewsOptions,
} from '@/core/ports/google-my-business.port';

/**
 * Service mock pour simuler l'API Google My Business
 */
export class GoogleMyBusinessMockService implements IGoogleMyBusinessService {
  // Base de données fake en mémoire
  private mockReviews: Map<string, GoogleReviewData[]> = new Map();

  constructor() {
    // Initialiser avec des reviews de test
    this.initializeMockData();
  }

  /**
   * Initialise des données de test variées
   */
  private initializeMockData(): void {
    const testPlaceId = 'ChIJN1t_tDeuEmsRUsoyG83frY4'; // Exemple Google Place ID

    const mockReviewsData: GoogleReviewData[] = [
      {
        googleReviewId: 'mock_review_1',
        authorName: 'Sophie Martin',
        rating: 5,
        comment:
          "Service exceptionnel ! L'équipe est très professionnelle et accueillante. Je recommande vivement !",
        reviewUrl: `https://www.google.com/maps/reviews/${testPlaceId}?review=1`,
        publishedAt: new Date('2025-01-05'),
      },
      {
        googleReviewId: 'mock_review_2',
        authorName: 'Thomas Dubois',
        rating: 5,
        comment:
          "Excellent rapport qualité-prix. Très satisfait de mon expérience. Merci à toute l'équipe !",
        reviewUrl: `https://www.google.com/maps/reviews/${testPlaceId}?review=2`,
        publishedAt: new Date('2025-01-04'),
      },
      {
        googleReviewId: 'mock_review_3',
        authorName: 'Marie Lefebvre',
        rating: 4,
        comment:
          "Très bon accueil. Quelques petits points à améliorer mais dans l'ensemble très bien.",
        reviewUrl: `https://www.google.com/maps/reviews/${testPlaceId}?review=3`,
        publishedAt: new Date('2025-01-03'),
      },
      {
        googleReviewId: 'mock_review_4',
        authorName: 'Pierre Bernard',
        rating: 3,
        comment: "Correct sans plus. Le service était moyen, rien d'exceptionnel.",
        reviewUrl: `https://www.google.com/maps/reviews/${testPlaceId}?review=4`,
        publishedAt: new Date('2025-01-02'),
      },
      {
        googleReviewId: 'mock_review_5',
        authorName: 'Julie Moreau',
        rating: 2,
        comment: 'Déçue par le service. Attente trop longue et personnel peu aimable.',
        reviewUrl: `https://www.google.com/maps/reviews/${testPlaceId}?review=5`,
        publishedAt: new Date('2025-01-01'),
      },
      {
        googleReviewId: 'mock_review_6',
        authorName: 'Lucas Petit',
        rating: 1,
        comment:
          'Très mauvaise expérience. Service désagréable et qualité médiocre. Je ne reviendrai pas.',
        reviewUrl: `https://www.google.com/maps/reviews/${testPlaceId}?review=6`,
        publishedAt: new Date('2024-12-31'),
      },
      {
        googleReviewId: 'mock_review_7',
        authorName: 'Emma Roux',
        rating: 5,
        comment: 'Parfait ! Tout était impeccable. Une adresse à retenir absolument.',
        reviewUrl: `https://www.google.com/maps/reviews/${testPlaceId}?review=7`,
        publishedAt: new Date('2024-12-30'),
      },
      {
        googleReviewId: 'mock_review_8',
        authorName: 'Antoine Laurent',
        rating: 4,
        comment: "Bonne prestation. Personnel compétent et à l'écoute.",
        reviewUrl: `https://www.google.com/maps/reviews/${testPlaceId}?review=8`,
        publishedAt: new Date('2024-12-29'),
      },
      {
        googleReviewId: 'mock_review_9',
        authorName: 'Camille Simon',
        rating: 5,
        comment: null, // Avis sans commentaire (juste étoiles)
        reviewUrl: `https://www.google.com/maps/reviews/${testPlaceId}?review=9`,
        publishedAt: new Date('2024-12-28'),
      },
      {
        googleReviewId: 'mock_review_10',
        authorName: 'Nicolas Michel',
        rating: 3,
        comment: 'Moyen. Ni bon ni mauvais, dans la moyenne.',
        reviewUrl: `https://www.google.com/maps/reviews/${testPlaceId}?review=10`,
        publishedAt: new Date('2024-12-27'),
      },
    ];

    // Stocker pour n'importe quel Place ID (pour simplifier les tests)
    this.mockReviews.set('*', mockReviewsData);
  }

  /**
   * Récupère les avis mock
   */
  async fetchReviews(
    googlePlaceId: string,
    options?: FetchReviewsOptions,
  ): Promise<Result<readonly GoogleReviewData[]>> {
    // Simuler un délai réseau
    await this.simulateNetworkDelay();

    console.log(`[MOCK] Fetching reviews for place ${googlePlaceId}`);

    // Récupérer les reviews mock
    let reviews = this.mockReviews.get('*') || [];

    // Appliquer le filtre minRating si fourni
    if (options?.minRating) {
      reviews = reviews.filter((r) => r.rating >= options.minRating!);
    }

    // Appliquer la limite si fournie
    if (options?.limit) {
      reviews = reviews.slice(0, options.limit);
    }

    console.log(`[MOCK] Returning ${reviews.length} mock reviews`);

    return Result.ok(reviews);
  }

  /**
   * Publie une réponse mock (ne fait rien en réalité)
   */
  async publishResponse(
    googleReviewId: string,
    responseContent: string,
    apiKey: string,
  ): Promise<Result<void>> {
    // Simuler un délai réseau
    await this.simulateNetworkDelay();

    console.log(`[MOCK] Publishing response to review ${googleReviewId}`);
    console.log(`[MOCK] Response content: ${responseContent.substring(0, 100)}...`);
    console.log(`[MOCK] Using API key: ${apiKey.substring(0, 10)}...`);

    // Simuler un succès
    return Result.ok(undefined);
  }

  /**
   * Valide des credentials mock (toujours succès)
   */
  async validateCredentials(apiKey: string): Promise<Result<boolean>> {
    await this.simulateNetworkDelay();

    console.log(`[MOCK] Validating API key: ${apiKey.substring(0, 10)}...`);

    // Accepter n'importe quelle clé qui commence par "mock_" ou "test_"
    const isValid = apiKey.startsWith('mock_') || apiKey.startsWith('test_');

    return Result.ok(isValid);
  }

  /**
   * Simule un délai réseau de 300-800ms
   */
  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 500 + 300; // 300-800ms
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Méthode utilitaire pour ajouter dynamiquement des reviews de test
   */
  addMockReview(placeId: string, review: GoogleReviewData): void {
    const existing = this.mockReviews.get(placeId) || [];
    this.mockReviews.set(placeId, [...existing, review]);
  }

  /**
   * Réinitialise les données mock
   */
  resetMockData(): void {
    this.mockReviews.clear();
    this.initializeMockData();
  }
}
