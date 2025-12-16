/**
 * Composant état vide pour la liste des gagnants
 */

interface EmptyWinnersStateProps {
  hasFilters: boolean;
  onResetFilters: () => void;
}

export function EmptyWinnersState({ hasFilters, onResetFilters }: EmptyWinnersStateProps) {
  return (
    <div className="text-center py-12 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm">
      <p className="text-gray-600 text-lg">Aucun gagnant trouvé</p>
      {hasFilters && (
        <button
          onClick={onResetFilters}
          className="mt-4 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}
