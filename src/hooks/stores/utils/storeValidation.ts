/**
 * Store Validation
 * Fonctions de validation pour les formulaires de stores
 * IMPORTANT: ZERO any types
 */

import type { StoreFormData, StoreFormErrors } from '@/lib/types/store-form.types';

export function validateStoreForm(formData: StoreFormData): StoreFormErrors {
  const errors: StoreFormErrors = {};

  if (formData.brandName.length < 2) {
    errors.brandName = "Le nom de l'enseigne doit contenir au moins 2 caractères";
  }
  if (!formData.logoUrl.trim()) {
    errors.logoUrl = 'Le logo est obligatoire';
  } else if (!formData.logoUrl.match(/^https?:\/\/.+/)) {
    errors.logoUrl = 'URL du logo invalide';
  }
  if (formData.name.length < 2) {
    errors.name = 'Le nom du commerce doit contenir au moins 2 caractères';
  }
  if (!formData.googleBusinessUrl.trim()) {
    errors.googleBusinessUrl = "L'URL Google Business est obligatoire";
  } else if (
    !formData.googleBusinessUrl.includes('google.com') &&
    !formData.googleBusinessUrl.includes('maps.app.goo.gl') &&
    !formData.googleBusinessUrl.includes('g.page') &&
    !formData.googleBusinessUrl.includes('goo.gl/maps')
  ) {
    errors.googleBusinessUrl = 'URL Google Business invalide';
  }
  if (formData.googlePlaceId.trim() && !formData.googlePlaceId.startsWith('ChIJ')) {
    errors.googlePlaceId = 'Le Place ID doit commencer par "ChIJ"';
  }

  return errors;
}
