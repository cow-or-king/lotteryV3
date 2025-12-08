/**
 * Review Entity - Core Domain Logic
 * RÈGLES STRICTES:
 * - ✅ AUCUN type 'any'
 * - ✅ AUCUNE dépendance externe
 * - ✅ Result Pattern pour toutes les erreurs
 * - ✅ Branded Types pour tous les IDs
 * - ✅ Types explicites partout
 */

import { Result } from '@/shared/types/result.type';
import { ReviewId, StoreId, CampaignId, ParticipantId, UserId } from '@/shared/types/branded.type';

// Domain Errors
export class InvalidReviewDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidReviewDataError';
  }
}

export class ReviewResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewResponseError';
  }
}

export class ReviewVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewVerificationError';
  }
}

// Types
export type ReviewStatus = 'NEW' | 'RESPONDED' | 'VERIFIED' | 'ARCHIVED';
export type ReviewSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface AISuggestion {
  readonly suggestedResponse: string;
  readonly confidence: number;
  readonly tone: 'professional' | 'friendly' | 'apologetic';
}

export interface CreateReviewProps {
  readonly googleReviewId: string;
  readonly storeId: StoreId;
  readonly campaignId?: CampaignId;
  readonly authorName: string;
  readonly authorEmail?: string;
  readonly authorGoogleId?: string;
  readonly authorPhotoUrl?: string;
  readonly rating: number;
  readonly comment?: string;
  readonly reviewUrl: string;
  readonly googlePlaceId: string;
  readonly photoUrl?: string;
  readonly publishedAt: Date;
}

export interface ReviewProps {
  readonly id: ReviewId;
  readonly googleReviewId: string;
  readonly storeId: StoreId;
  readonly campaignId: CampaignId | null;
  readonly authorName: string;
  readonly authorEmail: string | null;
  readonly authorGoogleId: string | null;
  readonly authorPhotoUrl: string | null;
  readonly rating: number;
  readonly comment: string | null;
  readonly reviewUrl: string;
  readonly googlePlaceId: string;
  readonly photoUrl: string | null;
  readonly publishedAt: Date;
  readonly hasResponse: boolean;
  readonly responseContent: string | null;
  readonly respondedAt: Date | null;
  readonly respondedBy: UserId | null;
  readonly isVerified: boolean;
  readonly participantId: ParticipantId | null;
  readonly status: ReviewStatus;
  readonly sentiment: ReviewSentiment | null;
  readonly aiSuggestion: AISuggestion | null;
  readonly aiSentiment: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Review Entity
 * Encapsule toute la logique métier liée aux avis Google
 */
export class ReviewEntity {
  private constructor(private readonly props: ReviewProps) {}

  // Factory Methods
  static create(props: CreateReviewProps): Result<ReviewEntity> {
    // Validation
    if (!props.googleReviewId || props.googleReviewId.trim().length === 0) {
      return Result.fail(new InvalidReviewDataError('Google Review ID is required'));
    }

    if (!props.authorName || props.authorName.trim().length === 0) {
      return Result.fail(new InvalidReviewDataError('Author name is required'));
    }

    if (props.rating < 1 || props.rating > 5) {
      return Result.fail(new InvalidReviewDataError('Rating must be between 1 and 5'));
    }

    const now = new Date();
    const reviewId = this.generateReviewId();

    const review = new ReviewEntity({
      id: reviewId,
      googleReviewId: props.googleReviewId,
      storeId: props.storeId,
      campaignId: props.campaignId ?? null,
      authorName: props.authorName,
      authorEmail: props.authorEmail ?? null,
      authorGoogleId: props.authorGoogleId ?? null,
      authorPhotoUrl: props.authorPhotoUrl ?? null,
      rating: props.rating,
      comment: props.comment ?? null,
      reviewUrl: props.reviewUrl,
      googlePlaceId: props.googlePlaceId,
      photoUrl: props.photoUrl ?? null,
      publishedAt: props.publishedAt,
      hasResponse: false,
      responseContent: null,
      respondedAt: null,
      respondedBy: null,
      isVerified: false,
      participantId: null,
      status: 'NEW',
      sentiment: this.calculateSentiment(props.rating),
      aiSuggestion: null,
      aiSentiment: null,
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(review);
  }

  static fromPersistence(props: ReviewProps): ReviewEntity {
    return new ReviewEntity(props);
  }

  // Getters
  get id(): ReviewId {
    return this.props.id;
  }

  get googleReviewId(): string {
    return this.props.googleReviewId;
  }

  get storeId(): StoreId {
    return this.props.storeId;
  }

  get campaignId(): CampaignId | null {
    return this.props.campaignId;
  }

  get authorName(): string {
    return this.props.authorName;
  }

  get authorEmail(): string | null {
    return this.props.authorEmail;
  }

  get authorGoogleId(): string | null {
    return this.props.authorGoogleId;
  }

  get authorPhotoUrl(): string | null {
    return this.props.authorPhotoUrl;
  }

  get rating(): number {
    return this.props.rating;
  }

  get comment(): string | null {
    return this.props.comment;
  }

  get reviewUrl(): string {
    return this.props.reviewUrl;
  }

  get googlePlaceId(): string {
    return this.props.googlePlaceId;
  }

  get photoUrl(): string | null {
    return this.props.photoUrl;
  }

  get publishedAt(): Date {
    return this.props.publishedAt;
  }

  get hasResponse(): boolean {
    return this.props.hasResponse;
  }

  get responseContent(): string | null {
    return this.props.responseContent;
  }

  get respondedAt(): Date | null {
    return this.props.respondedAt;
  }

  get respondedBy(): UserId | null {
    return this.props.respondedBy;
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get participantId(): ParticipantId | null {
    return this.props.participantId;
  }

  get status(): ReviewStatus {
    return this.props.status;
  }

  get sentiment(): ReviewSentiment | null {
    return this.props.sentiment;
  }

  get aiSuggestion(): AISuggestion | null {
    return this.props.aiSuggestion;
  }

  get aiSentiment(): string | null {
    return this.props.aiSentiment;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Logic
  addResponse(content: string, respondedBy: UserId): Result<ReviewEntity> {
    if (this.props.hasResponse) {
      return Result.fail(new ReviewResponseError('Review already has a response'));
    }

    if (!content || content.trim().length === 0) {
      return Result.fail(new ReviewResponseError('Response content cannot be empty'));
    }

    const updatedReview = new ReviewEntity({
      ...this.props,
      hasResponse: true,
      responseContent: content,
      respondedAt: new Date(),
      respondedBy,
      status: 'RESPONDED',
      updatedAt: new Date(),
    });

    return Result.ok(updatedReview);
  }

  markAsVerified(participantId: ParticipantId): Result<ReviewEntity> {
    if (this.props.isVerified) {
      return Result.fail(new ReviewVerificationError('Review is already verified'));
    }

    const updatedReview = new ReviewEntity({
      ...this.props,
      isVerified: true,
      participantId,
      status: 'VERIFIED',
      updatedAt: new Date(),
    });

    return Result.ok(updatedReview);
  }

  canReceiveResponse(): boolean {
    return !this.props.hasResponse;
  }

  needsAttention(): boolean {
    // Low-rated reviews without response need attention
    return this.props.rating <= 3 && !this.props.hasResponse;
  }

  isPositive(): boolean {
    return this.props.rating >= 4;
  }

  isNegative(): boolean {
    return this.props.rating <= 2;
  }

  isNeutral(): boolean {
    return this.props.rating === 3;
  }

  // Private Helpers
  private static calculateSentiment(rating: number): ReviewSentiment {
    if (rating >= 4) return 'POSITIVE';
    if (rating <= 2) return 'NEGATIVE';
    return 'NEUTRAL';
  }

  private static generateReviewId(): ReviewId {
    // In real app, this would use a proper ID generator (CUID)
    return `review_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as ReviewId;
  }

  // Serialization
  toPersistence(): ReviewProps {
    return {
      ...this.props,
    };
  }
}
