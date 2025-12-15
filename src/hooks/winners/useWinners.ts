/**
 * useWinners Hook
 * Hook pour gérer les winners (gagnants)
 * IMPORTANT: ZERO any types
 */

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';

type WinnerStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED' | undefined;

export function useWinners() {
  const [statusFilter, setStatusFilter] = useState<WinnerStatus>('PENDING');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>(undefined);

  // Query pour récupérer les winners
  const {
    data: winners,
    isLoading,
    error,
    refetch,
  } = api.winner.listAll.useQuery(
    {
      status: statusFilter,
      campaignId: selectedCampaignId,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  // Query pour récupérer les stats
  const { data: stats, isLoading: statsLoading } = api.winner.getStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // Mutation pour marquer comme réclamé
  const markAsClaimedMutation = api.winner.markAsClaimed.useMutation({
    onSuccess: () => {
      toast.success('Lot marqué comme réclamé');
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la réclamation');
    },
  });

  const handleMarkAsClaimed = async (winnerId: string) => {
    await markAsClaimedMutation.mutateAsync({ id: winnerId });
  };

  return {
    winners: winners ?? [],
    isLoading,
    error,
    stats: stats ?? { total: 0, pending: 0, claimed: 0, expired: 0 },
    statsLoading,
    statusFilter,
    setStatusFilter,
    selectedCampaignId,
    setSelectedCampaignId,
    handleMarkAsClaimed,
    isMarkingAsClaimed: markAsClaimedMutation.isPending,
    refetch,
  };
}
