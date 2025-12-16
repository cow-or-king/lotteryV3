/**
 * Hook pour gérer la liste des campagnes
 * Contient la logique de fetch et de state pour les campagnes
 */

'use client';

import { useState } from 'react';
import { useAllCampaigns } from '@/hooks/campaigns';
import { useStores } from '@/hooks/stores';

export type Campaign = {
  id: string;
  name: string;
  description?: string | null;
  storeName: string;
  isActive: boolean;
  maxParticipants?: number | null;
  qrCodeUrl?: string | null;
  _count: {
    prizes: number;
    participants: number;
  };
};

export function useCampaignsList() {
  const { stores, isLoading: isLoadingStores } = useStores();
  const { data: allCampaigns, isLoading: isLoadingCampaigns } = useAllCampaigns();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const isLoading = isLoadingStores || isLoadingCampaigns;
  const hasNoStores = !stores || stores.length === 0;
  const hasNoCampaigns = !allCampaigns || allCampaigns.length === 0;

  return {
    stores,
    campaigns: allCampaigns as Campaign[] | undefined,
    isLoading,
    hasNoStores,
    hasNoCampaigns,
    isWizardOpen,
    setIsWizardOpen,
  };
}
