/**
 * Composant Header pour la page Winners
 */

import { Trophy } from 'lucide-react';

export function WinnersHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
          <Trophy className="w-6 h-6 text-violet-600" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Gagnants</h1>
          <p className="text-gray-600">Gérez les gagnants de vos campagnes</p>
        </div>
      </div>
    </div>
  );
}
