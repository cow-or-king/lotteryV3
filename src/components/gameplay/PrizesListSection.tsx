/**
 * Composant pour afficher la liste des lots disponibles
 */

import { Gift } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  description: string | null;
  value: number | null;
  color: string;
  remaining: number;
  quantity: number;
  probability: number;
}

interface Campaign {
  prizes?: Prize[];
}

interface PrizesListSectionProps {
  campaign: Campaign;
}

export function PrizesListSection({ campaign }: PrizesListSectionProps) {
  const hasPrizes = campaign.prizes && campaign.prizes.length > 0;

  return (
    <div className="border-t border-white/30 pt-8 mt-12">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Gift className="h-6 w-6 text-purple-600" />
        Lots à gagner ({campaign.prizes?.length || 0})
      </h3>

      {hasPrizes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaign.prizes?.map((prize) => (
            <div
              key={prize.id}
              className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div
                    className="w-4 h-4 rounded-full mb-2"
                    style={{ backgroundColor: prize.color }}
                  />
                  <h4 className="font-semibold text-gray-800">{prize.name}</h4>
                  {prize.description && (
                    <p className="text-sm text-gray-700 mt-1">{prize.description}</p>
                  )}
                  {prize.value && (
                    <p className="text-sm font-medium text-purple-600 mt-2">
                      Valeur: {prize.value}€
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {prize.remaining}/{prize.quantity}
                  </div>
                  <div className="text-xs text-gray-500">restants</div>
                  <div className="text-xs text-purple-600 mt-1">{prize.probability}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center py-4">Aucun lot configuré</p>
      )}
    </div>
  );
}
