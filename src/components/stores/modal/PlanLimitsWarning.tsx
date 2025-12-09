/**
 * Plan Limits Warning Component
 * Affiche un message d'avertissement quand les limites du plan sont atteintes
 */

'use client';

import { HelpCircle } from 'lucide-react';

interface PlanLimitsWarningProps {
  maxBrands: number;
  maxStoresPerBrand: number;
}

export function PlanLimitsWarning({ maxBrands, maxStoresPerBrand }: PlanLimitsWarningProps) {
  return (
    <div className="mb-6 p-6 bg-linear-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <HelpCircle className="w-6 h-6 text-yellow-600" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-2">Limite du plan gratuit atteinte</h3>
        <p className="text-sm text-gray-700 mb-4 max-w-sm">
          Vous avez atteint la limite de {maxBrands} enseigne et {maxStoresPerBrand} commerce en
          version gratuite.
        </p>
        <p className="text-xs text-purple-700 italic">
          (Mode développement : création autorisée pour test)
        </p>
      </div>
    </div>
  );
}
