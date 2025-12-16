/**
 * Step 2: Prize Selection
 * Display prize sets as clickable cards with quantity selection
 */

'use client';

import { Gift } from 'lucide-react';

interface PrizeSetItem {
  id: string;
  quantity: number;
  probability: number;
  prizeTemplate: {
    name: string;
    description: string | null;
    minPrice: number | null;
    color: string;
  } | null;
}

interface PrizeSet {
  id: string;
  name: string;
  description: string | null;
  items: PrizeSetItem[] | null;
}

interface PrizeConfig {
  prizeSetId: string;
  quantity: number;
}

interface Step2PrizeSelectionProps {
  prizeSets: PrizeSet[] | undefined;
  selectedPrizes: PrizeConfig[];
  onAddPrize: (prizeSetId: string) => void;
  onRemovePrize: (prizeSetId: string) => void;
  onUpdateQuantity: (prizeSetId: string, quantity: number) => void;
  isLoadingPrizeSets: boolean;
}

export default function Step2PrizeSelection({
  prizeSets,
  selectedPrizes,
  onAddPrize,
  onRemovePrize,
  onUpdateQuantity,
  isLoadingPrizeSets,
}: Step2PrizeSelectionProps) {
  const togglePrizeSet = (prizeSetId: string) => {
    const isSelected = selectedPrizes.some((p) => p.prizeSetId === prizeSetId);
    if (isSelected) {
      onRemovePrize(prizeSetId);
    } else {
      onAddPrize(prizeSetId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Gift className="h-12 w-12 text-purple-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Configuration des lots</h3>
        <p className="text-sm text-gray-500">Cliquez sur les cartes pour sélectionner vos lots</p>
      </div>

      {isLoadingPrizeSets ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="text-sm text-gray-500 mt-2">Chargement des lots...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prizeSets?.map((prizeSet) => {
            const isSelected = selectedPrizes.some((p) => p.prizeSetId === prizeSet.id);
            const selectedConfig = selectedPrizes.find((p) => p.prizeSetId === prizeSet.id);
            const itemsCount = prizeSet.items?.length || 0;

            return (
              <div
                key={prizeSet.id}
                onClick={() => togglePrizeSet(prizeSet.id)}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{prizeSet.name}</h4>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {prizeSet.description && (
                  <p className="text-sm text-gray-600 mb-2">{prizeSet.description}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Gift className="h-4 w-4" />
                  <span>
                    {itemsCount} gain{itemsCount > 1 ? 's' : ''}
                  </span>
                </div>

                {isSelected && (
                  <div
                    className="mt-3 pt-3 border-t border-purple-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedConfig?.quantity || 1}
                      onChange={(e) => onUpdateQuantity(prizeSet.id, Number(e.target.value))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedPrizes.length === 0 && !isLoadingPrizeSets && (
        <p className="text-center text-sm text-gray-500 py-4">
          Sélectionnez au moins un lot pour continuer
        </p>
      )}
    </div>
  );
}
