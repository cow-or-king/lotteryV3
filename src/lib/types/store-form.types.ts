/**
 * Store Form Types
 * Types pour les formulaires de stores
 * IMPORTANT: ZERO any types
 */

export interface EditingStore {
  id: string;
  name: string;
  googleBusinessUrl: string;
}

export interface StoreFormData {
  brandName: string;
  logoUrl: string;
  name: string;
  googleBusinessUrl: string;
  googlePlaceId: string;
  googleApiKey: string;
}

export interface StoreFormErrors {
  brandName?: string;
  logoUrl?: string;
  name?: string;
  googleBusinessUrl?: string;
  googlePlaceId?: string;
  googleApiKey?: string;
}
