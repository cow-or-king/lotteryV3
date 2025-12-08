/**
 * ReviewResponse Value Object
 * Représente une réponse à un avis Google
 */

import { Result } from '@/shared/types/result.type';
import { UserId } from '@/shared/types/branded.type';

export interface ReviewResponseProps {
  readonly content: string;
  readonly respondedBy: UserId;
  readonly respondedAt: Date;
}

export class ReviewResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewResponseError';
  }
}

export class ReviewResponse {
  private constructor(private readonly props: ReviewResponseProps) {}

  static create(
    content: string,
    respondedBy: UserId,
    respondedAt: Date = new Date(),
  ): Result<ReviewResponse> {
    // Validation du contenu
    const trimmed = content.trim();

    if (trimmed.length === 0) {
      return Result.fail(new ReviewResponseError('Response content cannot be empty'));
    }

    if (trimmed.length < 10) {
      return Result.fail(
        new ReviewResponseError('Response content must be at least 10 characters'),
      );
    }

    if (trimmed.length > 5000) {
      return Result.fail(new ReviewResponseError('Response content cannot exceed 5000 characters'));
    }

    return Result.ok(
      new ReviewResponse({
        content: trimmed,
        respondedBy,
        respondedAt,
      }),
    );
  }

  get content(): string {
    return this.props.content;
  }

  get respondedBy(): UserId {
    return this.props.respondedBy;
  }

  get respondedAt(): Date {
    return this.props.respondedAt;
  }

  equals(other: ReviewResponse): boolean {
    return (
      this.props.content === other.props.content &&
      this.props.respondedBy === other.props.respondedBy &&
      this.props.respondedAt.getTime() === other.props.respondedAt.getTime()
    );
  }
}
