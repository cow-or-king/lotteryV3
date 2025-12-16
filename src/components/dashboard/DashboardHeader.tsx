/**
 * Composant Header pour la page Dashboard
 */

import { AIServiceBadge } from '@/components/ui/AIServiceBadge';

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <AIServiceBadge />
        </div>
        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
      </div>
    </div>
  );
}
