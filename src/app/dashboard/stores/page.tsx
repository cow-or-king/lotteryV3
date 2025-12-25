/**
 * Stores Page - Refactored
 * Page de gestion des commerces
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import {
  BrandSection,
  EditBrandModal,
  EditStoreModal,
  EmptyState,
  GoogleApiHelpModal,
  GoogleUrlHelpModal,
  LoadingState,
  PlaceIdHelpModal,
  StoreModal,
  UpgradeModal,
} from '@/components/stores';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CustomizeQRCodeModal } from '@/components/qr-codes/CustomizeQRCodeModal';
import { useBrands, useStoreLimits, useStores } from '@/hooks/stores';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function StoresPage() {
  // Hooks
  const storesHook = useStores();
  const brandsHook = useBrands();
  const limitsHook = useStoreLimits();

  // Help modals state
  const [showGoogleUrlHelp, setShowGoogleUrlHelp] = useState(false);
  const [showPlaceIdHelp, setShowPlaceIdHelp] = useState(false);
  const [showGoogleApiHelp, setShowGoogleApiHelp] = useState(false);

  // QR Code customization state
  const [customizingStore, setCustomizingStore] = useState<{
    id: string;
    name: string;
    defaultQrCodeId: string | null;
    qrCodeCustomized: boolean;
    qrCodeCustomizedAt: string | null;
    logoUrl: string | null;
  } | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Enseignes</h1>
          <p className="text-gray-600">Gérez vos enseignes et leurs commerces</p>
        </div>
        {brandsHook.brands.length > 0 && (
          <button
            onClick={() => {
              storesHook.setIsNewBrand(true);
              storesHook.setShowCreateForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Créer une enseigne
          </button>
        )}
      </div>

      {/* Liste des enseignes et leurs commerces */}
      {storesHook.isLoading ? (
        <LoadingState />
      ) : brandsHook.brands.length > 0 ? (
        <div className="space-y-8">
          {brandsHook.brands.map((brand) => (
            <BrandSection
              key={brand.brandId}
              brand={brand}
              openBrandMenuId={brandsHook.openBrandMenuId}
              onBrandMenuToggle={(id) =>
                brandsHook.setOpenBrandMenuId(brandsHook.openBrandMenuId === id ? null : id)
              }
              onEditBrand={() => {
                brandsHook.setEditingBrand({
                  id: brand.brandId,
                  name: brand.brandName,
                  logoUrl: brand.logoUrl,
                });
                brandsHook.setOpenBrandMenuId(null);
              }}
              onDeleteBrand={() => brandsHook.handleDeleteBrand(brand.brandId, brand.brandName)}
              onAddStore={() => {
                storesHook.setSelectedBrandId(brand.brandId);
                storesHook.setIsNewBrand(false);
                storesHook.setShowCreateForm(true);
              }}
              openStoreMenuId={storesHook.openMenuId}
              onStoreMenuToggle={(id) =>
                storesHook.setOpenMenuId(storesHook.openMenuId === id ? null : id)
              }
              onEditStore={(store) => {
                storesHook.setEditingStore(store);
                storesHook.setOpenMenuId(null);
              }}
              onDeleteStore={storesHook.handleDeleteStore}
              onCustomizeQRCode={(store) => {
                setCustomizingStore(store);
                storesHook.setOpenMenuId(null);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          onCreateBrand={() => {
            storesHook.setIsNewBrand(true);
            storesHook.setShowCreateForm(true);
          }}
        />
      )}

      {/* Modal de création */}
      <StoreModal
        isOpen={storesHook.showCreateForm}
        onClose={storesHook.resetForm}
        isNewBrand={storesHook.isNewBrand}
        setIsNewBrand={storesHook.setIsNewBrand}
        selectedBrand={
          storesHook.selectedBrand
            ? {
                brandName: storesHook.selectedBrand.brandName,
                logoUrl: storesHook.selectedBrand.brandLogoUrl,
              }
            : null
        }
        formData={storesHook.formData}
        setFormData={storesHook.setFormData}
        errors={storesHook.errors}
        onSubmit={storesHook.handleSubmit}
        isSubmitting={storesHook.createStore.isPending}
        limits={limitsHook.limits || null}
        onShowGoogleUrlHelp={() => setShowGoogleUrlHelp(true)}
        onShowPlaceIdHelp={() => setShowPlaceIdHelp(true)}
        onShowGoogleApiHelp={() => setShowGoogleApiHelp(true)}
      />

      {/* Modal d'édition de commerce */}
      <EditStoreModal
        isOpen={!!storesHook.editingStore}
        onClose={() => storesHook.setEditingStore(null)}
        store={storesHook.editingStore}
        setStore={storesHook.setEditingStore}
        onSubmit={storesHook.handleUpdateStore}
        isSubmitting={storesHook.updateStore.isPending}
        onShowGoogleUrlHelp={() => setShowGoogleUrlHelp(true)}
        storeBrand={
          storesHook.editingStore && storesHook.stores
            ? (() => {
                const editingStore = storesHook.editingStore;
                if (!editingStore) {
                  return null;
                }
                const store = storesHook.stores.find((s) => s.id === editingStore.id);
                return store
                  ? {
                      brandName: store.brandName,
                      logoUrl: store.brandLogoUrl,
                    }
                  : null;
              })()
            : null
        }
      />

      {/* Modal d'édition d'enseigne */}
      <EditBrandModal
        isOpen={!!brandsHook.editingBrand}
        onClose={() => brandsHook.setEditingBrand(null)}
        brand={brandsHook.editingBrand}
        setBrand={brandsHook.setEditingBrand}
        onSubmit={brandsHook.handleUpdateBrand}
        isSubmitting={brandsHook.updateBrand.isPending}
      />

      {/* Modal: URL Google Business */}
      <GoogleUrlHelpModal isOpen={showGoogleUrlHelp} onClose={() => setShowGoogleUrlHelp(false)} />

      {/* Modal: Google Place ID */}
      <PlaceIdHelpModal isOpen={showPlaceIdHelp} onClose={() => setShowPlaceIdHelp(false)} />

      {/* Modal: Google API Key */}
      <GoogleApiHelpModal isOpen={showGoogleApiHelp} onClose={() => setShowGoogleApiHelp(false)} />

      {/* Modal: Upgrade Plan (Informatif en mode dev) */}
      <UpgradeModal
        isOpen={limitsHook.showUpgradeModal}
        onClose={() => limitsHook.setShowUpgradeModal(false)}
        limits={limitsHook.limits || null}
      />

      {/* Confirm Dialogs */}
      <ConfirmDialog {...storesHook.ConfirmDialogProps} />
      <ConfirmDialog {...brandsHook.ConfirmDialogProps} />

      {/* Customize QR Code Modal */}
      {customizingStore && (
        <CustomizeQRCodeModal
          isOpen={!!customizingStore}
          onClose={() => setCustomizingStore(null)}
          store={customizingStore}
        />
      )}
    </div>
  );
}
