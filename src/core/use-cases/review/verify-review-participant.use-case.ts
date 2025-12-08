/**
 * Verify Review Participant Use Case
 * Use Case CRITIQUE pour la loterie: v�rifie qu'un participant a laiss� un avis
 * IMPORTANT: Pure business logic, pas de d�pendance au framework
 */

import { Result } from '@/lib/types/result.type';
import { Email } from '@/core/value-objects/email.vo';
import { ReviewVerificationError } from '@/core/entities/review.entity';
import { IReviewRepository } from '@/core/repositories/review.repository.interface';
import { StoreId, CampaignId, ParticipantId, ReviewId } from '@/lib/types/branded.type';

// DTO pour l'input
export interface VerifyReviewParticipantInput {
  readonly email: string;
  readonly storeId: StoreId;
  readonly campaignId: CampaignId;
  readonly participantId: ParticipantId;
}

// DTO pour l'output
export interface VerifyReviewParticipantOutput {
  readonly reviewId: ReviewId;
  readonly isVerified: boolean;
  readonly rating: number;
  readonly comment: string | null;
  readonly publishedAt: Date;
  readonly isPositive: boolean;
}

// Domain Errors
export class ReviewNotFoundError extends Error {
  constructor(email: string, storeId: StoreId) {
    super(`No review found for email ${email} at store ${storeId}`);
    this.name = 'ReviewNotFoundError';
  }
}

/**
 * Use Case: Verify Review Participant
 * V�rifie qu'un participant a bien laiss� un avis Google avant de participer � la loterie
 */
export class VerifyReviewParticipantUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(
    input: VerifyReviewParticipantInput,
  ): Promise<Result<VerifyReviewParticipantOutput>> {
    // 1. Valider l'email
    const emailResult = Email.create(input.email);
    if (!emailResult.success) {
      return Result.fail(emailResult.error);
    }

    // 2. Chercher un avis pour cet email et ce store
    const review = await this.reviewRepository.findByEmailAndStore(input.email, input.storeId);

    if (!review) {
      return Result.fail(new ReviewNotFoundError(input.email, input.storeId));
    }

    // 3. Vérifier que l'avis n'est pas déjà vérifié
    if (review.isVerified) {
      return Result.fail(new ReviewVerificationError('Review is already verified'));
    }

    // 4. Marquer l'avis comme v�rifi� et lier au participant
    const verifyResult = review.markAsVerified(input.participantId);
    if (!verifyResult.success) {
      return Result.fail(verifyResult.error);
    }

    // 5. Sauvegarder l'avis v�rifi�
    const saveResult = await this.reviewRepository.save(verifyResult.data);
    if (!saveResult.success) {
      return Result.fail(saveResult.error);
    }

    const verifiedReview = saveResult.data;

    // 6. Retourner les informations de v�rification
    return Result.ok({
      reviewId: verifiedReview.id,
      isVerified: verifiedReview.isVerified,
      rating: verifiedReview.rating,
      comment: verifiedReview.comment,
      publishedAt: verifiedReview.publishedAt,
      isPositive: verifiedReview.isPositive(),
    });
  }
}
