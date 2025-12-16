/**
 * Step 1: Basic Information
 * Brand selection, store selection, campaign name and description
 */

'use client';

interface Brand {
  id: string;
  name: string;
}

interface Store {
  id: string;
  name: string;
  brandId: string;
}

interface Step1BasicInfoProps {
  brands: Brand[];
  stores: Store[];
  selectedBrandId: string;
  storeId: string;
  name: string;
  description: string;
  onBrandChange: (brandId: string) => void;
  onStoreChange: (storeId: string) => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  isLoadingStores: boolean;
}

export default function Step1BasicInfo({
  brands,
  stores,
  selectedBrandId,
  storeId,
  name,
  description,
  onBrandChange,
  onStoreChange,
  onNameChange,
  onDescriptionChange,
  isLoadingStores,
}: Step1BasicInfoProps) {
  const filteredStores = selectedBrandId
    ? stores.filter((store) => store.brandId === selectedBrandId)
    : stores;

  return (
    <div className="space-y-4">
      {brands.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Enseigne *</label>
          <select
            value={selectedBrandId}
            onChange={(e) => onBrandChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
            disabled={isLoadingStores}
          >
            <option value="">Sélectionnez une enseigne</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Commerce *</label>
        <select
          value={storeId}
          onChange={(e) => onStoreChange(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
          disabled={isLoadingStores || (brands.length > 1 && !selectedBrandId)}
        >
          <option value="">
            {brands.length > 1 && !selectedBrandId
              ? "Sélectionnez d'abord une enseigne"
              : 'Sélectionnez un commerce'}
          </option>
          {filteredStores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la campagne *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
          placeholder="Ex: Campagne Noël 2024"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (optionnel)
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
          rows={3}
          placeholder="Description de la campagne..."
        />
      </div>
    </div>
  );
}
