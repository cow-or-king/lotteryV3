/**
 * Winners Page
 * Page pour afficher et gérer les gagnants
 * IMPORTANT: ZERO any types
 */

'use client';

import { WinnersHeader } from '@/components/winners/WinnersHeader';
import { WinnersStatsCards } from '@/components/winners/WinnersStats';
import { WinnersFilters } from '@/components/winners/WinnersFilters';
import { WinnersTable } from '@/components/winners/WinnersTable';
import { EmptyWinnersState } from '@/components/winners/EmptyWinnersState';
import { useWinners } from '@/hooks/winners/useWinners';
import { useWinnersFiltering } from '@/hooks/winners/useWinnersFiltering';
import { api } from '@/lib/trpc/client';
import { useState } from 'react';

export default function WinnersPage() {
  const {
    winners,
    isLoading,
    stats,
    statsLoading,
    statusFilter,
    setStatusFilter,
    selectedCampaignId,
    setSelectedCampaignId,
    handleMarkAsClaimed,
    isMarkingAsClaimed,
  } = useWinners();

  const [searchQuery, setSearchQuery] = useState('');

  // Récupérer la liste des campagnes pour le filtre
  const { data: campaigns } = api.campaign.listAll.useQuery();

  // Filtrer les winners
  const filteredWinners = useWinnersFiltering({ winners, searchQuery, statusFilter });

  // Handlers
  const handleResetFilters = () => {
    setStatusFilter('PENDING');
    setSelectedCampaignId(undefined);
    setSearchQuery('');
  };

  // États d'affichage
  const hasFilters = Boolean(statusFilter || selectedCampaignId || searchQuery);
  const showEmptyState = !isLoading && filteredWinners.length === 0;
  const showTable = !isLoading && filteredWinners.length > 0;
  const showResultsCount = !isLoading && filteredWinners.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <WinnersHeader />

        <WinnersStatsCards stats={stats} isLoading={statsLoading} />

        <WinnersFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          selectedCampaignId={selectedCampaignId}
          onCampaignChange={setSelectedCampaignId}
          campaigns={campaigns}
        />

        {/* États conditionnels */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-violet-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        )}

        {showEmptyState && (
          <EmptyWinnersState hasFilters={hasFilters} onResetFilters={handleResetFilters} />
        )}

        {showTable && (
          <WinnersTable
            winners={filteredWinners}
            onMarkAsClaimed={handleMarkAsClaimed}
            isMarkingAsClaimed={isMarkingAsClaimed}
          />
        )}

        {/* Compteur de résultats */}
        {showResultsCount && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {filteredWinners.length} gagnant{filteredWinners.length > 1 ? 's' : ''} affiché
              {filteredWinners.length > 1 ? 's' : ''}
              {winners.length !== filteredWinners.length && ` sur ${winners.length} au total`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
