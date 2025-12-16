/**
 * WinnerCard Component
 * Carte pour afficher un gagnant avec ses informations
 * IMPORTANT: ZERO any types, style glassmorphism
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WinnerCardProps {
  winner: {
    id: string;
    participantName: string;
    participantEmail: string;
    claimCode: string;
    status: 'PENDING' | 'CLAIMED' | 'EXPIRED';
    claimedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
    prize: {
      id: string;
      name: string;
      description: string | null;
      value: number | null;
      color: string;
    };
    campaign: {
      id: string;
      name: string;
    };
    store: {
      id: string;
      name: string;
    };
  };
  onMarkAsClaimed?: (winnerId: string) => void;
  isMarkingAsClaimed?: boolean;
}

export function WinnerCard({ winner, onMarkAsClaimed, isMarkingAsClaimed }: WinnerCardProps) {
  const statusColors = {
    PENDING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    CLAIMED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    EXPIRED: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const statusLabels = {
    PENDING: 'En attente',
    CLAIMED: 'Réclamé',
    EXPIRED: 'Expiré',
  };

  const isExpired = new Date() > new Date(winner.expiresAt);
  const actualStatus = isExpired && winner.status === 'PENDING' ? 'EXPIRED' : winner.status;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
      {/* En-tête avec statut */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{winner.participantName}</h3>
          <p className="text-sm text-white/60">{winner.participantEmail}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[actualStatus]}`}
        >
          {statusLabels[actualStatus]}
        </span>
      </div>

      {/* Informations du lot */}
      <div
        className="p-4 rounded-xl mb-4"
        style={{
          backgroundColor: `${winner.prize.color}20`,
          borderColor: `${winner.prize.color}50`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80 mb-1">Lot gagné</p>
            <p className="text-lg font-bold text-white">{winner.prize.name}</p>
            {winner.prize.description && (
              <p className="text-sm text-white/60 mt-1">{winner.prize.description}</p>
            )}
          </div>
          {winner.prize.value && (
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{winner.prize.value}€</p>
            </div>
          )}
        </div>
      </div>

      {/* Code de réclamation */}
      <div className="bg-black/20 rounded-xl p-4 mb-4">
        <p className="text-xs text-white/60 mb-2">Code de réclamation</p>
        <div className="flex items-center justify-between">
          <code className="text-2xl font-mono font-bold text-white tracking-wider">
            {winner.claimCode}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(winner.claimCode)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors"
          >
            Copier
          </button>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-white/60 mb-1">Campagne</p>
          <p className="text-sm font-medium text-white">{winner.campaign.name}</p>
        </div>
        <div>
          <p className="text-xs text-white/60 mb-1">Commerce</p>
          <p className="text-sm font-medium text-white">{winner.store.name}</p>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-white/60 mb-1">Gagné</p>
          <p className="text-sm text-white">
            {formatDistanceToNow(new Date(winner.createdAt), { addSuffix: true, locale: fr })}
          </p>
        </div>
        {winner.status === 'CLAIMED' && winner.claimedAt ? (
          <div>
            <p className="text-xs text-white/60 mb-1">Réclamé</p>
            <p className="text-sm text-white">
              {formatDistanceToNow(new Date(winner.claimedAt), { addSuffix: true, locale: fr })}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-white/60 mb-1">Expire</p>
            <p className={`text-sm ${isExpired ? 'text-red-400' : 'text-white'}`}>
              {formatDistanceToNow(new Date(winner.expiresAt), { addSuffix: true, locale: fr })}
            </p>
          </div>
        )}
      </div>

      {/* Action : Marquer comme réclamé */}
      {winner.status === 'PENDING' && !isExpired && onMarkAsClaimed && (
        <button
          onClick={() => onMarkAsClaimed(winner.id)}
          disabled={isMarkingAsClaimed}
          className="w-full py-3 bg-linear-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
        >
          {isMarkingAsClaimed ? 'Traitement...' : 'Marquer comme réclamé'}
        </button>
      )}
    </div>
  );
}
