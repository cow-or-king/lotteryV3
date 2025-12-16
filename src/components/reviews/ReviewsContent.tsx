/**
 * Composant principal du contenu de la page Reviews
 */

import { ReviewStatsCards, ReviewList } from '@/components/reviews';
import type { ReviewStats } from '@/core/repositories/review.repository.interface';
import type { ReviewDTO } from '@/lib/types/review.types';

interface ReviewsContentProps {
  stats: ReviewStats;
  reviews?: readonly ReviewDTO[];
  onRespond: (review: ReviewDTO) => void;
}

export function ReviewsContent({ stats, reviews, onRespond }: ReviewsContentProps) {
  return (
    <>
      {/* Statistiques - Sticky on scroll */}
      <div className="sticky z-10 bg-linear-to-br from-purple-50/95 via-pink-50/95 to-blue-50/95 backdrop-blur-lg pt-4 pb-2 -mx-6 px-6">
        <ReviewStatsCards stats={stats} />
      </div>

      {/* Liste des avis */}
      <div
        className="bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 overflow-auto"
        style={{ maxHeight: 'calc(100vh - 220px)' }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Liste des avis</h2>
        <ReviewList reviews={reviews} onRespond={onRespond} />
      </div>
    </>
  );
}
