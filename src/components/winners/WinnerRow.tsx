/**
 * WinnerRow Component
 * Ligne de tableau pour un gagnant
 * IMPORTANT: ZERO any types
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WinnerRowProps {
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
      value: number | null;
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

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-900 border-amber-400',
  CLAIMED: 'bg-emerald-100 text-emerald-900 border-emerald-400',
  EXPIRED: 'bg-red-100 text-red-900 border-red-400',
};

const statusLabels = {
  PENDING: 'En attente',
  CLAIMED: 'Réclamé',
  EXPIRED: 'Expiré',
};

export function WinnerRow({ winner, onMarkAsClaimed, isMarkingAsClaimed }: WinnerRowProps) {
  const isExpired = new Date() > new Date(winner.expiresAt);
  const actualStatus = isExpired && winner.status === 'PENDING' ? 'EXPIRED' : winner.status;

  return (
    <div className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors">
      {/* Participant */}
      <div className="col-span-2">
        <p className="font-medium text-gray-900">{winner.participantName}</p>
        <p className="text-sm text-gray-600 truncate">{winner.participantEmail}</p>
      </div>

      {/* Lot */}
      <div className="col-span-2">
        <p className="font-medium text-gray-900">{winner.prize.name}</p>
        {winner.prize.value && <p className="text-sm text-gray-600">{winner.prize.value}€</p>}
      </div>

      {/* Code */}
      <div className="col-span-2">
        <code className="text-sm font-mono font-bold text-gray-900">{winner.claimCode}</code>
        <button
          onClick={() => navigator.clipboard.writeText(winner.claimCode)}
          className="ml-2 text-xs text-violet-600 hover:text-violet-700"
        >
          Copier
        </button>
      </div>

      {/* Campagne */}
      <div className="col-span-2">
        <p className="text-sm text-gray-900">{winner.campaign.name}</p>
        <p className="text-xs text-gray-600">{winner.store.name}</p>
      </div>

      {/* Dates */}
      <div className="col-span-2">
        <p className="text-sm text-gray-900">
          Gagné{' '}
          {formatDistanceToNow(new Date(winner.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
        {winner.status === 'CLAIMED' && winner.claimedAt ? (
          <p className="text-xs text-gray-600">
            Réclamé{' '}
            {formatDistanceToNow(new Date(winner.claimedAt), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
        ) : (
          <p className={`text-xs ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
            Expire{' '}
            {formatDistanceToNow(new Date(winner.expiresAt), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
        )}
      </div>

      {/* Statut */}
      <div className="col-span-1 flex items-center">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[actualStatus]}`}
        >
          {statusLabels[actualStatus]}
        </span>
      </div>

      {/* Action */}
      <div className="col-span-1 flex items-center">
        {winner.status === 'PENDING' && !isExpired && onMarkAsClaimed && (
          <button
            onClick={() => onMarkAsClaimed(winner.id)}
            disabled={isMarkingAsClaimed}
            className="px-3 py-1 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-400 text-white text-xs rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            Réclamé
          </button>
        )}
      </div>
    </div>
  );
}
