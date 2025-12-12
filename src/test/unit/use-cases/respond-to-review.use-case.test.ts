/**
 * RespondToReview Use Case Tests (TDD)
 * Permet à un utilisateur de répondre à un avis Google
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  RespondToReviewUseCase,
  RespondToReviewInput,
} from '@/core/use-cases/review/respond-to-review.use-case';
import { ReviewEntity } from '@/core/entities/review.entity';
import { IReviewRepository } from '@/core/repositories/review.repository.interface';
import { IResponseTemplateRepository } from '@/core/repositories/response-template.repository.interface';
import { IGoogleMyBusinessService } from '@/core/services/google-my-business.service.interface';
import { IEncryptionService } from '@/core/ports/encryption.service';
import { IStoreRepository } from '@/core/repositories/store.repository.interface';
import { StoreEntity } from '@/core/entities/store.entity';
import { ReviewId, UserId, StoreId } from '@/lib/types/branded.type';
import { Result } from '@/lib/types/result.type';

describe('RespondToReviewUseCase', () => {
  let useCase: RespondToReviewUseCase;
  let mockReviewRepo: IReviewRepository;
  let mockTemplateRepo: IResponseTemplateRepository;
  let mockGoogleService: IGoogleMyBusinessService;
  let mockEncryptionService: IEncryptionService;
  let mockStoreRepo: IStoreRepository;

  const reviewId = 'review123' as ReviewId;
  const userId = 'user123' as UserId;
  const storeId = 'store123' as StoreId;
  const responseContent = 'Merci pour votre retour ! Nous sommes ravis de vous avoir accueilli.';

  beforeEach(() => {
    mockReviewRepo = {
      findById: vi.fn(),
      save: vi.fn(),
    } as unknown as IReviewRepository;

    mockTemplateRepo = {
      incrementUsage: vi.fn(),
    } as unknown as IResponseTemplateRepository;

    mockGoogleService = {
      fetchReviews: vi.fn(),
      publishResponse: vi.fn(),
      validateCredentials: vi.fn(),
    } as unknown as IGoogleMyBusinessService;

    mockEncryptionService = {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    } as unknown as IEncryptionService;

    mockStoreRepo = {
      findById: vi.fn(),
      findBySlug: vi.fn(),
      slugExists: vi.fn(),
      findByOwner: vi.fn(),
      findActiveStores: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      countStoreCampaigns: vi.fn(),
      isOwner: vi.fn(),
      updatePaymentStatus: vi.fn(),
      getStoreStats: vi.fn(),
    } as unknown as IStoreRepository;

    useCase = new RespondToReviewUseCase(
      mockReviewRepo,
      mockTemplateRepo,
      mockGoogleService,
      mockEncryptionService,
      mockStoreRepo,
    );
  });

  describe('execute', () => {
    it('should respond to review successfully', async () => {
      const input: RespondToReviewInput = {
        reviewId,
        userId,
        responseContent,
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
        sentiment: 'POSITIVE',
        aiSuggestion: null,
        aiSentiment: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      // Mock store with Google API key configured
      const mockStore = {
        id: storeId,
        googleApiKey: 'encrypted-key',
        googleApiKeyStatus: 'configured',
      } as any;

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(mockReview);
      vi.mocked(mockReviewRepo.save).mockImplementation(async (review) => Result.ok(review));
      vi.mocked(mockStoreRepo.findById).mockResolvedValue(mockStore);
      vi.mocked(mockGoogleService.publishResponse).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reviewId).toBe(reviewId);
        expect(result.data.hasResponse).toBe(true);
        expect(result.data.responseContent).toBe(responseContent);
        expect(result.data.respondedBy).toBe(userId);
        expect(result.data.respondedAt).toBeInstanceOf(Date);
      }

      expect(mockReviewRepo.findById).toHaveBeenCalledWith(reviewId);
      expect(mockReviewRepo.save).toHaveBeenCalled();
      expect(mockStoreRepo.findById).toHaveBeenCalledWith(storeId);
      expect(mockGoogleService.publishResponse).toHaveBeenCalledWith(
        'google123',
        responseContent,
        'encrypted-key',
      );
    });

    it('should fail when review not found', async () => {
      const input: RespondToReviewInput = {
        reviewId,
        userId,
        responseContent,
      };

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(null);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ReviewNotFoundError');
        expect(result.error.message).toContain('not found');
      }
    });

    it('should fail when review already has response', async () => {
      const input: RespondToReviewInput = {
        reviewId,
        userId,
        responseContent,
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
        sentiment: 'POSITIVE',
        aiSuggestion: null,
        aiSentiment: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      const withResponse = mockReview.addResponse('Already responded', userId);
      expect(withResponse.success).toBe(true);
      if (!withResponse.success) {
        return;
      }

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(withResponse.data);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ReviewResponseError');
        expect(result.error.message).toContain('already has a response');
      }
    });

    it('should fail for response content too short', async () => {
      const input: RespondToReviewInput = {
        reviewId,
        userId,
        responseContent: 'Merci !', // Trop court (< 10 caractères)
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
        sentiment: 'POSITIVE',
        aiSuggestion: null,
        aiSentiment: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      // Mock store with Google API key configured
      const mockStore = {
        id: storeId,
        googleApiKey: 'encrypted-key',
        googleApiKeyStatus: 'configured',
      } as any;

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(mockReview);
      vi.mocked(mockStoreRepo.findById).mockResolvedValue(mockStore);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ReviewResponseError');
        expect(result.error.message).toContain('at least 10 characters');
      }
    });

    it('should fail for response content too long', async () => {
      const input: RespondToReviewInput = {
        reviewId,
        userId,
        responseContent: 'a'.repeat(5001), // Trop long (> 5000)
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
        sentiment: 'POSITIVE',
        aiSuggestion: null,
        aiSentiment: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      // Mock store with Google API key configured
      const mockStore = {
        id: storeId,
        googleApiKey: 'encrypted-key',
        googleApiKeyStatus: 'configured',
      } as any;

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(mockReview);
      vi.mocked(mockStoreRepo.findById).mockResolvedValue(mockStore);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('ReviewResponseError');
        expect(result.error.message).toContain('cannot exceed 5000 characters');
      }
    });

    it('should increment template usage when templateId provided', async () => {
      const templateId = 'template123';
      const input: RespondToReviewInput = {
        reviewId,
        userId,
        responseContent,
        templateId,
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
        sentiment: 'POSITIVE',
        aiSuggestion: null,
        aiSentiment: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      // Mock store with Google API key configured
      const mockStore = {
        id: storeId,
        googleApiKey: 'encrypted-key',
        googleApiKeyStatus: 'configured',
      } as any;

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(mockReview);
      vi.mocked(mockReviewRepo.save).mockImplementation(async (review) => Result.ok(review));
      vi.mocked(mockStoreRepo.findById).mockResolvedValue(mockStore);
      vi.mocked(mockGoogleService.publishResponse).mockResolvedValue(Result.ok(undefined));
      vi.mocked(mockTemplateRepo.incrementUsage).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(mockTemplateRepo.incrementUsage).toHaveBeenCalledWith(templateId);
    });

    it('should not increment template usage when templateId not provided', async () => {
      const input: RespondToReviewInput = {
        reviewId,
        userId,
        responseContent,
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
        sentiment: 'POSITIVE',
        aiSuggestion: null,
        aiSentiment: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });

      // Mock store with Google API key configured
      const mockStore = {
        id: storeId,
        googleApiKey: 'encrypted-key',
        googleApiKeyStatus: 'configured',
      } as any;

      vi.mocked(mockReviewRepo.findById).mockResolvedValue(mockReview);
      vi.mocked(mockReviewRepo.save).mockImplementation(async (review) => Result.ok(review));
      vi.mocked(mockStoreRepo.findById).mockResolvedValue(mockStore);
      vi.mocked(mockGoogleService.publishResponse).mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      expect(mockTemplateRepo.incrementUsage).not.toHaveBeenCalled();
    });
  });
});
