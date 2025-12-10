/**
 * Badge pour afficher le statut du service IA
 * Affiche: "IA Active ✅" ou "IA Bientôt 🔜"
 * IMPORTANT: ZERO any types
 */

'use client';

import { useAIServiceStatus } from '@/lib/hooks/useAIServiceStatus';

interface AIServiceBadgeProps {
  readonly showProvider?: boolean;
  readonly className?: string;
}

export function AIServiceBadge({ showProvider = false, className = '' }: AIServiceBadgeProps) {
  const { isAvailable, provider, isLoading } = useAIServiceStatus();

  if (isLoading) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-gray-500/10 px-3 py-1 ${className}`}
      >
        <span className="text-sm text-gray-400">Chargement...</span>
      </div>
    );
  }

  if (isAvailable) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 ${className}`}
      >
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium text-green-600">IA Active</span>
        {showProvider && provider && (
          <span className="text-xs text-green-500/70">({provider})</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1 ${className}`}
    >
      <div className="h-2 w-2 rounded-full bg-yellow-500" />
      <span className="text-sm font-medium text-yellow-600">IA Bientôt</span>
    </div>
  );
}
