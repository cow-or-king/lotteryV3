/**
 * Review Mapper
 * Transforme entre Prisma models et Domain entities
 * IMPORTANT: Couche infrastructure, dépendance à Prisma OK
 */

import { Review as PrismaReview } from '@prisma/client';
import { ReviewEntity, ReviewProps, CreateReviewProps } from '@/core/entities/review.entity';
import { ReviewId, StoreId, CampaignId, ParticipantId, UserId } from '@/shared/types/branded.type';
import { ReviewStatus, ReviewSentiment } from '@/core/entities/review.entity';

/**
 * Convertit un modèle Prisma en props d'entité Domain
 */
export function toDomainProps(prismaReview: PrismaReview): ReviewProps {
  return {
    id: prismaReview.id as ReviewId,
    googleReviewId: prismaReview.googleReviewId,
    storeId: prismaReview.storeId as StoreId,
    campaignId: prismaReview.campaignId as CampaignId | null,
    authorName: prismaReview.authorName,
    authorEmail: prismaReview.authorEmail,
    authorGoogleId: prismaReview.authorGoogleId,
    authorPhotoUrl: prismaReview.authorPhotoUrl,
    rating: prismaReview.rating,
    comment: prismaReview.comment,
    reviewUrl: prismaReview.reviewUrl,
    googlePlaceId: prismaReview.googlePlaceId,
    photoUrl: prismaReview.photoUrl,
    publishedAt: prismaReview.publishedAt,
    hasResponse: prismaReview.hasResponse,
    responseContent: prismaReview.responseContent,
    respondedAt: prismaReview.respondedAt,
    respondedBy: prismaReview.respondedBy as UserId | null,
    isVerified: prismaReview.isVerified,
    participantId: prismaReview.participantId as ParticipantId | null,
    status: prismaReview.status as ReviewStatus,
    sentiment: prismaReview.sentiment as ReviewSentiment | null,
    aiSuggestion: prismaReview.aiSuggestion ? JSON.parse(prismaReview.aiSuggestion) : null,
    aiSentiment: prismaReview.aiSentiment,
    createdAt: prismaReview.createdAt,
    updatedAt: prismaReview.updatedAt,
  };
}

/**
 * Convertit un modèle Prisma en entité Domain
 */
export function toDomain(prismaReview: PrismaReview): ReviewEntity {
  return ReviewEntity.fromPersistence(toDomainProps(prismaReview));
}

/**
 * Convertit une entité Domain en données Prisma pour création
 */
export function toCreateData(props: CreateReviewProps) {
  return {
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
  };
}

/**
 * Convertit une entité Domain en données Prisma pour mise à jour
 */
export function toUpdateData(review: ReviewEntity) {
  return {
    hasResponse: review.hasResponse,
    responseContent: review.responseContent,
    respondedAt: review.respondedAt,
    respondedBy: review.respondedBy,
    isVerified: review.isVerified,
    participantId: review.participantId,
    status: review.status,
    sentiment: review.sentiment,
    aiSuggestion: review.aiSuggestion ? JSON.stringify(review.aiSuggestion) : null,
    aiSentiment: review.aiSentiment,
    updatedAt: new Date(),
  };
}
