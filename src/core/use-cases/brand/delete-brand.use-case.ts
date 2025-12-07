/**
 * DeleteBrandUseCase
 * Use case pour supprimer une enseigne
 */

import { Result } from '@/shared/types/result.type';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface DeleteBrandInput {
  id: string;
}

export class DeleteBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(input: DeleteBrandInput, userId: string): Promise<Result<void, Error>> {
    try {
      // 1. Vérifier que le brand existe
      const existingBrand = await this.brandRepository.findById(input.id);

      if (!existingBrand) {
        return Result.fail(new Error('Enseigne non trouvée'));
      }

      // 2. Vérifier que le brand appartient à l'utilisateur
      if (existingBrand.ownerId !== userId) {
        return Result.fail(new Error('Cette enseigne ne vous appartient pas'));
      }

      // 3. Supprimer le brand (cascade supprime les stores automatiquement)
      await this.brandRepository.delete(input.id);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
