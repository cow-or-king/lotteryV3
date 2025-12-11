/**
 * Prizes Page
 * Page de gestion des gains et lots
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import { api } from '@/lib/trpc/client';
import { Gift, Package, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { usePrizes, usePrizeSets } from '@/hooks/prizes';
import {
  PrizeTemplateCard,
  PrizeTemplateModal,
  PrizeSetCard,
  PrizeSetModal,
} from '@/components/prizes';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function PrizesPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'sets'>('templates');

  // Get stores data for brands
  const { data: storesList } = api.store.list.useQuery();

  // Extract unique brands from stores
  const brands = useMemo(() => {
    if (!storesList) {
      return [];
    }
    const brandMap = new Map();
    storesList.forEach((store: { brandId: string; brandName: string; logoUrl: string }) => {
      if (!brandMap.has(store.brandId)) {
        brandMap.set(store.brandId, {
          id: store.brandId,
          name: store.brandName,
          logoUrl: store.logoUrl,
        });
      }
    });
    return Array.from(brandMap.values());
  }, [storesList]);

  // Use custom hooks
  const prizeHook = usePrizes();
  const prizeSetHook = usePrizeSets(prizeHook.prizeTemplates);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gains & Lots</h1>
          <p className="text-gray-600">Gérez vos gains et créez des lots personnalisés</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-purple-600/20">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'templates'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Mes Gains
          </div>
        </button>
        <button
          onClick={() => setActiveTab('sets')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'sets'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Mes Lots
          </div>
        </button>
      </div>

      {/* Prize Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => prizeHook.handleOpenCreateForm(brands)}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Créer un gain
            </button>
          </div>

          {prizeHook.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-6 w-32 bg-purple-100/30 rounded mb-4"></div>
                  <div className="h-4 w-full bg-purple-100/30 rounded"></div>
                </div>
              ))}
            </div>
          ) : prizeHook.prizeTemplates && prizeHook.prizeTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prizeHook.prizeTemplates.map((template) => {
                const templateBrand = template.brandId
                  ? brands.find((b) => b.id === template.brandId)
                  : null;
                return (
                  <PrizeTemplateCard
                    key={template.id}
                    template={template}
                    brandLogo={templateBrand?.logoUrl}
                    brandName={templateBrand?.name}
                    onEdit={() =>
                      prizeHook.setEditingTemplate({
                        id: template.id,
                        name: template.name,
                        description: template.description || '',
                        minPrice: template.minPrice || null,
                        maxPrice: template.maxPrice || null,
                        color: template.color,
                        iconUrl: template.iconUrl || null,
                      })
                    }
                    onDelete={() => prizeHook.handleDelete(template.id, template.name)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-linear-to-br from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-full flex items-center justify-center mb-6">
                <Gift className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucun gain</h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Créez vos premiers gains pour les utiliser dans vos campagnes.
              </p>
              <button
                onClick={() => prizeHook.handleOpenCreateForm(brands)}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Créer mon premier gain
              </button>
            </div>
          )}
        </div>
      )}

      {/* Prize Sets Tab */}
      {activeTab === 'sets' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => prizeSetHook.handleOpenCreateForm(brands)}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Créer un lot
            </button>
          </div>

          {prizeSetHook.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-6 w-32 bg-purple-100/30 rounded mb-4"></div>
                  <div className="h-4 w-full bg-purple-100/30 rounded"></div>
                </div>
              ))}
            </div>
          ) : prizeSetHook.prizeSets && prizeSetHook.prizeSets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prizeSetHook.prizeSets.map((set) => (
                <PrizeSetCard
                  key={set.id}
                  set={set}
                  onEdit={() => prizeSetHook.handleEditSet(set)}
                  onDelete={() => prizeSetHook.handleDelete(set.id, set.name)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-linear-to-br from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-full flex items-center justify-center mb-6">
                <Package className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucun lot</h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Créez vos premiers lots en regroupant plusieurs gains.
              </p>
              <button
                onClick={() => prizeSetHook.handleOpenCreateForm(brands)}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Créer mon premier lot
              </button>
            </div>
          )}
        </div>
      )}

      {/* Prize Template Modals */}
      <PrizeTemplateModal
        isOpen={prizeHook.showCreateForm}
        onClose={() => prizeHook.setShowCreateForm(false)}
        formData={prizeHook.formData}
        setFormData={prizeHook.setFormData}
        brands={brands}
        onSubmit={prizeHook.handleCreate}
        isSubmitting={prizeHook.createTemplate.isPending}
      />

      <PrizeTemplateModal
        isOpen={!!prizeHook.editingTemplate}
        onClose={() => prizeHook.setEditingTemplate(null)}
        isEditing
        editingData={prizeHook.editingTemplate || undefined}
        setEditingData={prizeHook.setEditingTemplate}
        brands={brands}
        onSubmit={prizeHook.handleUpdate}
        isSubmitting={prizeHook.updateTemplate.isPending}
      />

      {/* Prize Set Modals */}
      <PrizeSetModal
        isOpen={prizeSetHook.showCreateForm}
        onClose={() => {
          prizeSetHook.setShowCreateForm(false);
          prizeSetHook.setSelectedItems([]);
        }}
        formData={prizeSetHook.formData}
        setFormData={prizeSetHook.setFormData}
        brands={brands}
        availablePrizeTemplates={prizeSetHook.availablePrizeTemplates}
        selectedItems={prizeSetHook.selectedItems}
        totalProbability={prizeSetHook.totalProbability}
        onTogglePrizeTemplate={prizeSetHook.handleTogglePrizeTemplate}
        onUpdateItemProbability={prizeSetHook.handleUpdateItemProbability}
        onUpdateItemQuantity={prizeSetHook.handleUpdateItemQuantity}
        onSubmit={prizeSetHook.handleCreate}
        isSubmitting={prizeSetHook.createSet.isPending}
      />

      <PrizeSetModal
        isOpen={!!prizeSetHook.editingSet}
        onClose={() => {
          prizeSetHook.setEditingSet(null);
          prizeSetHook.setSelectedItems([]);
        }}
        isEditing
        editingData={prizeSetHook.editingSet || undefined}
        setEditingData={prizeSetHook.setEditingSet}
        brands={brands}
        availablePrizeTemplates={prizeSetHook.availablePrizeTemplatesForEdit}
        selectedItems={prizeSetHook.selectedItems}
        totalProbability={prizeSetHook.totalProbability}
        onTogglePrizeTemplate={prizeSetHook.handleTogglePrizeTemplate}
        onUpdateItemProbability={prizeSetHook.handleUpdateItemProbability}
        onUpdateItemQuantity={prizeSetHook.handleUpdateItemQuantity}
        onSubmit={prizeSetHook.handleUpdate}
        isSubmitting={prizeSetHook.updateSet.isPending}
      />

      {/* Confirm Dialogs */}
      <ConfirmDialog {...prizeHook.ConfirmDialogProps} />
      <ConfirmDialog {...prizeSetHook.ConfirmDialogProps} />
    </div>
  );
}
