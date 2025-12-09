/**
 * Composant AiServiceBanner
 * Bannière affichant le statut du service IA
 * IMPORTANT: ZERO any types, Mobile-first responsive
 */

'use client';

import { Sparkles, Settings } from 'lucide-react';
import { useState } from 'react';

interface AiServiceBannerProps {
  onConfigureClick?: () => void;
}

export function AiServiceBanner({ onConfigureClick }: AiServiceBannerProps) {
  const [showAdvantages, setShowAdvantages] = useState(false);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
      <div className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="text-sm font-medium text-gray-800">Service IA non configuré</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowAdvantages(!showAdvantages)}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-gray-50 border border-amber-300 text-amber-700 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            {showAdvantages ? 'Masquer' : 'Voir les avantages'}
          </button>
          <button
            type="button"
            onClick={onConfigureClick}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
          >
            <Settings className="w-3.5 h-3.5" />
            Configurer
          </button>
        </div>
      </div>

      {/* Expandable Advantages Section */}
      {showAdvantages && (
        <div className="px-4 pb-4 pt-2 border-t border-amber-200 bg-amber-50/50">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Avantages du service IA :</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>
                <strong>Gain de temps :</strong> Génération automatique de réponses personnalisées
                en quelques secondes
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>
                <strong>Analyse de sentiment :</strong> L&apos;IA détecte l&apos;émotion de
                l&apos;avis (positif, neutre, négatif)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>
                <strong>Ton adapté :</strong> Réponses professionnelles, amicales ou conciliantes
                selon votre choix
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>
                <strong>Modifiable :</strong> Vous gardez le contrôle et pouvez ajuster la réponse
                avant envoi
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
