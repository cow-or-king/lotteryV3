/**
 * Composant EmptyState
 * État vide pour afficher quand il n'y a pas de campagnes
 */

'use client';

import { Gift, Plus } from 'lucide-react';

export type EmptyStateProps = {
  onCreateClick: () => void;
};

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <Gift className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucune campagne</h3>
      <p className="mt-1 text-sm text-gray-500">
        Créez votre première campagne pour vos commerces.
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
        >
          <Plus className="h-4 w-4" />
          Nouvelle campagne
        </button>
      </div>
    </div>
  );
}
