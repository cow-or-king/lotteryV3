/**
 * Composant de carte d'affichage d'une review
 * IMPORTANT: ZERO any types, Composant de présentation
 */

'use client';

import { ReviewDTO } from '@/lib/types/review.types';
import { CheckCircle, ExternalLink, MessageSquare, Star } from 'lucide-react';

interface ReviewCardProps {
  review: ReviewDTO;
  onRespond?: (review: ReviewDTO) => void;
}

export function ReviewCard({ review, onRespond }: ReviewCardProps) {
  return (
    <div className="p-4 sm:p-5 bg-white rounded-xl border border-purple-600/10 hover:border-purple-600/30 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md shrink-0">
            {review.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {review.authorName}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 shrink-0">
          {new Date(review.publishedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>

      {review.comment && (
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">{review.comment}</p>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          {review.hasResponse ? (
            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Répondu
            </span>
          ) : (
            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              En attente
            </span>
          )}
          {review.rating <= 3 && !review.hasResponse && (
            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              Attention
            </span>
          )}
        </div>

        {!review.hasResponse && onRespond && (
          <button
            onClick={() => onRespond(review)}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-md flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Répondre
          </button>
        )}

        {review.hasResponse && (
          <a
            href="https://business.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-3 py-2 sm:px-4 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Modifier sur Google
          </a>
        )}
      </div>
    </div>
  );
}
