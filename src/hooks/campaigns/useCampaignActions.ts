/**
 * Hook pour gérer les actions sur les campagnes
 * Contient la logique de toggle status et delete
 */

'use client';

import { useState } from 'react';
import { useToggleCampaignStatus, useDeleteCampaign } from '@/hooks/campaigns';

export type ToggleCampaignData = {
  id: string;
  name: string;
  newStatus: boolean;
};

export type DeleteCampaignData = {
  id: string;
  name: string;
};

export function useCampaignActions() {
  const { toggleStatus, isToggling } = useToggleCampaignStatus();
  const { deleteCampaign, isDeleting } = useDeleteCampaign();

  // State pour le toggle
  const [showWarning, setShowWarning] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<ToggleCampaignData | null>(null);

  // State pour le delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<DeleteCampaignData | null>(null);

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
    if (!selectedCampaign) {
      return;
    }

    await toggleStatus({
      id: selectedCampaign.id,
      isActive: selectedCampaign.newStatus,
    });

    setShowWarning(false);
    setSelectedCampaign(null);
  };

  const handleCancelToggle = () => {
    setShowWarning(false);
    setSelectedCampaign(null);
  };

  const handleDeleteClick = (campaign: { id: string; name: string }) => {
    setCampaignToDelete(campaign);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) {
      return;
    }

    await deleteCampaign({ id: campaignToDelete.id });

    setShowDeleteConfirm(false);
    setCampaignToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setCampaignToDelete(null);
  };

  return {
    // Toggle status
    showWarning,
    selectedCampaign,
    isToggling,
    handleToggleClick,
    handleConfirmToggle,
    handleCancelToggle,

    // Delete campaign
    showDeleteConfirm,
    campaignToDelete,
    isDeleting,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}
