/**
 * UpdateBrandUseCase
 * Use case pour mettre à jour une enseigne
 */

import { Result } from '@/lib/types/result.type';
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

    // 3. Mettre à jour le brand
    const { id, ...updateData } = input;
    const updateResult = await this.brandRepository.update(id, updateData);

    if (!updateResult.success) {
      return Result.fail(updateResult.error);
    }

    return Result.ok(updateResult.data);
  }
}
