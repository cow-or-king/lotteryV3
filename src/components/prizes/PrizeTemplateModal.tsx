'use client';

import {
  Coffee,
  CircleDollarSign,
  Utensils,
  ShoppingBag,
  Percent,
  Gift,
  Star,
  Heart,
  Sparkles,
  TrendingUp,
  Award,
  X,
} from 'lucide-react';

const availableIcons = [
  { name: 'Coffee', icon: Coffee, label: 'Café' },
  { name: 'Utensils', icon: Utensils, label: 'Restaurant' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Shopping' },
  { name: 'Percent', icon: Percent, label: 'Réduction' },
  { name: 'Gift', icon: Gift, label: 'Cadeau' },
  { name: 'Star', icon: Star, label: 'Étoile' },
  { name: 'Heart', icon: Heart, label: 'Cœur' },
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Tendance' },
  { name: 'Award', icon: Award, label: 'Récompense' },
  { name: 'CircleDollarSign', icon: CircleDollarSign, label: 'Prix' },
];

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
  if (!isOpen) {
    return null;
  }

  const currentColor = isEditing ? editingData?.color : formData?.color;
  const currentIconUrl = isEditing ? editingData?.iconUrl : formData?.iconUrl;

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
            <div>
              <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 mb-2">
                Enseigne *
              </label>
              <select
                id="brandId"
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="COMMON">🔄 Commun à toutes les enseignes</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom du gain *
            </label>
            <input
              type="text"
              id="name"
              value={isEditing ? editingData?.name : formData?.name}
              onChange={(e) => {
                if (isEditing && editingData && setEditingData) {
                  setEditingData({ ...editingData, name: e.target.value });
                } else if (formData && setFormData) {
                  setFormData({ ...formData, name: e.target.value });
                }
              }}
              className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              placeholder="Ex: Café offert"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={isEditing ? editingData?.description : formData?.description}
              onChange={(e) => {
                if (isEditing && editingData && setEditingData) {
                  setEditingData({ ...editingData, description: e.target.value });
                } else if (formData && setFormData) {
                  setFormData({ ...formData, description: e.target.value });
                }
              }}
              className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              placeholder="Ex: Un café gratuit de votre choix"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Prix minimum (€)
              </label>
              <input
                type="number"
                id="minPrice"
                step="0.01"
                value={
                  isEditing
                    ? editingData?.minPrice !== null
                      ? editingData?.minPrice
                      : ''
                    : formData?.minPrice
                }
                onChange={(e) => {
                  if (isEditing && editingData && setEditingData) {
                    setEditingData({
                      ...editingData,
                      minPrice: e.target.value ? parseFloat(e.target.value) : null,
                    });
                  } else if (formData && setFormData) {
                    setFormData({ ...formData, minPrice: e.target.value });
                  }
                }}
                className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                placeholder="Ex: 3.00"
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Prix maximum (€)
              </label>
              <input
                type="number"
                id="maxPrice"
                step="0.01"
                value={
                  isEditing
                    ? editingData?.maxPrice !== null
                      ? editingData?.maxPrice
                      : ''
                    : formData?.maxPrice
                }
                onChange={(e) => {
                  if (isEditing && editingData && setEditingData) {
                    setEditingData({
                      ...editingData,
                      maxPrice: e.target.value ? parseFloat(e.target.value) : null,
                    });
                  } else if (formData && setFormData) {
                    setFormData({ ...formData, maxPrice: e.target.value });
                  }
                }}
                className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                placeholder="Ex: 5.00"
              />
            </div>
          </div>
          <p className="text-xs text-gray-600 -mt-3">
            Optionnel - Laissez vide pour ne pas afficher de prix. Si vous remplissez les 2 champs,
            le prix s&apos;affichera sous forme de fourchette{' '}
            {isEditing ? '' : '(ex: entre 3€ et 5€)'}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
            <div className="grid grid-cols-6 gap-2">
              {availableIcons.map((iconConfig) => {
                const IconComponent = iconConfig.icon;
                return (
                  <button
                    key={iconConfig.name}
                    type="button"
                    onClick={() => {
                      if (isEditing && editingData && setEditingData) {
                        setEditingData({ ...editingData, iconUrl: iconConfig.name });
                      } else if (formData && setFormData) {
                        setFormData({ ...formData, iconUrl: iconConfig.name });
                      }
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      currentIconUrl === iconConfig.name
                        ? 'border-purple-600 bg-purple-100'
                        : 'border-purple-600/20 bg-white/50 hover:border-purple-600/40'
                    }`}
                    title={iconConfig.label}
                  >
                    <IconComponent className="w-5 h-5 text-purple-600 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <input
              type="color"
              id="color"
              value={currentColor}
              onChange={(e) => {
                if (isEditing && editingData && setEditingData) {
                  setEditingData({ ...editingData, color: e.target.value });
                } else if (formData && setFormData) {
                  setFormData({ ...formData, color: e.target.value });
                }
              }}
              className="w-full h-12 px-4 py-2 bg-white/50 border border-purple-600/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
            />
          </div>

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
