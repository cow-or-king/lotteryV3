/**
 * Composant Filtres pour la page Winners
 */

type WinnerStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED' | undefined;

interface CampaignItem {
  id: string;
  name: string;
  storeName: string;
}

interface WinnersFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: WinnerStatus;
  onStatusChange: (status: WinnerStatus) => void;
  selectedCampaignId?: string;
  onCampaignChange: (campaignId: string | undefined) => void;
  campaigns?: CampaignItem[];
}

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

export function WinnersFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  selectedCampaignId,
  onCampaignChange,
  campaigns,
}: WinnersFiltersProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 mb-8 shadow-sm">
      <div className="space-y-4">
        {/* Recherche */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
                onClick={() => onStatusChange(btn.value)}
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
            onChange={(e) => onCampaignChange(e.target.value || undefined)}
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
  );
}
