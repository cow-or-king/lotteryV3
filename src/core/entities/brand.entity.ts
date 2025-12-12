/**
 * Brand Entity - Domain Model
 * Représente une enseigne dans le domaine métier
 * IMPORTANT: ZERO any types, logique métier pure
 */

export interface BrandEntity {
  id: string;
  name: string;
  logoUrl: string | null;
  logoStoragePath: string | null;
  ownerId: string;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Factory function pour créer une nouvelle Brand entity
 */
export const createBrandEntity = (params: {
  id: string;
  name: string;
  logoUrl: string | null;
  logoStoragePath: string | null;
  ownerId: string;
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}): BrandEntity => {
  const now = new Date();

  return {
    id: params.id,
    name: params.name,
    logoUrl: params.logoUrl,
    logoStoragePath: params.logoStoragePath,
    ownerId: params.ownerId,
    primaryColor: params.primaryColor ?? '#5B21B6',
    secondaryColor: params.secondaryColor ?? '#FACC15',
    font: params.font ?? 'inter',
    isPaid: params.isPaid,
    createdAt: params.createdAt ?? now,
    updatedAt: params.updatedAt ?? now,
  };
};
