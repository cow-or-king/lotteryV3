'use client';

import { api } from '@/lib/trpc/client';
import { Store as StoreIcon } from 'lucide-react';

/**
 * Props for the QRCodeStoreSelector component
 */
interface QRCodeStoreSelectorProps {
  /** Currently selected store ID */
  value: string | null;
  /** Callback fired when store selection changes */
  onChange: (storeId: string | null) => void;
}

/**
 * QRCodeStoreSelector component for selecting a store to link with a QR code
 *
 * Displays a dropdown with all user's stores, allowing them to link
 * the QR code to a specific business location.
 *
 * @component
 * @example
 * ```tsx
 * <QRCodeStoreSelector
 *   value={selectedStoreId}
 *   onChange={setSelectedStoreId}
 * />
 * ```
 */
export default function QRCodeStoreSelector({ value, onChange }: QRCodeStoreSelectorProps) {
  // Fetch user's stores
  const { data: stores, isLoading } = api.store.list.useQuery();

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
        <StoreIcon className="w-4 h-4" />
        Commerce associé (optionnel)
      </label>

      {isLoading ? (
        <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500">
          Chargement...
        </div>
      ) : stores && stores.length > 0 ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
        >
          <option value="">Aucun commerce</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name} {store.brandName && `- ${store.brandName}`}
            </option>
          ))}
        </select>
      ) : (
        <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 text-sm">
          Créez un commerce pour pouvoir le lier à un QR code.
        </div>
      )}

      <p className="text-xs text-gray-600 mt-2">
        Liez ce QR code à un commerce spécifique pour tracker les statistiques par emplacement.
      </p>
    </div>
  );
}
