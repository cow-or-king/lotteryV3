/**
 * Composant ToggleWarningModal
 * Modal d'avertissement lors de l'activation d'une campagne
 */

'use client';

import { AlertCircle } from 'lucide-react';

export type ToggleWarningModalProps = {
  isOpen: boolean;
  campaign: {
    id: string;
    name: string;
    newStatus: boolean;
  } | null;
  isToggling: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ToggleWarningModal({
  isOpen,
  campaign,
  isToggling,
  onConfirm,
  onCancel,
}: ToggleWarningModalProps) {
  if (!isOpen || !campaign) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Activer la campagne</h3>
              <p className="mt-2 text-sm text-gray-500">
                Vous êtes sur le point d&apos;activer la campagne <strong>{campaign.name}</strong>.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                <strong>Attention :</strong> Cette action va automatiquement désactiver toutes les
                autres campagnes de ce commerce. Une seule campagne peut être active à la fois.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isToggling}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isToggling ? 'Activation...' : 'Activer'}
          </button>
        </div>
      </div>
    </div>
  );
}
