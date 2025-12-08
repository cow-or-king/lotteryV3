/**
 * GoogleReviewMetadata Value Object
 * Métadonnées provenant de Google (ID, URL, photo, etc.)
 */

import { Result } from '@/lib/types/result.type';

export interface GoogleReviewMetadataProps {
  readonly googleReviewId: string;
  readonly googlePlaceId: string;
  readonly reviewUrl: string;
  readonly authorGoogleId?: string;
  readonly authorPhotoUrl?: string;
  readonly photoUrl?: string;
}

export class GoogleReviewMetadataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoogleReviewMetadataError';
  }
}

export class GoogleReviewMetadata {
  private constructor(private readonly props: GoogleReviewMetadataProps) {}

  static create(props: GoogleReviewMetadataProps): Result<GoogleReviewMetadata> {
    // Validation Google Review ID
    if (!props.googleReviewId || props.googleReviewId.trim().length === 0) {
      return Result.fail(new GoogleReviewMetadataError('Google Review ID is required'));
    }

    // Validation Google Place ID
    if (!props.googlePlaceId || props.googlePlaceId.trim().length === 0) {
      return Result.fail(new GoogleReviewMetadataError('Google Place ID is required'));
    }

    // Validation Review URL
    if (!props.reviewUrl || props.reviewUrl.trim().length === 0) {
      return Result.fail(new GoogleReviewMetadataError('Review URL is required'));
    }

    try {
      new URL(props.reviewUrl);
    } catch {
      return Result.fail(new GoogleReviewMetadataError('Invalid review URL format'));
    }

    // Validation des URLs optionnelles
    if (props.authorPhotoUrl) {
      try {
        new URL(props.authorPhotoUrl);
      } catch {
        return Result.fail(new GoogleReviewMetadataError('Invalid author photo URL format'));
      }
    }

    if (props.photoUrl) {
      try {
        new URL(props.photoUrl);
      } catch {
        return Result.fail(new GoogleReviewMetadataError('Invalid photo URL format'));
      }
    }

    return Result.ok(new GoogleReviewMetadata(props));
  }

  get googleReviewId(): string {
    return this.props.googleReviewId;
  }

  get googlePlaceId(): string {
    return this.props.googlePlaceId;
  }

  get reviewUrl(): string {
    return this.props.reviewUrl;
  }

  get authorGoogleId(): string | undefined {
    return this.props.authorGoogleId;
  }

  get authorPhotoUrl(): string | undefined {
    return this.props.authorPhotoUrl;
  }

  get photoUrl(): string | undefined {
    return this.props.photoUrl;
  }
}
