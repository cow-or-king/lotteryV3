/**
 * Review Entity Tests (TDD)
 */

import { describe, it, expect } from 'vitest';
import { ReviewEntity, CreateReviewProps, ReviewProps } from '@/core/entities/review.entity';
import { ReviewId, StoreId, CampaignId, ParticipantId, UserId } from '@/lib/types/branded.type';

describe('ReviewEntity', () => {
  const storeId = 'store123' as StoreId;
  const campaignId = 'campaign123' as CampaignId;
  const userId = 'user123' as UserId;

  const validCreateProps: CreateReviewProps = {
    googleReviewId: 'google_review_123',
    storeId,
    authorName: 'John Doe',
    rating: 5,
    reviewUrl: 'https://maps.google.com/review/123',
    googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    publishedAt: new Date('2024-01-01'),
  };

  describe('create', () => {
    it('should create a valid review with required fields only', () => {
      const result = ReviewEntity.create(validCreateProps);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.googleReviewId).toBe('google_review_123');
        expect(result.data.storeId).toBe(storeId);
        expect(result.data.authorName).toBe('John Doe');
        expect(result.data.rating).toBe(5);
        expect(result.data.status).toBe('NEW');
        expect(result.data.hasResponse).toBe(false);
        expect(result.data.isVerified).toBe(false);
      }
    });

    it('should create a review with optional fields', () => {
      const propsWithOptionals: CreateReviewProps = {
        ...validCreateProps,
        campaignId,
        authorEmail: 'john@example.com',
        comment: 'Great service!',
        authorGoogleId: 'google_author_123',
      };

      const result = ReviewEntity.create(propsWithOptionals);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.campaignId).toBe(campaignId);
        expect(result.data.authorEmail).toBe('john@example.com');
        expect(result.data.comment).toBe('Great service!');
      }
    });

    it('should fail for invalid rating (< 1)', () => {
      const props = { ...validCreateProps, rating: 0 };
      const result = ReviewEntity.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidReviewDataError');
        expect(result.error.message).toContain('Rating must be between 1 and 5');
      }
    });

    it('should fail for invalid rating (> 5)', () => {
      const props = { ...validCreateProps, rating: 6 };
      const result = ReviewEntity.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidReviewDataError');
        expect(result.error.message).toContain('Rating must be between 1 and 5');
      }
    });

    it('should fail for empty googleReviewId', () => {
      const props = { ...validCreateProps, googleReviewId: '' };
      const result = ReviewEntity.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidReviewDataError');
        expect(result.error.message).toContain('Google Review ID is required');
      }
    });

    it('should fail for empty authorName', () => {
      const props = { ...validCreateProps, authorName: '' };
      const result = ReviewEntity.create(props);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidReviewDataError');
        expect(result.error.message).toContain('Author name is required');
      }
    });

    it('should accept valid ratings (1-5)', () => {
      [1, 2, 3, 4, 5].forEach((rating) => {
        const props = { ...validCreateProps, rating };
        const result = ReviewEntity.create(props);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('fromPersistence', () => {
    it('should reconstitute a review from persistence', () => {
      const reviewId = 'review123' as ReviewId;
      const props: ReviewProps = {
        id: reviewId,
        googleReviewId: 'google_review_123',
        storeId,
        campaignId: null,
        authorName: 'John Doe',
        authorEmail: null,
        authorGoogleId: null,
        authorPhotoUrl: null,
        rating: 5,
        comment: null,
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
        sentiment: null,
        aiSuggestion: null,
        aiSentiment: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const review = ReviewEntity.fromPersistence(props);

      expect(review.id).toBe(reviewId);
      expect(review.googleReviewId).toBe('google_review_123');
      expect(review.status).toBe('NEW');
    });
  });

  describe('addResponse', () => {
    it('should add a response to a review without response', () => {
      const reviewResult = ReviewEntity.create(validCreateProps);
      expect(reviewResult.success).toBe(true);

      if (reviewResult.success) {
        const result = reviewResult.data.addResponse('Thank you for your feedback!', userId);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.hasResponse).toBe(true);
          expect(result.data.responseContent).toBe('Thank you for your feedback!');
          expect(result.data.respondedBy).toBe(userId);
          expect(result.data.respondedAt).toBeInstanceOf(Date);
          expect(result.data.status).toBe('RESPONDED');
        }
      }
    });

    it('should fail to add response if already has response', () => {
      const reviewResult = ReviewEntity.create(validCreateProps);
      expect(reviewResult.success).toBe(true);

      if (reviewResult.success) {
        const withResponse = reviewResult.data.addResponse('First response', userId);
        expect(withResponse.success).toBe(true);

        if (withResponse.success) {
          const result = withResponse.data.addResponse('Second response', userId);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.name).toBe('ReviewResponseError');
            expect(result.error.message).toContain('already has a response');
          }
        }
      }
    });

    it('should fail for empty response content', () => {
      const reviewResult = ReviewEntity.create(validCreateProps);
      expect(reviewResult.success).toBe(true);

      if (reviewResult.success) {
        const result = reviewResult.data.addResponse('', userId);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.name).toBe('ReviewResponseError');
          expect(result.error.message).toContain('Response content cannot be empty');
        }
      }
    });
  });

  describe('markAsVerified', () => {
    it('should mark review as verified with participant', () => {
      const participantId = 'participant123' as ParticipantId;
      const reviewResult = ReviewEntity.create(validCreateProps);
      expect(reviewResult.success).toBe(true);

      if (reviewResult.success) {
        const result = reviewResult.data.markAsVerified(participantId);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.isVerified).toBe(true);
          expect(result.data.participantId).toBe(participantId);
          expect(result.data.status).toBe('VERIFIED');
        }
      }
    });

    it('should fail if already verified', () => {
      const participantId = 'participant123' as ParticipantId;
      const reviewResult = ReviewEntity.create(validCreateProps);
      expect(reviewResult.success).toBe(true);

      if (reviewResult.success) {
        const verified = reviewResult.data.markAsVerified(participantId);
        expect(verified.success).toBe(true);

        if (verified.success) {
          const result = verified.data.markAsVerified(participantId);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.name).toBe('ReviewVerificationError');
            expect(result.error.message).toContain('already verified');
          }
        }
      }
    });
  });

  describe('needsAttention', () => {
    it('should return true for low-rated review without response', () => {
      const lowRatedProps = { ...validCreateProps, rating: 2 };
      const reviewResult = ReviewEntity.create(lowRatedProps);

      expect(reviewResult.success).toBe(true);
      if (reviewResult.success) {
        expect(reviewResult.data.needsAttention()).toBe(true);
      }
    });

    it('should return false for low-rated review with response', () => {
      const lowRatedProps = { ...validCreateProps, rating: 2 };
      const reviewResult = ReviewEntity.create(lowRatedProps);

      expect(reviewResult.success).toBe(true);
      if (reviewResult.success) {
        const withResponse = reviewResult.data.addResponse('We are sorry', userId);
        expect(withResponse.success).toBe(true);

        if (withResponse.success) {
          expect(withResponse.data.needsAttention()).toBe(false);
        }
      }
    });

    it('should return false for high-rated review without response', () => {
      const highRatedProps = { ...validCreateProps, rating: 5 };
      const reviewResult = ReviewEntity.create(highRatedProps);

      expect(reviewResult.success).toBe(true);
      if (reviewResult.success) {
        expect(reviewResult.data.needsAttention()).toBe(false);
      }
    });
  });

  describe('isPositive', () => {
    it('should return true for rating >= 4', () => {
      const props4 = { ...validCreateProps, rating: 4 };
      const props5 = { ...validCreateProps, rating: 5 };

      const review4 = ReviewEntity.create(props4);
      const review5 = ReviewEntity.create(props5);

      expect(review4.success && review4.data.isPositive()).toBe(true);
      expect(review5.success && review5.data.isPositive()).toBe(true);
    });

    it('should return false for rating < 4', () => {
      [1, 2, 3].forEach((rating) => {
        const props = { ...validCreateProps, rating };
        const result = ReviewEntity.create(props);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.isPositive()).toBe(false);
        }
      });
    });
  });

  describe('canReceiveResponse', () => {
    it('should return true when no response exists', () => {
      const reviewResult = ReviewEntity.create(validCreateProps);

      expect(reviewResult.success).toBe(true);
      if (reviewResult.success) {
        expect(reviewResult.data.canReceiveResponse()).toBe(true);
      }
    });

    it('should return false when response exists', () => {
      const reviewResult = ReviewEntity.create(validCreateProps);

      expect(reviewResult.success).toBe(true);
      if (reviewResult.success) {
        const withResponse = reviewResult.data.addResponse('Thank you!', userId);
        expect(withResponse.success).toBe(true);

        if (withResponse.success) {
          expect(withResponse.data.canReceiveResponse()).toBe(false);
        }
      }
    });
  });
});
