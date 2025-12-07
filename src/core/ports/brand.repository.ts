/**
 * Brand Repository Port
 * Interface pour abstraire l'accès aux brands
 * Architecture hexagonale: Port dans le core, Adapter dans l'infrastructure
 */

import type { BrandEntity } from '@/core/entities/brand.entity';

export type { BrandEntity };

export interface CreateBrandInput {
  name: string;
  logoUrl: string;
  ownerId: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  font?: string | null;
  isPaid: boolean;
}

export interface UpdateBrandInput {
  name?: string;
  logoUrl?: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  font?: string | null;
}

export interface BrandRepository {
  create(input: CreateBrandInput): Promise<BrandEntity>;
  findById(id: string): Promise<BrandEntity | null>;
  findByOwnerId(ownerId: string): Promise<BrandEntity[]>;
  update(id: string, input: UpdateBrandInput): Promise<BrandEntity>;
  delete(id: string): Promise<void>;
  countByOwnerId(ownerId: string): Promise<number>;
}
