/**
 * Composant Header pour la page Reviews
 */

import { AIServiceBadge } from '@/components/ui/AIServiceBadge';

export function ReviewsHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-800">Avis Google</h1>
          <AIServiceBadge />
        </div>
        <p className="text-gray-600">Gérez et répondez aux avis de vos clients</p>
      </div>
    </div>
  );
}
