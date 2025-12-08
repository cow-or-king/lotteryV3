/**
 * Composant de liste des reviews
 */

'use client';

import { Star } from 'lucide-react';
import { ReviewCard } from './ReviewCard';

interface Review {
  reviewId: string;
  authorName: string;
  rating: number;
  comment: string | null;
  publishedAt: Date;
  hasResponse: boolean;
}

interface ReviewsListProps {
  reviews: Review[] | undefined;
  loading?: boolean;
  onRespond?: (review: Review) => void;
}

export function ReviewsList({ reviews, loading, onRespond }: ReviewsListProps) {
  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600">
        <Star className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
        <p>Chargement des avis...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <Star className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>Aucun avis pour le moment</p>
        <p className="text-sm mt-2">Cliquez sur &quot;Synchroniser&quot; pour charger les avis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.reviewId} review={review} onRespond={onRespond} />
      ))}
    </div>
  );
}
