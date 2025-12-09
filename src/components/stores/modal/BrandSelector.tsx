/**
 * Brand Selector Component
 * Affiche l'enseigne sélectionnée avec option de créer une nouvelle
 */

'use client';

import { Plus } from 'lucide-react';

interface BrandSelectorProps {
  brandName: string;
  logoUrl: string;
  onCreateNew: () => void;
}

export function BrandSelector({ brandName, logoUrl, onCreateNew }: BrandSelectorProps) {
  return (
    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt={brandName}
            className="w-10 h-10 rounded-lg object-cover border border-purple-600/30"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">{brandName}</p>
            <p className="text-xs text-gray-600">Enseigne sélectionnée</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-xs hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouvelle enseigne
        </button>
      </div>
    </div>
  );
}
