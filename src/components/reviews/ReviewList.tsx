/**
 * ReviewList Component
 * Liste des avis avec filtres, pagination et gestion des réponses
 * IMPORTANT: ZERO any types, Type-safety complète
 */

'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ReviewCard, type ReviewCardData } from './ReviewCard';
import { ResponseEditor } from './ResponseEditor';
import { useReviewsByStore, useSyncReviews } from '@/hooks/use-reviews';
import {
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface ReviewListProps {
  storeId: string;
  showFilters?: boolean;
  showStats?: boolean;
  pageSize?: number;
}

/**
 * Liste complète des avis avec filtres et pagination
 */
export const ReviewList = ({
  storeId,
  showFilters = true,
  showStats = true,
  pageSize = 10,
}: ReviewListProps) => {
  // État
  const [currentPage, setCurrentPage] = useState(1);
  const [respondingToReviewId, setRespondingToReviewId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    rating?: number;
    hasResponse?: boolean;
    status?: 'PENDING' | 'PROCESSED' | 'ARCHIVED';
  }>({});

  // Calcul offset
  const offset = (currentPage - 1) * pageSize;

  // Hooks
  const { reviews, total, isLoading, refetch } = useReviewsByStore(
    storeId,
    filters,
    pageSize,
    offset,
  );
  const { syncReviews, isLoading: isSyncing } = useSyncReviews();

  // Calculs pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Statistiques rapides
  const needsAttentionCount = reviews.filter((r) => r.needsAttention).length;
  const unansweredCount = reviews.filter((r) => !r.hasResponse).length;

  // Handlers
  const handleSync = () => {
    syncReviews(storeId);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
  };

  const handleRespondClick = (reviewId: string) => {
    setRespondingToReviewId(reviewId);
  };

  const handleResponseSuccess = () => {
    setRespondingToReviewId(null);
    refetch();
  };

  const handleResponseCancel = () => {
    setRespondingToReviewId(null);
  };

  // Trouver l'avis en cours de réponse
  const respondingToReview = respondingToReviewId
    ? reviews.find((r) => r.reviewId === respondingToReviewId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Avis Google</h2>
          <p className="text-gray-600 mt-1">
            {total} avis au total • {unansweredCount} sans réponse
          </p>
        </div>
        <GlassButton
          variant="secondary"
          size="md"
          onClick={handleSync}
          loading={isSyncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Synchroniser
        </GlassButton>
      </div>

      {/* Stats rapides */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard variant="light" noPadding className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total avis</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="light" noPadding className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sans réponse</p>
                <p className="text-2xl font-bold text-gray-900">{unansweredCount}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="light" noPadding className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attention requise</p>
                <p className="text-2xl font-bold text-gray-900">{needsAttentionCount}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Filtres */}
      {showFilters && (
        <GlassCard variant="light">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Filtres:</span>
            </div>

            {/* Filtre Note */}
            <select
              value={filters.rating ?? ''}
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  rating: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="px-3 py-2 rounded-xl bg-white/50 border border-gray-200/50 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none"
            >
              <option value="">Toutes les notes</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 étoiles)</option>
              <option value="4">⭐⭐⭐⭐ (4 étoiles)</option>
              <option value="3">⭐⭐⭐ (3 étoiles)</option>
              <option value="2">⭐⭐ (2 étoiles)</option>
              <option value="1">⭐ (1 étoile)</option>
            </select>

            {/* Filtre Réponse */}
            <select
              value={
                filters.hasResponse === undefined ? '' : filters.hasResponse ? 'true' : 'false'
              }
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  hasResponse: e.target.value === '' ? undefined : e.target.value === 'true',
                })
              }
              className="px-3 py-2 rounded-xl bg-white/50 border border-gray-200/50 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none"
            >
              <option value="">Tous les avis</option>
              <option value="false">Sans réponse</option>
              <option value="true">Avec réponse</option>
            </select>

            {/* Reset */}
            {(filters.rating || filters.hasResponse !== undefined) && (
              <button
                onClick={() => handleFilterChange({})}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </GlassCard>
      )}

      {/* Liste des avis */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des avis...</p>
        </div>
      ) : reviews.length === 0 ? (
        <GlassCard variant="light">
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun avis trouvé</h3>
            <p className="text-gray-600">
              {Object.keys(filters).length > 0
                ? 'Essayez de modifier vos filtres'
                : 'Synchronisez vos avis Google pour commencer'}
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.reviewId}>
              <ReviewCard
                review={review as unknown as ReviewCardData}
                onRespond={handleRespondClick}
                showActions={!respondingToReview}
              />

              {/* Éditeur de réponse */}
              {respondingToReviewId === review.reviewId && respondingToReview && (
                <div className="mt-4">
                  <ResponseEditor
                    reviewId={review.reviewId}
                    storeId={storeId}
                    reviewRating={review.rating}
                    reviewComment={review.comment}
                    onCancel={handleResponseCancel}
                    onSuccess={handleResponseSuccess}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages} • {total} résultats
          </p>
          <div className="flex items-center gap-2">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4" />
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!hasNextPage}
            >
              <ChevronRight className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  );
};
