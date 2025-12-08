/**
 * SyncReviewsFromGoogle Use Case Tests (TDD)
 * Synchronise les avis Google avec la base de données
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SyncReviewsFromGoogleUseCase,
  SyncReviewsFromGoogleInput,
} from '@/core/use-cases/review/sync-reviews-from-google.use-case';
import { IReviewRepository } from '@/core/repositories/review.repository.interface';
import { IGoogleMyBusinessService } from '@/core/services/google-my-business.service.interface';
import { StoreId } from '@/lib/types/branded.type';
import { Result } from '@/lib/types/result.type';

describe('SyncReviewsFromGoogleUseCase', () => {
  let useCase: SyncReviewsFromGoogleUseCase;
  let mockReviewRepo: IReviewRepository;
  let mockGoogleService: IGoogleMyBusinessService;

  const storeId = 'store123' as StoreId;
  const googlePlaceId = 'ChIJN1t_tDeuEmsRUsoyG83frY4';

  beforeEach(() => {
    mockReviewRepo = {
      findByGoogleReviewId: vi.fn(),
      upsertMany: vi.fn(),
    } as unknown as IReviewRepository;

    mockGoogleService = {
      fetchReviews: vi.fn(),
    } as unknown as IGoogleMyBusinessService;

    useCase = new SyncReviewsFromGoogleUseCase(mockReviewRepo, mockGoogleService);
  });

  describe('execute', () => {
    it('should sync new reviews successfully', async () => {
      const input: SyncReviewsFromGoogleInput = {
        storeId,
        googlePlaceId,
      };

      // Mock Google API response
      const googleReviews = [
        {
          googleReviewId: 'review1',
          authorName: 'John Doe',
          rating: 5,
          comment: 'Great service!',
          reviewUrl: 'https://maps.google.com/review/1',
          publishedAt: new Date('2024-01-01'),
        },
        {
          googleReviewId: 'review2',
          authorName: 'Jane Smith',
          rating: 4,
          comment: 'Good experience',
          reviewUrl: 'https://maps.google.com/review/2',
          publishedAt: new Date('2024-01-02'),
        },
      ];

      vi.mocked(mockGoogleService.fetchReviews).mockResolvedValue(Result.ok(googleReviews));
      vi.mocked(mockReviewRepo.upsertMany).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalFetched).toBe(2);
        expect(result.data.synchronized).toBe(2);
        expect(result.data.failed).toBe(0);
      }

      expect(mockGoogleService.fetchReviews).toHaveBeenCalledWith(googlePlaceId, {
        maxResults: undefined,
      });
      expect(mockReviewRepo.upsertMany).toHaveBeenCalled();
    });

    it('should handle empty response from Google', async () => {
      const input: SyncReviewsFromGoogleInput = {
        storeId,
        googlePlaceId,
      };

      vi.mocked(mockGoogleService.fetchReviews).mockResolvedValue(Result.ok([]));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalFetched).toBe(0);
        expect(result.data.synchronized).toBe(0);
        expect(result.data.failed).toBe(0);
      }

      expect(mockReviewRepo.upsertMany).not.toHaveBeenCalled();
    });

    it('should fail when Google API returns error', async () => {
      const input: SyncReviewsFromGoogleInput = {
        storeId,
        googlePlaceId,
      };

      const apiError = new Error('API authentication failed');
      vi.mocked(mockGoogleService.fetchReviews).mockResolvedValue(Result.fail(apiError));

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('GoogleApiError');
        expect(result.error.message).toContain('Failed to fetch reviews from Google');
      }
    });

    it('should fail for invalid Google Place ID', async () => {
      const input: SyncReviewsFromGoogleInput = {
        storeId,
        googlePlaceId: 'invalid-place-id',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidGooglePlaceIdError');
      }
    });

    it('should handle partial sync failures gracefully', async () => {
      const input: SyncReviewsFromGoogleInput = {
        storeId,
        googlePlaceId,
      };

      const googleReviews = [
        {
          googleReviewId: 'review1',
          authorName: 'John Doe',
          rating: 5,
          comment: 'Great!',
          reviewUrl: 'https://maps.google.com/review/1',
          publishedAt: new Date('2024-01-01'),
        },
      ];

      vi.mocked(mockGoogleService.fetchReviews).mockResolvedValue(Result.ok(googleReviews));

      // Simulate database error
      vi.mocked(mockReviewRepo.upsertMany).mockResolvedValue(
        Result.fail(new Error('Database error')),
      );

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('SyncError');
        expect(result.error.message).toContain('Failed to save reviews');
      }
    });

    it('should include storeId in created reviews', async () => {
      const input: SyncReviewsFromGoogleInput = {
        storeId,
        googlePlaceId,
      };

      const googleReviews = [
        {
          googleReviewId: 'review1',
          authorName: 'John Doe',
          rating: 5,
          reviewUrl: 'https://maps.google.com/review/1',
          publishedAt: new Date('2024-01-01'),
        },
      ];

      vi.mocked(mockGoogleService.fetchReviews).mockResolvedValue(Result.ok(googleReviews));
      vi.mocked(mockReviewRepo.upsertMany).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);

      // Verify upsertMany was called with reviews containing storeId
      expect(mockReviewRepo.upsertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            storeId,
            googlePlaceId,
          }),
        ]),
      );
    });
  });
});
