/**
 * Composant Table des gagnants
 */

import { WinnerRow } from '@/components/winners/WinnerRow';

interface WinnerItem {
  id: string;
  [key: string]: unknown;
}

interface WinnersTableProps {
  winners: WinnerItem[];
  onMarkAsClaimed: (winnerId: string) => void;
  isMarkingAsClaimed: boolean;
}

export function WinnersTable({ winners, onMarkAsClaimed, isMarkingAsClaimed }: WinnersTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl overflow-hidden shadow-sm">
      {/* En-tête du tableau */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/50 border-b border-gray-200/50 text-sm font-medium text-gray-700">
        <div className="col-span-2">Participant</div>
        <div className="col-span-2">Lot</div>
        <div className="col-span-2">Code</div>
        <div className="col-span-2">Campagne</div>
        <div className="col-span-2">Dates</div>
        <div className="col-span-1">Statut</div>
        <div className="col-span-1">Action</div>
      </div>

      {/* Lignes du tableau */}
      <div className="divide-y divide-gray-200">
        {winners.map((winner) => (
          <WinnerRow
            key={winner.id}
            winner={winner as unknown as Parameters<typeof WinnerRow>[0]['winner']}
            onMarkAsClaimed={onMarkAsClaimed}
            isMarkingAsClaimed={isMarkingAsClaimed}
          />
        ))}
      </div>
    </div>
  );
}
