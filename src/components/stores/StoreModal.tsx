/**
 * Store Modal Component
 * Modal de création d'un nouveau commerce
 * REFACTORÉ : 423 lignes → 150 lignes (extraction de 7 sous-composants)
 */

'use client';

import { X } from 'lucide-react';
import {
  BrandFormFields,
  BrandSelector,
  GoogleApiAccordion,
  GoogleBusinessUrlField,
  NewBrandWarning,
  PlanInfoCard,
  PlanLimitsWarning,
} from './modal';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNewBrand: boolean;
  setIsNewBrand: (value: boolean) => void;
  selectedBrand: {
    brandName: string;
    logoUrl: string;
  } | null;
  formData: {
    brandName: string;
    logoUrl: string;
    logoFile?: File | null;
    logoPreviewUrl?: string | null;
    name: string;
    googleBusinessUrl: string;
    googlePlaceId: string;
    googleApiKey: string;
  };
  setFormData: (data: StoreModalProps['formData']) => void;
  errors: {
    brandName?: string;
    logoUrl?: string;
    name?: string;
    googleBusinessUrl?: string;
    googlePlaceId?: string;
    googleApiKey?: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  limits: {
    plan: string;
    canCreateStore: boolean;
    canCreateBrand: boolean;
    maxBrands: number;
    maxStoresPerBrand: number;
    brandsCount: number;
    storesCount: number;
  } | null;
  onShowGoogleUrlHelp: () => void;
  onShowPlaceIdHelp: () => void;
  onShowGoogleApiHelp: () => void;
}

export function StoreModal({
  isOpen,
  onClose,
  isNewBrand,
  setIsNewBrand,
  selectedBrand,
  formData,
  setFormData,
  errors,
  onSubmit,
  isSubmitting,
  limits,
  onShowGoogleUrlHelp,
  onShowPlaceIdHelp,
  onShowGoogleApiHelp,
}: StoreModalProps) {
  if (!isOpen) {
    return null;
  }

  // Helper pour mettre à jour un champ du formulaire
  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Helper pour mettre à jour le logo file
  const updateLogoFile = (file: File | null, previewUrl: string | null) => {
    setFormData({ ...formData, logoFile: file, logoPreviewUrl: previewUrl });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 rounded-3xl">
      <div className="bg-white backdrop-blur-xl border border-purple-600/20 rounded-3xl p-4 sm:p-6 md:p-8 max-w-full sm:max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isNewBrand ? 'Nouvelle enseigne' : 'Nouveau commerce'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Limites du plan FREE (mode dev: affichage informatif sans blocage) */}
        {limits && limits.plan === 'FREE' && !limits.canCreateStore && (
          <PlanLimitsWarning
            maxBrands={limits.maxBrands}
            maxStoresPerBrand={limits.maxStoresPerBrand}
          />
        )}

        {/* Info sur les enseignes */}
        {limits && limits.plan === 'FREE' && limits.canCreateStore && limits.brandsCount > 0 && (
          <PlanInfoCard
            storesCount={limits.storesCount}
            maxStoresPerBrand={limits.maxStoresPerBrand}
            brandsCount={limits.brandsCount}
            maxBrands={limits.maxBrands}
            canCreateBrand={limits.canCreateBrand}
          />
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Bouton Nouvelle enseigne - affiché seulement si une enseigne existe */}
          {selectedBrand && !isNewBrand && (
            <BrandSelector
              brandName={selectedBrand.brandName}
              logoUrl={selectedBrand.logoUrl}
              onCreateNew={() => setIsNewBrand(true)}
            />
          )}

          {/* Message nouvelle enseigne payante */}
          {isNewBrand && <NewBrandWarning onUseExisting={() => setIsNewBrand(false)} />}

          {/* Nom de l'enseigne - affiché seulement si nouvelle enseigne OU première création */}
          {(isNewBrand || !selectedBrand) && (
            <BrandFormFields
              brandName={formData.brandName}
              logoUrl={formData.logoUrl}
              logoFile={formData.logoFile ?? null}
              logoPreviewUrl={formData.logoPreviewUrl ?? null}
              errors={errors}
              onChange={(field, value) => updateField(field, value)}
              onLogoChange={updateLogoFile}
            />
          )}

          {/* Nom du commerce */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom du commerce *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-purple-600/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              placeholder="Ex: McDonald's Champs-Élysées"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Google Business URL */}
          <GoogleBusinessUrlField
            value={formData.googleBusinessUrl}
            error={errors.googleBusinessUrl}
            onChange={(value) => updateField('googleBusinessUrl', value)}
            onShowHelp={onShowGoogleUrlHelp}
          />

          {/* Google API Configuration - Accordion */}
          <GoogleApiAccordion
            googlePlaceId={formData.googlePlaceId}
            googleApiKey={formData.googleApiKey}
            errors={errors}
            onChange={(field, value) => updateField(field, value)}
            onShowPlaceIdHelp={onShowPlaceIdHelp}
            onShowApiKeyHelp={onShowGoogleApiHelp}
          />

          {/* Buttons */}
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
                {isSubmitting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
