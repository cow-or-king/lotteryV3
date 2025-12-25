'use client';

import { X } from 'lucide-react';
import { usePrizeTemplateForm } from '@/hooks/prizes/usePrizeTemplateForm';
import {
  BrandSelect,
  TextInput,
  TextArea,
  PriceInput,
  IconSelector,
  ColorPicker,
} from './PrizeTemplateFormFields';

interface Brand {
  id: string;
  name: string;
  logoUrl: string;
}

interface TemplateFormData {
  brandId: string;
  name: string;
  description: string;
  minPrice: string;
  maxPrice: string;
  color: string;
  iconUrl: string;
}

interface EditingTemplate {
  id: string;
  name: string;
  description: string;
  minPrice: number | null;
  maxPrice: number | null;
  color: string;
  iconUrl: string | null;
}

interface PrizeTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  formData?: TemplateFormData;
  setFormData?: (data: TemplateFormData) => void;
  editingData?: EditingTemplate;
  setEditingData?: (data: EditingTemplate) => void;
  brands: Brand[];
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export function PrizeTemplateModal({
  isOpen,
  onClose,
  isEditing = false,
  formData,
  setFormData,
  editingData,
  setEditingData,
  brands,
  onSubmit,
  isSubmitting,
}: PrizeTemplateModalProps) {
  const form = usePrizeTemplateForm({
    isEditing,
    formData,
    setFormData,
    editingData,
    setEditingData,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Modifier le gain' : 'Nouveau gain'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {!isEditing && formData && setFormData && (
            <BrandSelect
              value={formData.brandId}
              onChange={(value) => setFormData({ ...formData, brandId: value })}
              brands={brands}
            />
          )}

          <TextInput
            id="name"
            label="Nom du gain"
            value={form.name}
            onChange={form.updateName}
            placeholder="Ex: Café offert"
            required
          />

          <TextArea
            id="description"
            label="Description"
            value={form.description}
            onChange={form.updateDescription}
            placeholder="Ex: Un café gratuit de votre choix"
          />

          <div className="grid grid-cols-2 gap-4">
            <PriceInput
              id="minPrice"
              label="Prix minimum (€)"
              value={form.minPrice}
              onChange={form.updateMinPrice}
              placeholder="Ex: 3.00"
            />
            <PriceInput
              id="maxPrice"
              label="Prix maximum (€)"
              value={form.maxPrice}
              onChange={form.updateMaxPrice}
              placeholder="Ex: 5.00"
            />
          </div>
          <p className="text-xs text-gray-600 -mt-3">
            Optionnel - Laissez vide pour ne pas afficher de prix. Si vous remplissez les 2 champs,
            le prix s&apos;affichera sous forme de fourchette{' '}
            {isEditing ? '' : '(ex: entre 3€ et 5€)'}
          </p>

          <IconSelector selectedIcon={form.iconUrl} onSelect={form.updateIconUrl} />

          <ColorPicker value={form.color} onChange={form.updateColor} />

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
                disabled={isSubmitting}
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
