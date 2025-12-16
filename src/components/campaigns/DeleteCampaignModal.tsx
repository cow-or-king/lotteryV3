/**
 * Composant DeleteCampaignModal
 * Modal de confirmation pour la suppression d'une campagne
 */

'use client';

import { Trash2 } from 'lucide-react';

export type DeleteCampaignModalProps = {
  isOpen: boolean;
  campaign: {
    id: string;
    name: string;
  } | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteCampaignModal({
  isOpen,
  campaign,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteCampaignModalProps) {
  if (!isOpen || !campaign) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Supprimer la campagne</h3>
              <p className="mt-2 text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer la campagne <strong>{campaign.name}</strong> ?
              </p>
              <p className="mt-2 text-sm text-red-600">
                <strong>Attention :</strong> Cette action est irréversible. Toutes les données
                associées (participants, lots gagnés, etc.) seront définitivement supprimées.
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
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}
