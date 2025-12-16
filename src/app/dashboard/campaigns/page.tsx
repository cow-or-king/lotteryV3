/**
 * Campaigns Page
 * Page de gestion des campagnes
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useState } from 'react';
import {
  Plus,
  Gift,
  Users,
  AlertCircle,
  Power,
  ExternalLink,
  Trash2,
  Edit2,
  QrCode,
} from 'lucide-react';
import { useStores } from '@/hooks/stores';
import { useAllCampaigns, useToggleCampaignStatus, useDeleteCampaign } from '@/hooks/campaigns';
import CreateCampaignWizard from '@/components/campaigns/CreateCampaignWizard';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<{
    id: string;
    url: string;
    campaignName: string;
  } | null>(null);

  const { toggleStatus, isToggling } = useToggleCampaignStatus();
  const { deleteCampaign, isDeleting } = useDeleteCampaign();

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

  const handleDeleteClick = (campaign: { id: string; name: string }) => {
    setCampaignToDelete(campaign);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;

    await deleteCampaign({ id: campaignToDelete.id });

    setShowDeleteConfirm(false);
    setCampaignToDelete(null);
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
              {/* Status Badge + Toggle + QR Code Icon */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      campaign.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {campaign.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {campaign.isActive && campaign.qrCodeUrl && (
                    <button
                      onClick={() => {
                        setSelectedQRCode({
                          id: campaign.id,
                          url: campaign.qrCodeUrl,
                          campaignName: campaign.name,
                        });
                        setShowQRCode(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                      title="Voir le QR Code"
                    >
                      <QrCode className="h-3 w-3" />
                      QR
                    </button>
                  )}
                </div>
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
                  className="flex-1 rounded-md bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 flex items-center justify-center gap-1"
                  onClick={() => toast.info('Modifier (à implémenter)')}
                >
                  <Edit2 className="h-4 w-4" />
                  Modifier
                </button>
                <button
                  className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 flex items-center justify-center gap-1"
                  onClick={() => handleDeleteClick(campaign)}
                  title="Supprimer la campagne"
                >
                  <Trash2 className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && campaignToDelete && (
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
                    Êtes-vous sûr de vouloir supprimer la campagne{' '}
                    <strong>{campaignToDelete.name}</strong> ?
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
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCampaignToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Dialog */}
      {showQRCode && selectedQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">QR Code de la campagne</h3>
                  <p className="mt-1 text-sm text-gray-500">{selectedQRCode.campaignName}</p>
                </div>
              </div>
              <div className="flex justify-center bg-gray-50 p-8 rounded-lg">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Image
                    src={selectedQRCode.url}
                    alt={`QR Code - ${selectedQRCode.campaignName}`}
                    width={200}
                    height={200}
                    className="w-48 h-48"
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-1">URL de la campagne:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/c/${selectedQRCode.id}`}
                    className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/c/${selectedQRCode.id}`,
                      );
                      toast.success('URL copiée !');
                    }}
                    className="px-2 py-1 text-xs font-medium text-white bg-purple-600 rounded hover:bg-purple-700"
                  >
                    Copier
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-center text-gray-500">
                Scannez ce QR code ou partagez l&apos;URL pour accéder à cette campagne
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-lg">
              <button
                onClick={() => {
                  setShowQRCode(false);
                  setSelectedQRCode(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  // Télécharger le QR code
                  const link = document.createElement('a');
                  link.href = selectedQRCode.url;
                  link.download = `qr-code-${selectedQRCode.campaignName}.png`;
                  link.click();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Télécharger QR
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
