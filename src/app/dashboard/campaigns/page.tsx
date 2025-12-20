/**
 * Campaigns Page
 * Page de gestion des campagnes
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCampaignsList } from '@/hooks/campaigns/useCampaignsList';
import { useCampaignActions } from '@/hooks/campaigns/useCampaignActions';
import CreateCampaignWizard from '@/components/campaigns/CreateCampaignWizard';
import CampaignCard from '@/components/campaigns/CampaignCard';
import QRCodeModal from '@/components/campaigns/QRCodeModal';
import DeleteCampaignModal from '@/components/campaigns/DeleteCampaignModal';
import ToggleWarningModal from '@/components/campaigns/ToggleWarningModal';
import EditCampaignModal from '@/components/campaigns/EditCampaignModal';
import EmptyState from '@/components/campaigns/EmptyState';

export default function CampaignsPage() {
  const { campaigns, isLoading, hasNoStores, hasNoCampaigns, isWizardOpen, setIsWizardOpen } =
    useCampaignsList();

  const {
    showWarning,
    selectedCampaign,
    isToggling,
    handleToggleClick,
    handleConfirmToggle,
    handleCancelToggle,
    showDeleteConfirm,
    campaignToDelete,
    isDeleting,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  } = useCampaignActions();

  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<{
    id: string;
    url: string;
    campaignName: string;
  } | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState<{
    id: string;
    name: string;
    description?: string | null;
    maxParticipants?: number | null;
    minDaysBetweenPlays?: number | null;
    prizeClaimExpiryDays?: number | null;
  } | null>(null);

  const handleQRCodeClick = (campaign: { id: string; url: string; campaignName: string }) => {
    setSelectedQRCode(campaign);
    setShowQRCode(true);
  };

  const handleCloseQRCode = () => {
    setShowQRCode(false);
    setSelectedQRCode(null);
  };

  const handleEditClick = (campaign: {
    id: string;
    name: string;
    description?: string | null;
    maxParticipants?: number | null;
    minDaysBetweenPlays?: number | null;
    prizeClaimExpiryDays?: number | null;
  }) => {
    setCampaignToEdit(campaign);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setCampaignToEdit(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (hasNoStores) {
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
      {!hasNoCampaigns && campaigns ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              isToggling={isToggling}
              onToggleClick={handleToggleClick}
              onDeleteClick={handleDeleteClick}
              onQRCodeClick={handleQRCodeClick}
              onEditClick={handleEditClick}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreateClick={() => setIsWizardOpen(true)} />
      )}

      {/* Modals */}
      <ToggleWarningModal
        isOpen={showWarning}
        campaign={selectedCampaign}
        isToggling={isToggling}
        onConfirm={handleConfirmToggle}
        onCancel={handleCancelToggle}
      />

      <DeleteCampaignModal
        isOpen={showDeleteConfirm}
        campaign={campaignToDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <QRCodeModal isOpen={showQRCode} qrCode={selectedQRCode} onClose={handleCloseQRCode} />

      <EditCampaignModal
        isOpen={showEditModal}
        campaign={campaignToEdit}
        onClose={handleCloseEdit}
        onSuccess={handleCloseEdit}
      />

      {/* Wizard Modal */}
      <CreateCampaignWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
}
