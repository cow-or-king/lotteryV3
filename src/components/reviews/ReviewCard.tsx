/**
 * Composant de carte d'affichage d'une review
 * IMPORTANT: ZERO any types, Composant de présentation
 */

'use client';

import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import { ReviewDTO } from '@/lib/types/review.types';

interface ReviewCardProps {
  review: ReviewDTO;
  onRespond?: (review: ReviewDTO) => void;
}

export function ReviewCard({ review, onRespond }: ReviewCardProps) {
  return (
    <div className="p-5 bg-white rounded-xl border border-purple-600/10 hover:border-purple-600/30 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            {review.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{review.authorName}</p>
            <div className="flex items-center gap-1 mt-1">
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
        <div className="text-xs text-gray-500">
          {new Date(review.publishedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>

      {review.comment && (
        <p className="text-gray-700 mb-4 leading-relaxed text-sm">{review.comment}</p>
      )}

      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {review.hasResponse ? (
            <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Répondu
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              En attente
            </span>
          )}
          {review.rating <= 3 && !review.hasResponse && (
            <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              Attention
            </span>
          )}
        </div>

        {!review.hasResponse && onRespond && (
          <button
            onClick={() => onRespond(review)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-md flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Répondre
          </button>
        )}

        {review.hasResponse && (
          <span className="text-xs text-gray-500 italic">Réponse déjà envoyée</span>
        )}
      </div>
    </div>
  );
}
