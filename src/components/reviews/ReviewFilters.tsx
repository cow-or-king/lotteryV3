/**
 * Composant de filtres et synchronisation des reviews
 */

'use client';

import { RefreshCw, Store as StoreIcon } from 'lucide-react';

interface Store {
  id: string;
  brandName: string;
  name: string;
}

interface ReviewFiltersProps {
  stores: Store[] | undefined;
  storesLoading: boolean;
  selectedStoreId: string | null;
  onStoreChange: (storeId: string) => void;
  onSync: () => void;
  syncLoading: boolean;
}

export function ReviewFilters({
  stores,
  storesLoading,
  selectedStoreId,
  onStoreChange,
  onSync,
  syncLoading,
}: ReviewFiltersProps) {
  return (
    <div className="mb-8 p-6 bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sélecteur de Store */}
        <div className="flex-1">
          <label htmlFor="store-select" className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un commerce
          </label>
          <div className="relative">
            <StoreIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              id="store-select"
              value={selectedStoreId || ''}
              onChange={(e) => onStoreChange(e.target.value)}
              disabled={storesLoading || !stores || stores.length === 0}
              className="w-full pl-10 pr-4 py-3 bg-white border border-purple-600/20 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {storesLoading && <option value="">Chargement...</option>}
              {!storesLoading && (!stores || stores.length === 0) && (
                <option value="">Aucun commerce disponible</option>
              )}
              {stores &&
                stores.length > 0 &&
                stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.brandName} - {store.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Bouton Synchroniser */}
        <div className="flex items-end">
          <button
            onClick={onSync}
            disabled={!selectedStoreId || syncLoading}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <RefreshCw className={`w-5 h-5 ${syncLoading ? 'animate-spin' : ''}`} />
            {syncLoading ? 'Synchronisation...' : 'Synchroniser'}
          </button>
        </div>
      </div>
    </div>
  );
}
