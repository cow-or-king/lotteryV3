/**
 * Campaigns Page
 * Page de gestion des campagnes
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useState } from 'react';
import { Plus, Gift, Users, AlertCircle, Power, ExternalLink } from 'lucide-react';
import { useStores } from '@/hooks/stores';
import { useAllCampaigns, useToggleCampaignStatus } from '@/hooks/campaigns';
import CreateCampaignWizard from '@/components/campaigns/CreateCampaignWizard';
import Link from 'next/link';

export default function CampaignsPage() {
  const { stores, isLoading: isLoadingStores } = useStores();
  const { data: allCampaigns, isLoading: isLoadingCampaigns } = useAllCampaigns();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<{
    id: string;
    name: string;
    newStatus: boolean;
  } | null>(null);

  const { toggleStatus, isToggling } = useToggleCampaignStatus();

  const handleToggleClick = async (campaign: { id: string; name: string; isActive: boolean }) => {
    const newStatus = !campaign.isActive;

    // Si on active la campagne, afficher l'avertissement
    if (newStatus) {
      setSelectedCampaign({
        id: campaign.id,
        name: campaign.name,
        newStatus,
      });
      setShowWarning(true);
    } else {
      // Si on désactive, pas besoin d'avertissement
      await toggleStatus({ id: campaign.id, isActive: false });
    }
  };

  const handleConfirmToggle = async () => {
    if (!selectedCampaign) return;

    await toggleStatus({
      id: selectedCampaign.id,
      isActive: selectedCampaign.newStatus,
    });

    setShowWarning(false);
    setSelectedCampaign(null);
  };

  if (isLoadingStores || isLoadingCampaigns) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Aucun commerce</h2>
        <p className="mt-2 text-gray-600">
          Créez d&apos;abord un commerce pour pouvoir créer des campagnes.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campagnes</h1>
          <p className="mt-2 text-sm text-gray-600">Gérez vos campagnes de jeux et de lots</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          onClick={() => setIsWizardOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nouvelle campagne
        </button>
      </div>

      {/* Campaigns List */}
      {allCampaigns && allCampaigns.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Status Badge + Toggle */}
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {campaign.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleToggleClick(campaign)}
                  disabled={isToggling}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    campaign.isActive
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={campaign.isActive ? 'Désactiver' : 'Activer'}
                >
                  <Power className="h-3 w-3" />
                  {campaign.isActive ? 'Désactiver' : 'Activer'}
                </button>
              </div>

              {/* Campaign Name */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>

              {/* Store Name */}
              <p className="text-sm text-purple-600 mb-2">{campaign.storeName}</p>

              {/* Description */}
              {campaign.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
              )}

              {/* Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Gift className="h-4 w-4" />
                  <span>{campaign._count.prizes} lots</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {campaign._count.participants} participant
                    {campaign._count.participants > 1 ? 's' : ''}
                    {campaign.maxParticipants && ` / ${campaign.maxParticipants}`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <Link
                  href={`/c/${campaign.id}`}
                  target="_blank"
                  className="flex-1 rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Tester
                </Link>
                <button
                  className="flex-1 rounded-md bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
                  onClick={() => alert('Voir les détails (à implémenter)')}
                >
                  Détails
                </button>
                <button
                  className="flex-1 rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => alert('Modifier (à implémenter)')}
                >
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Gift className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucune campagne</h3>
          <p className="mt-1 text-sm text-gray-500">
            Créez votre première campagne pour vos commerces.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
            >
              <Plus className="h-4 w-4" />
              Nouvelle campagne
            </button>
          </div>
        </div>
      )}

      {/* Warning Dialog */}
      {showWarning && selectedCampaign && (
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
                    Vous êtes sur le point d&apos;activer la campagne{' '}
                    <strong>{selectedCampaign.name}</strong>.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    <strong>Attention :</strong> Cette action va automatiquement désactiver toutes
                    les autres campagnes de ce commerce. Une seule campagne peut être active à la
                    fois.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-lg">
              <button
                onClick={() => {
                  setShowWarning(false);
                  setSelectedCampaign(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmToggle}
                disabled={isToggling}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isToggling ? 'Activation...' : 'Activer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Modal */}
      <CreateCampaignWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
}
