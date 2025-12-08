/**
 * DeleteBrandUseCase
 * Use case pour supprimer une enseigne
 */

import { Result } from '@/shared/types/result.type';
import type { BrandRepository } from '@/core/ports/brand.repository';
import { prisma } from '@/infrastructure/database/prisma-client';

export interface DeleteBrandInput {
  id: string;
}

export class DeleteBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(input: DeleteBrandInput, userId: string): Promise<Result<void, Error>> {
    // 1. Vérifier que le brand existe
    const brandResult = await this.brandRepository.findById(input.id);

    if (!brandResult.success) {
      return Result.fail(brandResult.error);
    }

    const existingBrand = brandResult.data;

    if (!existingBrand) {
      return Result.fail(new Error('Enseigne non trouvée'));
    }

    // 2. Vérifier que le brand appartient à l'utilisateur
    if (existingBrand.ownerId !== userId) {
      return Result.fail(new Error('Cette enseigne ne vous appartient pas'));
    }

    // 3. Supprimer manuellement les stores d'abord (Supabase RLS bloque le cascade)
    try {
      await prisma.store.deleteMany({
        where: { brandId: input.id },
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to delete stores'));
    }

    // 4. Supprimer le brand
    const deleteResult = await this.brandRepository.delete(input.id);

    if (!deleteResult.success) {
      return Result.fail(deleteResult.error);
    }

    return Result.ok(undefined);
  }
}
