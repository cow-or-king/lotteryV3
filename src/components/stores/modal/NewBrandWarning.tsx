/**
 * New Brand Warning Component
 * Avertissement pour la création d'une nouvelle enseigne (payant)
 */

'use client';

import { Crown } from 'lucide-react';

interface NewBrandWarningProps {
  onUseExisting: () => void;
}

export function NewBrandWarning({ onUseExisting }: NewBrandWarningProps) {
  return (
    <div className="p-4 bg-linear-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
      <div className="flex flex-col items-center text-center">
        <Crown className="w-8 h-8 text-yellow-600 mb-2" />
        <h3 className="text-sm font-bold text-gray-800 mb-1">Nouvelle enseigne (payant)</h3>
        <p className="text-xs text-gray-700 mb-3">
          La création d'une nouvelle enseigne nécessite un plan payant.
        </p>
        <button
          type="button"
          onClick={onUseExisting}
          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
        >
          ← Utiliser l'enseigne existante
        </button>
      </div>
    </div>
  );
}
