'use client';

import { X } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  logoUrl: string;
}

interface SetFormData {
  brandId: string;
  name: string;
  description: string;
}

interface EditingSet {
  id: string;
  name: string;
  description: string;
  brandId: string;
}

interface PrizeTemplate {
  id: string;
  name: string;
  description: string | null;
  brandId: string | null;
}

interface SelectedItem {
  prizeTemplateId: string;
  probability: number;
  quantity: number;
}

interface PrizeSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  formData?: SetFormData;
  setFormData?: (data: SetFormData) => void;
  editingData?: EditingSet;
  setEditingData?: (data: EditingSet) => void;
  brands: Brand[];
  availablePrizeTemplates: PrizeTemplate[];
  selectedItems: SelectedItem[];
  totalProbability: number;
  onTogglePrizeTemplate: (templateId: string) => void;
  onUpdateItemProbability: (templateId: string, probability: number) => void;
  onUpdateItemQuantity: (templateId: string, quantity: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function PrizeSetModal({
  isOpen,
  onClose,
  isEditing = false,
  formData,
  setFormData,
  editingData,
  setEditingData,
  brands,
  availablePrizeTemplates,
  selectedItems,
  totalProbability,
  onTogglePrizeTemplate,
  onUpdateItemProbability,
  onUpdateItemQuantity,
  onSubmit,
  isSubmitting,
}: PrizeSetModalProps) {
  if (!isOpen) {
    return null;
  }

  const currentBrandId = isEditing ? editingData?.brandId : formData?.brandId;
  const currentName = isEditing ? editingData?.name : formData?.name;
  const currentDescription = isEditing ? editingData?.description : formData?.description;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Modifier le lot' : 'Nouveau lot'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {!isEditing && formData && setFormData && (
            <div>
              <label htmlFor="set-brandId" className="block text-sm font-medium text-gray-700 mb-2">
                Enseigne *
              </label>
              <select
                id="set-brandId"
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                required
              >
                <option value="">Sélectionner une enseigne</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="set-name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom du lot *
            </label>
            <input
              type="text"
              id="set-name"
              value={currentName}
              onChange={(e) => {
                if (isEditing && editingData && setEditingData) {
                  setEditingData({ ...editingData, name: e.target.value });
                } else if (formData && setFormData) {
                  setFormData({ ...formData, name: e.target.value });
                }
              }}
              className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              placeholder="Ex: Lot Printemps"
              required
            />
          </div>

          <div>
            <label
              htmlFor="set-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="set-description"
              value={currentDescription}
              onChange={(e) => {
                if (isEditing && editingData && setEditingData) {
                  setEditingData({ ...editingData, description: e.target.value });
                } else if (formData && setFormData) {
                  setFormData({ ...formData, description: e.target.value });
                }
              }}
              className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              placeholder="Ex: Lot spécial pour la saison de printemps"
              rows={3}
            />
          </div>

          {currentBrandId && availablePrizeTemplates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner les gains
              </label>
              <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-white/30 rounded-xl border border-purple-600/20">
                {availablePrizeTemplates.map((template) => {
                  const selectedItem = selectedItems.find(
                    (item) => item.prizeTemplateId === template.id,
                  );
                  const isSelected = !!selectedItem;

                  return (
                    <div
                      key={template.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-purple-600/20 bg-white/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onTogglePrizeTemplate(template.id)}
                          className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{template.name}</div>
                          {template.description && (
                            <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                          )}

                          {isSelected && selectedItem && (
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Probabilité (%)
                                </label>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={selectedItem.probability}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(',', '.');
                                    const num = parseFloat(val);
                                    if (val === '' || (!isNaN(num) && num >= 0 && num <= 100)) {
                                      onUpdateItemProbability(template.id, num || 0);
                                    }
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-purple-600/20 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Quantité (0 = illimité)
                                </label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={selectedItem.quantity}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const num = parseInt(val);
                                    if (val === '' || (!isNaN(num) && num >= 0)) {
                                      onUpdateItemQuantity(template.id, num || 0);
                                    }
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-purple-600/20 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                  placeholder="0 = illimité"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedItems.length > 0 && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Total des probabilités : </span>
                  <span
                    className={`font-bold ${
                      totalProbability === 100
                        ? 'text-green-600'
                        : totalProbability > 100
                          ? 'text-red-600'
                          : 'text-orange-600'
                    }`}
                  >
                    {totalProbability.toFixed(1)}%
                  </span>
                  {totalProbability !== 100 && (
                    <span className="text-xs text-gray-600 ml-2">(doit être égal à 100%)</span>
                  )}
                </div>
              )}
            </div>
          )}

          {currentBrandId && availablePrizeTemplates.length === 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
              Aucun gain disponible pour cette enseigne. Créez d&apos;abord des gains.
            </div>
          )}

          <div className="pt-4">
            <p className="text-xs text-gray-600 italic text-right mb-2">* Champs obligatoires</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/50 hover:bg-white/70 border border-purple-600/20 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || totalProbability !== 100}
                className="flex-1 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting
                  ? isEditing
                    ? 'Modification...'
                    : 'Création...'
                  : isEditing
                    ? 'Modifier'
                    : 'Créer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
