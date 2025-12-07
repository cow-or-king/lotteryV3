/**
 * Brand Entity - Domain Model
 * Représente une enseigne dans le domaine métier
 * IMPORTANT: ZERO any types, logique métier pure
 */

export interface BrandEntity {
  id: string;
  name: string;
  logoUrl: string;
  ownerId: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  font: string | null;
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
  logoUrl: string;
  ownerId: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  font?: string | null;
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}): BrandEntity => {
  const now = new Date();

  return {
    id: params.id,
    name: params.name,
    logoUrl: params.logoUrl,
    ownerId: params.ownerId,
    primaryColor: params.primaryColor ?? null,
    secondaryColor: params.secondaryColor ?? null,
    font: params.font ?? null,
    isPaid: params.isPaid,
    createdAt: params.createdAt ?? now,
    updatedAt: params.updatedAt ?? now,
  };
};
