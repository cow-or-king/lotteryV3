/**
 * VerifyReviewParticipant Use Case Tests (TDD)
 * Use Case critique pour la loterie: vérifie qu'un participant a laissé un avis
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  VerifyReviewParticipantUseCase,
  VerifyReviewParticipantInput,
} from '@/core/use-cases/review/verify-review-participant.use-case';
import { ReviewEntity } from '@/core/entities/review.entity';
import { IReviewRepository } from '@/core/repositories/review.repository.interface';
import { StoreId, ParticipantId, CampaignId } from '@/lib/types/branded.type';
import { Result } from '@/lib/types/result.type';

describe('VerifyReviewParticipantUseCase', () => {
  let useCase: VerifyReviewParticipantUseCase;
  let mockReviewRepo: IReviewRepository;

  const storeId = 'store123' as StoreId;
  const participantId = 'participant123' as ParticipantId;
  const campaignId = 'campaign123' as CampaignId;
  const email = 'john@example.com';

  beforeEach(() => {
    // Mock repositories
    mockReviewRepo = {
      findByEmailAndStore: vi.fn(),
      save: vi.fn(),
    } as unknown as IReviewRepository;

    useCase = new VerifyReviewParticipantUseCase(mockReviewRepo);
  });

  describe('execute', () => {
    it('should verify review and link to participant successfully', async () => {
      const input: VerifyReviewParticipantInput = {
        email,
        storeId,
        campaignId,
        participantId,
      };

      // Mock review exists
      const mockReview = ReviewEntity.create({
        googleReviewId: 'google123',
        storeId,
        authorName: 'John Doe',
        authorEmail: email,
        rating: 5,
        comment: 'Great service!',
        reviewUrl: 'https://maps.google.com/review/123',
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        publishedAt: new Date('2024-01-01'),
      });

      expect(mockReview.success).toBe(true);
      if (!mockReview.success) return;

      vi.mocked(mockReviewRepo.findByEmailAndStore).mockResolvedValue(mockReview.data);
      vi.mocked(mockReviewRepo.save).mockImplementation(async (review) => Result.ok(review));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isVerified).toBe(true);
        expect(result.data.reviewId).toBeDefined();
        expect(result.data.rating).toBe(5);
        expect(result.data.comment).toBe('Great service!');
      }

      expect(mockReviewRepo.findByEmailAndStore).toHaveBeenCalledWith(email, storeId);
      expect(mockReviewRepo.save).toHaveBeenCalled();
    });

    it('should fail when no review found for email and store', async () => {
      const input: VerifyReviewParticipantInput = {
        email,
        storeId,
        campaignId,
        participantId,
      };

      vi.mocked(mockReviewRepo.findByEmailAndStore).mockResolvedValue(null);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ReviewNotFoundError');
        expect(result.error.message).toContain('No review found');
      }
    });

    it('should fail for invalid email format', async () => {
      const input: VerifyReviewParticipantInput = {
        email: 'invalid-email',
        storeId,
        campaignId,
        participantId,
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidEmailError');
      }
    });

    it('should handle already verified review gracefully', async () => {
      const input: VerifyReviewParticipantInput = {
        email,
        storeId,
        campaignId,
        participantId,
      };

      // Create review and mark as verified
      const mockReviewResult = ReviewEntity.create({
        googleReviewId: 'google123',
        storeId,
        authorName: 'John Doe',
        authorEmail: email,
        rating: 5,
        reviewUrl: 'https://maps.google.com/review/123',
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        publishedAt: new Date('2024-01-01'),
      });

      expect(mockReviewResult.success).toBe(true);
      if (!mockReviewResult.success) return;

      const verifiedResult = mockReviewResult.data.markAsVerified(participantId);
      expect(verifiedResult.success).toBe(true);
      if (!verifiedResult.success) return;

      vi.mocked(mockReviewRepo.findByEmailAndStore).mockResolvedValue(verifiedResult.data);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ReviewVerificationError');
        expect(result.error.message).toContain('already verified');
      }
    });

    it('should verify review even without authorEmail if name matches', async () => {
      const input: VerifyReviewParticipantInput = {
        email,
        storeId,
        campaignId,
        participantId,
      };

      // Review without email but findByEmailAndStore found it (by name matching in repo)
      const mockReview = ReviewEntity.create({
        googleReviewId: 'google123',
        storeId,
        authorName: 'John Doe',
        rating: 4,
        reviewUrl: 'https://maps.google.com/review/123',
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        publishedAt: new Date('2024-01-01'),
      });

      expect(mockReview.success).toBe(true);
      if (!mockReview.success) return;

      vi.mocked(mockReviewRepo.findByEmailAndStore).mockResolvedValue(mockReview.data);
      vi.mocked(mockReviewRepo.save).mockImplementation(async (review) => Result.ok(review));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isVerified).toBe(true);
        expect(result.data.rating).toBe(4);
      }
    });

    it('should return positive flag for rating >= 4', async () => {
      const input: VerifyReviewParticipantInput = {
        email,
        storeId,
        campaignId,
        participantId,
      };

      const mockReview = ReviewEntity.create({
        googleReviewId: 'google123',
        storeId,
        authorName: 'John Doe',
        authorEmail: email,
        rating: 4,
        reviewUrl: 'https://maps.google.com/review/123',
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        publishedAt: new Date('2024-01-01'),
      });

      expect(mockReview.success).toBe(true);
      if (!mockReview.success) return;

      vi.mocked(mockReviewRepo.findByEmailAndStore).mockResolvedValue(mockReview.data);
      vi.mocked(mockReviewRepo.save).mockImplementation(async (review) => Result.ok(review));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isPositive).toBe(true);
      }
    });

    it('should return negative flag for rating <= 2', async () => {
      const input: VerifyReviewParticipantInput = {
        email,
        storeId,
        campaignId,
        participantId,
      };

      const mockReview = ReviewEntity.create({
        googleReviewId: 'google123',
        storeId,
        authorName: 'John Doe',
        authorEmail: email,
        rating: 2,
        reviewUrl: 'https://maps.google.com/review/123',
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        publishedAt: new Date('2024-01-01'),
      });

      expect(mockReview.success).toBe(true);
      if (!mockReview.success) return;

      vi.mocked(mockReviewRepo.findByEmailAndStore).mockResolvedValue(mockReview.data);
      vi.mocked(mockReviewRepo.save).mockImplementation(async (review) => Result.ok(review));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isPositive).toBe(false);
      }
    });
  });
});
