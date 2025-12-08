'use client';

import { Plus, Store } from 'lucide-react';

interface EmptyStateProps {
  onCreateBrand: () => void;
}

export function EmptyState({ onCreateBrand }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-24 h-24 bg-linear-to-br from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-full flex items-center justify-center mb-6">
        <Store className="w-12 h-12 text-purple-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucune enseigne</h3>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Vous n'avez pas encore créé d'enseigne. Commencez par créer votre première enseigne et son
        premier commerce pour lancer vos campagnes.
      </p>
      <button
        onClick={onCreateBrand}
        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
      >
        <Plus className="w-5 h-5" />
        Créer ma première enseigne
      </button>
    </div>
  );
}
