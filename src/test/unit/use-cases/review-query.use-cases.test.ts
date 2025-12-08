/**
 * Review Query Use Cases Tests (TDD)
 * Read-only queries pour les avis
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GetReviewByIdUseCase,
  GetReviewByIdInput,
} from '@/core/use-cases/review/get-review-by-id.use-case';
import {
  ListReviewsByStoreUseCase,
  ListReviewsByStoreInput,
} from '@/core/use-cases/review/list-reviews-by-store.use-case';
import {
  GetReviewStatsUseCase,
  GetReviewStatsInput,
} from '@/core/use-cases/review/get-review-stats.use-case';
import { ReviewEntity } from '@/core/entities/review.entity';
import { IReviewRepository } from '@/core/repositories/review.repository.interface';
import { ReviewId, StoreId } from '@/shared/types/branded.type';
import { Result } from '@/shared/types/result.type';

describe('Review Query Use Cases', () => {
  let mockReviewRepo: IReviewRepository;
  const reviewId = 'review123' as ReviewId;
  const storeId = 'store123' as StoreId;

  beforeEach(() => {
    mockReviewRepo = {
      findById: vi.fn(),
      findByStore: vi.fn(),
      getStatsByStore: vi.fn(),
      countByStore: vi.fn(),
    } as unknown as IReviewRepository;
  });

  describe('GetReviewByIdUseCase', () => {
    let useCase: GetReviewByIdUseCase;

    beforeEach(() => {
      useCase = new GetReviewByIdUseCase(mockReviewRepo);
    });

    it('should get review by id successfully', async () => {
      const input: GetReviewByIdInput = {
        reviewId,
      };

      const mockReview = ReviewEntity.fromPersistence({
        id: reviewId,
        googleReviewId: 'google123',
        storeId,
        campaignId: null,
        authorName: 'John Doe',
        authorEmail: 'john@example.com',
        authorGoogleId: null,
        authorPhotoUrl: null,
        rating: 5,
        comment: 'Great service!',
        reviewUrl: 'https://maps.google.com/review/123',
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        photoUrl: null,
        publishedAt: new Date('2024-01-01'),
        hasResponse: false,
        responseContent: null,
        respondedAt: null,
        respondedBy: null,
        isVerified: false,
        participantId: null,
        status: 'NEW',
        sentiment: 'POSITIVE',
        aiSuggestion: null,
        aiSentiment: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(mockReview);

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reviewId).toBe(reviewId);
        expect(result.data.authorName).toBe('John Doe');
        expect(result.data.rating).toBe(5);
        expect(result.data.comment).toBe('Great service!');
      }

      expect(mockReviewRepo.findById).toHaveBeenCalledWith(reviewId);
    });

    it('should fail when review not found', async () => {
      const input: GetReviewByIdInput = {
        reviewId,
      };

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(null);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ReviewNotFoundError');
        expect(result.error.message).toContain('not found');
      }
    });
  });

  describe('ListReviewsByStoreUseCase', () => {
    let useCase: ListReviewsByStoreUseCase;

    beforeEach(() => {
      useCase = new ListReviewsByStoreUseCase(mockReviewRepo);
    });

    it('should list reviews for a store', async () => {
      const input: ListReviewsByStoreInput = {
        storeId,
      };

      const mockReviews = [
        ReviewEntity.fromPersistence({
          id: 'review1' as ReviewId,
          googleReviewId: 'google1',
          storeId,
          campaignId: null,
          authorName: 'John Doe',
          authorEmail: null,
          authorGoogleId: null,
          authorPhotoUrl: null,
          rating: 5,
          comment: 'Great!',
          reviewUrl: 'https://maps.google.com/review/1',
          googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
          photoUrl: null,
          publishedAt: new Date('2024-01-01'),
          hasResponse: false,
          responseContent: null,
          respondedAt: null,
          respondedBy: null,
          isVerified: false,
          participantId: null,
          status: 'NEW',
          sentiment: 'POSITIVE',
          aiSuggestion: null,
          aiSentiment: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        }),
        ReviewEntity.fromPersistence({
          id: 'review2' as ReviewId,
          googleReviewId: 'google2',
          storeId,
          campaignId: null,
          authorName: 'Jane Smith',
          authorEmail: null,
          authorGoogleId: null,
          authorPhotoUrl: null,
          rating: 4,
          comment: 'Good!',
          reviewUrl: 'https://maps.google.com/review/2',
          googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
          photoUrl: null,
          publishedAt: new Date('2024-01-02'),
          hasResponse: false,
          responseContent: null,
          respondedAt: null,
          respondedBy: null,
          isVerified: false,
          participantId: null,
          status: 'NEW',
          sentiment: 'POSITIVE',
          aiSuggestion: null,
          aiSentiment: null,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        }),
      ];

      vi.mocked(mockReviewRepo.findByStore).mockResolvedValue(mockReviews);
      vi.mocked(mockReviewRepo.countByStore).mockResolvedValue(2);

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reviews).toHaveLength(2);
        expect(result.data.total).toBe(2);
        expect(result.data.reviews[0].rating).toBe(5);
        expect(result.data.reviews[1].rating).toBe(4);
      }

      expect(mockReviewRepo.findByStore).toHaveBeenCalledWith(
        storeId,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should filter reviews by rating', async () => {
      const input: ListReviewsByStoreInput = {
        storeId,
        filters: {
          rating: 5,
        },
      };

      const mockReview = ReviewEntity.fromPersistence({
        id: reviewId,
        googleReviewId: 'google123',
        storeId,
        campaignId: null,
        authorName: 'John Doe',
        authorEmail: null,
        authorGoogleId: null,
        authorPhotoUrl: null,
        rating: 5,
        comment: 'Excellent!',
        reviewUrl: 'https://maps.google.com/review/123',
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        photoUrl: null,
        publishedAt: new Date('2024-01-01'),
        hasResponse: false,
        responseContent: null,
        respondedAt: null,
        respondedBy: null,
        isVerified: false,
        participantId: null,
        status: 'NEW',
        sentiment: 'POSITIVE',
        aiSuggestion: null,
        aiSentiment: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      vi.mocked(mockReviewRepo.findByStore).mockResolvedValue([mockReview]);
      vi.mocked(mockReviewRepo.countByStore).mockResolvedValue(1);

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reviews).toHaveLength(1);
        expect(result.data.reviews[0].rating).toBe(5);
      }

      expect(mockReviewRepo.findByStore).toHaveBeenCalledWith(
        storeId,
        { rating: 5 },
        undefined,
        undefined,
      );
    });

    it('should support pagination', async () => {
      const input: ListReviewsByStoreInput = {
        storeId,
        limit: 10,
        offset: 0,
      };

      vi.mocked(mockReviewRepo.findByStore).mockResolvedValue([]);
      vi.mocked(mockReviewRepo.countByStore).mockResolvedValue(0);

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);

      expect(mockReviewRepo.findByStore).toHaveBeenCalledWith(storeId, undefined, 10, 0);
    });
  });

  describe('GetReviewStatsUseCase', () => {
    let useCase: GetReviewStatsUseCase;

    beforeEach(() => {
      useCase = new GetReviewStatsUseCase(mockReviewRepo);
    });

    it('should get review statistics for a store', async () => {
      const input: GetReviewStatsInput = {
        storeId,
      };

      const mockStats = {
        total: 100,
        averageRating: 4.5,
        ratingDistribution: {
          1: 5,
          2: 5,
          3: 10,
          4: 30,
          5: 50,
        },
        responseRate: 75,
        positiveCount: 80,
        neutralCount: 10,
        negativeCount: 10,
        needsAttentionCount: 5,
      };

      vi.mocked(mockReviewRepo.getStatsByStore).mockResolvedValue(mockStats);

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.total).toBe(100);
        expect(result.data.averageRating).toBe(4.5);
        expect(result.data.responseRate).toBe(75);
        expect(result.data.positiveCount).toBe(80);
        expect(result.data.ratingDistribution[5]).toBe(50);
      }

      expect(mockReviewRepo.getStatsByStore).toHaveBeenCalledWith(storeId, undefined);
    });

    it('should get statistics with date filters', async () => {
      const input: GetReviewStatsInput = {
        storeId,
        filters: {
          fromDate: new Date('2024-01-01'),
          toDate: new Date('2024-12-31'),
        },
      };

      const mockStats = {
        total: 50,
        averageRating: 4.8,
        ratingDistribution: { 1: 0, 2: 0, 3: 5, 4: 15, 5: 30 },
        responseRate: 90,
        positiveCount: 45,
        neutralCount: 5,
        negativeCount: 0,
        needsAttentionCount: 0,
      };

      vi.mocked(mockReviewRepo.getStatsByStore).mockResolvedValue(mockStats);

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.total).toBe(50);
        expect(result.data.averageRating).toBe(4.8);
      }

      expect(mockReviewRepo.getStatsByStore).toHaveBeenCalledWith(storeId, {
        fromDate: new Date('2024-01-01'),
        toDate: new Date('2024-12-31'),
      });
    });
  });
});
