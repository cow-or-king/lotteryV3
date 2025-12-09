/**
 * Types partagés pour les stores et brands
 * Centralise les interfaces pour éviter la duplication
 */

export interface BrandDTO {
  id: string;
  name: string;
  logoUrl: string;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StoreDTO {
  id: string;
  name: string;
  slug: string;
  googleBusinessUrl: string;
  googlePlaceId: string | null;
  googleApiKeyStatus: string | null;
  brandId: string;
  brandName: string;
  logoUrl: string;
  description: string | null;
  isActive: boolean;
  isPaid: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StoreLimitsDTO {
  plan: string;
  canCreateStore: boolean;
  canCreateBrand: boolean;
  maxBrands: number;
  maxStoresPerBrand: number;
  brandsCount: number;
  storesCount: number;
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
