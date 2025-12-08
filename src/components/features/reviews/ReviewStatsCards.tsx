/**
 * Composant de cartes de statistiques des reviews
 */

'use client';

import { Star, TrendingUp } from 'lucide-react';

interface ReviewStats {
  total: number;
  averageRating: number;
  positiveCount: number;
  responseRate: number;
}

interface ReviewStatsCardsProps {
  stats: ReviewStats | undefined;
  loading?: boolean;
}

export function ReviewStatsCards({ stats, loading }: ReviewStatsCardsProps) {
  if (loading || !stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total avis */}
      <div className="p-6 px-10 bg-white/50 backdrop-blur-xl border flex flex-col justify-between border-purple-600/20 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Total avis</p>
          <Star className="w-5 h-5 text-purple-600" />
        </div>
        <div className="h-[42px] flex items-center">
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
      </div>

      {/* Note moyenne */}
      <div className="p-6 px-10 bg-white/50 backdrop-blur-xl border flex flex-col justify-between border-purple-600/20 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Note moyenne</p>
          <TrendingUp className="w-5 h-5 text-yellow-600" />
        </div>
        <div className="h-[42px] flex items-center gap-2">
          <p className="text-3xl font-bold text-gray-800">{stats.averageRating.toFixed(1)}</p>
          <p className="text-sm text-gray-600 mb-1">/ 5</p>
        </div>
      </div>

      {/* Avis positifs */}
      <div className="p-6 px-10 bg-white/50 backdrop-blur-xl border flex flex-col justify-between border-purple-600/20 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Avis positifs (4-5★)</p>
          <span className="text-green-600 text-2xl">😊</span>
        </div>
        <div className="h-[42px] flex items-center gap-2">
          <p className="text-3xl font-bold text-gray-800">{stats.positiveCount}</p>
          <p className="text-sm text-gray-600 mb-1">
            ({stats.total > 0 ? ((stats.positiveCount / stats.total) * 100).toFixed(0) : 0}%)
          </p>
        </div>
      </div>

      {/* Taux de réponse */}
      <div className="p-6 px-10 bg-white/50 backdrop-blur-xl border flex flex-col justify-between border-purple-600/20 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Taux de réponse</p>
          <span className="text-blue-600 text-2xl">💬</span>
        </div>
        <div className="h-[42px] flex items-center">
          <p className="text-3xl font-bold text-gray-800">{stats.responseRate.toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
}
