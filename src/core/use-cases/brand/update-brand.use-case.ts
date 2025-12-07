/**
 * UpdateBrandUseCase
 * Use case pour mettre à jour une enseigne
 */

import { Result } from '@/shared/types/result.type';
import type { BrandRepository, BrandEntity } from '@/core/ports/brand.repository';

export interface UpdateBrandInput {
  id: string;
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
}

export class UpdateBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(input: UpdateBrandInput, userId: string): Promise<Result<BrandEntity, Error>> {
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

      // 3. Mettre à jour le brand
      const { id, ...updateData } = input;
      const updatedBrand = await this.brandRepository.update(id, updateData);

      return Result.ok(updatedBrand);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
