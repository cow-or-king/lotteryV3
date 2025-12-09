/**
 * Plan Info Card Component
 * Affiche les informations sur le plan actuel de l'utilisateur
 */

'use client';

import { HelpCircle } from 'lucide-react';

interface PlanInfoCardProps {
  storesCount: number;
  maxStoresPerBrand: number;
  brandsCount: number;
  maxBrands: number;
  canCreateBrand: boolean;
}

export function PlanInfoCard({
  storesCount,
  maxStoresPerBrand,
  brandsCount,
  maxBrands,
  canCreateBrand,
}: PlanInfoCardProps) {
  return (
    <div className="mb-6 p-5 bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
      <div className="flex flex-col items-center text-center">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
          <HelpCircle className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-800 mb-2">Plan gratuit</h3>
        <p className="text-xs text-gray-700 mb-2">
          Vous utilisez {storesCount}/{maxStoresPerBrand} commerce et {brandsCount}/{maxBrands}{' '}
          enseigne.
        </p>
        {!canCreateBrand && (
          <p className="text-xs text-gray-700 mb-3">
            Pour créer une nouvelle enseigne, vous devez passer à un plan payant.
          </p>
        )}
      </div>
    </div>
  );
}
