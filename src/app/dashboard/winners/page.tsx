/**
 * Winners Page
 * Page pour afficher et gérer les gagnants
 * IMPORTANT: ZERO any types
 */

'use client';

import { WinnerRow } from '@/components/winners/WinnerRow';
import { useWinners } from '@/hooks/winners/useWinners';
import { api } from '@/lib/trpc/client';
import { Trophy } from 'lucide-react';
import { useState } from 'react';

type WinnerStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED' | undefined;

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

  // Filtrer les winners selon la recherche ET exclure les expirés si on filtre sur PENDING
  const filteredWinners = winners.filter((winner) => {
    const matchesSearch =
      searchQuery === '' ||
      winner.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      winner.participantEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      winner.claimCode.toLowerCase().includes(searchQuery.toLowerCase());

    // Si filtre PENDING, exclure les expirés
    const isExpired = new Date() > new Date(winner.expiresAt);
    if (statusFilter === 'PENDING' && isExpired) {
      return false;
    }

    return matchesSearch;
  });

  const statusButtons: { value: WinnerStatus; label: string; color: string }[] = [
    { value: undefined, label: 'Tous', color: 'bg-gray-200 text-gray-900 border-gray-400' },
    {
      value: 'PENDING',
      label: 'En attente',
      color: 'bg-amber-100 text-amber-900 border-amber-400',
    },
    {
      value: 'CLAIMED',
      label: 'Réclamés',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-400',
    },
    { value: 'EXPIRED', label: 'Expirés', color: 'bg-red-100 text-red-900 border-red-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Gagnants</h1>
              <p className="text-gray-600">Gérez les gagnants de vos campagnes</p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Total</p>
            <p className="text-3xl font-bold text-gray-900">{statsLoading ? '...' : stats.total}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-amber-200/50 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-amber-700 mb-2">En attente</p>
            <p className="text-3xl font-bold text-amber-600">
              {statsLoading ? '...' : stats.pending}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-emerald-200/50 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-emerald-700 mb-2">Réclamés</p>
            <p className="text-3xl font-bold text-emerald-600">
              {statsLoading ? '...' : stats.claimed}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-red-700 mb-2">Expirés</p>
            <p className="text-3xl font-bold text-red-600">
              {statsLoading ? '...' : stats.expired}
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 mb-8 shadow-sm">
          <div className="space-y-4">
            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom, email ou code..."
                className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <div className="flex flex-wrap gap-2">
                {statusButtons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => setStatusFilter(btn.value)}
                    className={`px-4 py-2 rounded-lg font-medium border transition-all ${
                      statusFilter === btn.value
                        ? btn.color
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre par campagne */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campagne</label>
              <select
                value={selectedCampaignId || ''}
                onChange={(e) => setSelectedCampaignId(e.target.value || undefined)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Toutes les campagnes</option>
                {campaigns?.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name} - {campaign.storeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des gagnants */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-violet-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        ) : filteredWinners.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm">
            <p className="text-gray-600 text-lg">Aucun gagnant trouvé</p>
            {(statusFilter || selectedCampaignId || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('PENDING');
                  setSelectedCampaignId(undefined);
                  setSearchQuery('');
                }}
                className="mt-4 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl overflow-hidden shadow-sm">
            {/* En-tête du tableau */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/50 border-b border-gray-200/50 text-sm font-medium text-gray-700">
              <div className="col-span-2">Participant</div>
              <div className="col-span-2">Lot</div>
              <div className="col-span-2">Code</div>
              <div className="col-span-2">Campagne</div>
              <div className="col-span-2">Dates</div>
              <div className="col-span-1">Statut</div>
              <div className="col-span-1">Action</div>
            </div>

            {/* Lignes du tableau */}
            <div className="divide-y divide-gray-200">
              {filteredWinners.map((winner) => (
                <WinnerRow
                  key={winner.id}
                  winner={winner as unknown as Parameters<typeof WinnerRow>[0]['winner']}
                  onMarkAsClaimed={handleMarkAsClaimed}
                  isMarkingAsClaimed={isMarkingAsClaimed}
                />
              ))}
            </div>
          </div>
        )}

        {/* Compteur de résultats */}
        {!isLoading && filteredWinners.length > 0 && (
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
