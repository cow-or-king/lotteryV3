/**
 * ListBrands Use Case
 * Cas d'usage: Lister les enseignes d'un propriétaire
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { BrandRepository } from '@/core/ports/brand.repository';
import type { BrandEntity } from '@/core/entities/brand.entity';

export interface ListBrandsInput {
  ownerId: string;
}

export interface ListBrandsOutput {
  brands: BrandEntity[];
  total: number;
}

export class ListBrandsUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(input: ListBrandsInput): Promise<Result<ListBrandsOutput>> {
    // Validation de l'owner ID
    if (!input.ownerId || input.ownerId.trim().length === 0) {
      return fail(new Error('Owner ID is required'));
    }

    // Récupérer les enseignes
    const brandsResult = await this.brandRepository.findByOwnerId(input.ownerId);

    if (!brandsResult.success) {
      return fail(brandsResult.error);
    }

    return ok({
      brands: brandsResult.data,
      total: brandsResult.data.length,
    });
  }
}
