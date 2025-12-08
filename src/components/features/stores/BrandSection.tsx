'use client';

import { Edit2, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { StoreCard } from './StoreCard';

interface BrandSectionProps {
  brand: {
    brandId: string;
    brandName: string;
    logoUrl: string;
    stores: Array<{
      id: string;
      name: string;
      slug: string;
      googleBusinessUrl: string;
      googlePlaceId: string | null;
      createdAt: Date;
    }>;
  };
  openBrandMenuId: string | null;
  onBrandMenuToggle: (id: string) => void;
  onEditBrand: () => void;
  onDeleteBrand: () => void;
  onAddStore: () => void;
  openStoreMenuId: string | null;
  onStoreMenuToggle: (id: string) => void;
  onEditStore: (store: { id: string; name: string; googleBusinessUrl: string }) => void;
  onDeleteStore: (storeId: string, storeName: string) => void;
}

export function BrandSection({
  brand,
  openBrandMenuId,
  onBrandMenuToggle,
  onEditBrand,
  onDeleteBrand,
  onAddStore,
  openStoreMenuId,
  onStoreMenuToggle,
  onEditStore,
  onDeleteStore,
}: BrandSectionProps) {
  return (
    <div>
      {/* Header de l'enseigne */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          <img
            src={brand.logoUrl}
            alt={brand.brandName}
            className="w-10 h-10 rounded-xl object-cover"
          />
          <h2 className="text-2xl font-bold text-purple-600">{brand.brandName}</h2>

          {/* Menu 3 points pour l'enseigne */}
          <button
            data-menu-button
            onClick={(e) => {
              e.stopPropagation();
              onBrandMenuToggle(brand.brandId);
            }}
            className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {/* Menu dropdown enseigne */}
          {openBrandMenuId === brand.brandId && (
            <div
              data-menu-dropdown
              className="absolute left-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-purple-600/20 py-2 z-10"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditBrand();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Modifier l'enseigne
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBrand();
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer l'enseigne
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onAddStore}
          className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Ajouter un commerce
        </button>
      </div>

      {/* Liste des commerces de cette enseigne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brand.stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            openMenuId={openStoreMenuId}
            onMenuToggle={onStoreMenuToggle}
            onEdit={() =>
              onEditStore({
                id: store.id,
                name: store.name,
                googleBusinessUrl: store.googleBusinessUrl,
              })
            }
            onDelete={() => onDeleteStore(store.id, store.name)}
          />
        ))}
      </div>
    </div>
  );
}
