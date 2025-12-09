/**
 * Composant de carte d'affichage d'une review
 */

'use client';

import { Star } from 'lucide-react';
import { ReviewDTO } from '@/lib/types/review.types';

interface ReviewCardProps {
  review: ReviewDTO;
  onRespond?: (review: ReviewDTO) => void;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="p-4 bg-white rounded-xl border border-purple-600/10 hover:border-purple-600/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
            {review.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{review.authorName}</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(review.publishedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>
      {review.comment && <p className="text-gray-700 mb-3">{review.comment}</p>}
      <div className="flex items-center gap-2 mt-3">
        {review.hasResponse ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Répondu
          </span>
        ) : (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            En attente
          </span>
        )}
        {review.rating <= 3 && !review.hasResponse && (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            Nécessite attention
          </span>
        )}
      </div>
    </div>
  );
}
