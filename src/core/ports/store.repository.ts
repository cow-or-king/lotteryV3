/**
 * Store Repository Port
 * Interface pour abstraire l'accès aux stores
 * Architecture hexagonale: Port dans le core, Adapter dans l'infrastructure
 */

export interface StoreEntity {
  id: string;
  name: string;
  slug: string;
  googleBusinessUrl: string;
  googlePlaceId: string | null;
  googleApiKeyStatus: string | null;
  description: string | null;
  isActive: boolean;
  isPaid: boolean;
  brandId: string;
  logoUrl: string | null;
  logoStoragePath: string | null;
  defaultQrCodeId: string | null;
  qrCodeCustomized: boolean;
  qrCodeCustomizedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoreInput {
  name: string;
  slug: string;
  googleBusinessUrl: string;
  googlePlaceId?: string | null;
  description?: string | null;
  isActive?: boolean;
  isPaid: boolean;
  brandId: string;
}

export interface UpdateStoreInput {
  name?: string;
  googleBusinessUrl?: string;
  googlePlaceId?: string | null;
  googleApiKey?: string | null; // API key chiffrée (AES-256-GCM)
  description?: string | null;
  isActive?: boolean;
}

export interface StoreRepository {
  create(input: CreateStoreInput): Promise<StoreEntity>;
  findById(id: string): Promise<StoreEntity | null>;
  findBySlug(slug: string): Promise<StoreEntity | null>;
  findManyByBrandId(brandId: string): Promise<StoreEntity[]>;
  findManyByOwnerId(ownerId: string): Promise<StoreEntity[]>;
  update(id: string, input: UpdateStoreInput): Promise<StoreEntity>;
  delete(id: string): Promise<void>;
  countByBrandId(brandId: string): Promise<number>;
}
