/**
 * Step 2: Condition Selection
 * Permet de définir les conditions de participation à la campagne
 * IMPORTANT: ZERO any types
 */

'use client';

import { ConditionBuilder } from '@/components/campaign/ConditionBuilder';
import type { ConditionType } from '@/generated/prisma';

interface ConditionItem {
  id: string;
  type: ConditionType;
  title: string;
  description: string;
  iconEmoji: string;
  config: Record<string, string | number | boolean> | null;
  enablesGame?: boolean;
}

interface Step2ConditionSelectionProps {
  conditions: ConditionItem[];
  onConditionsChange: (conditions: ConditionItem[]) => void;
  googleBusinessUrl?: string;
}

export default function Step2ConditionSelection({
  conditions,
  onConditionsChange,
  googleBusinessUrl,
}: Step2ConditionSelectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Conditions de participation</h2>
        <p className="mt-2 text-sm text-gray-600">
          Définissez les actions que les participants doivent accomplir pour jouer. Le premier avis
          Google est obligatoire par défaut.
        </p>
      </div>

      {/* Info Box si URL Google Business disponible */}
      {googleBusinessUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">URL Google Avis détectée</p>
              <p>
                L&apos;URL Google Avis de votre commerce sera automatiquement utilisée pour la
                première condition.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Condition Builder */}
      <ConditionBuilder
        conditions={conditions}
        onChange={onConditionsChange}
        googleReviewUrl={googleBusinessUrl}
      />

      {/* Help Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-1">Comment ça fonctionne ?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Chaque scan de QR code débloque la condition suivante</li>
              <li>Les participants accomplissent les conditions dans l&apos;ordre défini</li>
              <li>Après avoir complété toutes les conditions, ils peuvent jouer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
