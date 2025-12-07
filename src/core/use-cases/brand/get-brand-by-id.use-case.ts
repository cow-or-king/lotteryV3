/**
 * GetBrandById Use Case
 * Cas d'usage: Récupérer une enseigne par son ID
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { BrandRepository } from '@/core/ports/brand.repository';
import type { BrandEntity } from '@/core/entities/brand.entity';

export interface GetBrandByIdInput {
  id: string;
  ownerId: string; // Pour vérifier les droits d'accès
}

export interface GetBrandByIdOutput {
  brand: BrandEntity;
}

export class GetBrandByIdUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(input: GetBrandByIdInput): Promise<Result<GetBrandByIdOutput>> {
    // Validation de l'ID
    if (!input.id || input.id.trim().length === 0) {
      return fail(new Error('Brand ID is required'));
    }

    // Validation de l'owner ID
    if (!input.ownerId || input.ownerId.trim().length === 0) {
      return fail(new Error('Owner ID is required'));
    }

    // Récupérer l'enseigne
    const brandResult = await this.brandRepository.findById(input.id);

    if (!brandResult.success) {
      return fail(brandResult.error);
    }

    const brand = brandResult.data;

    if (!brand) {
      return fail(new Error('Brand not found'));
    }

    // Vérifier que l'utilisateur a le droit d'accéder à cette enseigne
    if (brand.ownerId !== input.ownerId) {
      return fail(new Error('You do not have permission to access this brand'));
    }

    return ok({
      brand,
    });
  }
}
