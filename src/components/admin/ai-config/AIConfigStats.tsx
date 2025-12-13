/**
 * Composant pour afficher les statistiques d'utilisation de l'IA
 * ZERO any types
 */

'use client';

import { BarChart3, CheckCircle2, Sparkles } from 'lucide-react';
import { AIUsageStats } from '@/lib/types/ai-config.types';

interface AIConfigStatsProps {
  stats: AIUsageStats | undefined;
}

export function AIConfigStats({ stats }: AIConfigStatsProps) {
  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
      {/* Requêtes totales */}
      <div className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-purple-600/20">
        <div className="flex items-center gap-3">
          <BarChart3 size={32} color="#9333ea" />
          <div>
            <p className="m-0 text-xs text-gray-600">Requêtes totales</p>
            <p className="m-0 text-2xl font-bold text-gray-800">{stats.totalRequests}</p>
          </div>
        </div>
      </div>

      {/* Requêtes utilisées */}
      <div className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-green-500/20">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={32} color="#10b981" />
          <div>
            <p className="m-0 text-xs text-gray-600">Utilisées</p>
            <p className="m-0 text-2xl font-bold text-gray-800">{stats.usedRequests}</p>
          </div>
        </div>
      </div>

      {/* Tokens */}
      <div className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-blue-500/20">
        <div className="flex items-center gap-3">
          <Sparkles size={32} color="#3b82f6" />
          <div>
            <p className="m-0 text-xs text-gray-600">Tokens</p>
            <p className="m-0 text-2xl font-bold text-gray-800">
              {stats.totalTokens.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Coût estimé */}
      <div className="p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-yellow-500/20">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💰</span>
          <div>
            <p className="m-0 text-xs text-gray-600">Coût estimé</p>
            <p className="m-0 text-2xl font-bold text-gray-800">${stats.totalCostUsd.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
