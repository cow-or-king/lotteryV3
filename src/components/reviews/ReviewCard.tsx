/**
 * ReviewCard Component
 * Carte d'affichage d'un avis Google avec style Glassmorphism
 * IMPORTANT: ZERO any types, Type-safety complète
 */

'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassBadge } from '@/components/ui/GlassBadge';
import { Star, MessageSquare, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface ReviewCardData {
  readonly reviewId: string;
  readonly googleReviewId: string;
  readonly authorName: string;
  readonly rating: number;
  readonly comment: string | null;
  readonly publishedAt: Date;
  readonly hasResponse: boolean;
  readonly isVerified: boolean;
  readonly status: string;
  readonly sentiment: string | null;
  readonly needsAttention: boolean;
  readonly isPositive: boolean;
  readonly responseContent?: string | null;
  readonly respondedAt?: Date | null;
}

interface ReviewCardProps {
  review: ReviewCardData;
  onRespond?: (reviewId: string) => void;
  onViewDetails?: (reviewId: string) => void;
  showActions?: boolean;
}

/**
 * Composant d'affichage d'un avis Google
 */
export const ReviewCard = ({
  review,
  onRespond,
  onViewDetails,
  showActions = true,
}: ReviewCardProps) => {
  const [expanded, setExpanded] = useState(false);

  // Déterminer la couleur selon le rating
  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return 'text-green-600';
    if (rating === 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Formater la date relative
  const getRelativeDate = (date: Date): string => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
  };

  // Tronquer le commentaire si trop long
  const truncateComment = (text: string | null, maxLength = 200): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return expanded ? text : `${text.substring(0, maxLength)}...`;
  };

  return (
    <GlassCard
      variant={review.needsAttention ? 'colored' : 'light'}
      className="hover:shadow-3xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">{review.authorName}</h3>
            {review.isVerified && (
              <GlassBadge variant="success" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Vérifié
              </GlassBadge>
            )}
            {review.needsAttention && (
              <GlassBadge variant="warning" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Attention requise
              </GlassBadge>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= review.rating
                      ? `fill-current ${getRatingColor(review.rating)}`
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className={`font-semibold ${getRatingColor(review.rating)}`}>
              {review.rating}/5
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{getRelativeDate(review.publishedAt)}</span>
          </div>
          {review.sentiment && (
            <GlassBadge variant="info" size="sm">
              {review.sentiment}
            </GlassBadge>
          )}
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {truncateComment(review.comment)}
          </p>
          {review.comment.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2"
            >
              {expanded ? 'Voir moins' : 'Voir plus'}
            </button>
          )}
        </div>
      )}

      {/* Response */}
      {review.hasResponse && review.responseContent && (
        <div className="mt-4 pl-4 border-l-4 border-purple-400 bg-purple-50/50 rounded-r-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">Votre réponse</span>
            {review.respondedAt && (
              <span className="text-xs text-gray-600">• {getRelativeDate(review.respondedAt)}</span>
            )}
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{review.responseContent}</p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200/50">
          {!review.hasResponse && onRespond && (
            <GlassButton
              variant="primary"
              size="sm"
              onClick={() => onRespond(review.reviewId)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Répondre
            </GlassButton>
          )}
          {onViewDetails && (
            <GlassButton variant="ghost" size="sm" onClick={() => onViewDetails(review.reviewId)}>
              Voir détails
            </GlassButton>
          )}
          <a
            href={`https://www.google.com/maps/reviews/${review.googleReviewId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Voir sur Google →
          </a>
        </div>
      )}
    </GlassCard>
  );
};
