/**
 * Step 4: Campaign Settings
 * Prize expiration days and maximum participants limit
 */

'use client';

import { Clock, Users } from 'lucide-react';

interface Step4SettingsProps {
  prizeClaimExpiryDays: number;
  maxParticipants: number | null;
  onExpiryChange: (days: number) => void;
  onMaxParticipantsChange: (max: number | null) => void;
}

export default function Step4Settings({
  prizeClaimExpiryDays,
  maxParticipants,
  onExpiryChange,
  onMaxParticipantsChange,
}: Step4SettingsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Clock className="h-12 w-12 text-purple-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Paramètres de la campagne</h3>
      </div>

      {/* Expiration des gains */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="inline h-4 w-4 mr-2" />
          Expiration des gains *
        </label>
        <input
          type="number"
          min="1"
          max="365"
          value={prizeClaimExpiryDays}
          onChange={(e) => onExpiryChange(Number(e.target.value))}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
        />
        <p className="text-xs text-gray-500 mt-1">
          Les participants auront {prizeClaimExpiryDays} jour
          {prizeClaimExpiryDays > 1 ? 's' : ''} pour récupérer leur gain
        </p>
      </div>

      {/* Limite de participants */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={maxParticipants !== null}
            onChange={(e) => onMaxParticipantsChange(e.target.checked ? 100 : null)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700">
            <Users className="inline h-4 w-4 mr-2" />
            Limiter le nombre de participants
          </span>
        </label>

        {maxParticipants !== null && (
          <input
            type="number"
            min="1"
            value={maxParticipants}
            onChange={(e) => onMaxParticipantsChange(Number(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
            placeholder="Nombre maximum de participants"
          />
        )}
      </div>

      {/* Informations importantes */}
      <div className="space-y-3">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            ℹ️ Votre campagne sera créée en mode <strong>inactif</strong>.
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Activez-la depuis la liste des campagnes pour la rendre publique et l'associer au QR
            code de votre commerce.
          </p>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-900">
            🎯 Une seule campagne peut être active par commerce à la fois.
          </p>
          <p className="text-xs text-purple-700 mt-1">
            La campagne active sera automatiquement liée au QR code par défaut du commerce.
          </p>
        </div>
      </div>
    </div>
  );
}
