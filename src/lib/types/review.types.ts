/**
 * Types partagés pour les reviews
 * Centralise les interfaces pour éviter la duplication
 */

export interface ReviewDTO {
  reviewId: string;
  googleReviewId: string;
  authorName: string;
  rating: number;
  comment: string | null;
  publishedAt: Date | string; // tRPC sérialise Date en string
  hasResponse: boolean;
  isVerified: boolean;
  status: string;
  sentiment: string | null;
  needsAttention: boolean;
  isPositive: boolean;
}
