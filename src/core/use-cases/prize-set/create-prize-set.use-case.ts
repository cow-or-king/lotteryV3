/**
 * CreatePrizeSetUseCase
 * Use case pour créer un nouveau prize set
 */

import { Result } from '@/lib/types/result.type';
import type { PrizeSetRepository, PrizeSetEntity } from '@/core/ports/prize-set.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface CreatePrizeSetInput {
  name: string;
  brandId: string;
  description?: string;
}

export class CreatePrizeSetUseCase {
  constructor(
    private readonly prizeSetRepository: PrizeSetRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(
    input: CreatePrizeSetInput,
    userId: string,
  ): Promise<Result<PrizeSetEntity, Error>> {
    try {
      // Vérifier que le brand existe et appartient à l'utilisateur
      const brandResult = await this.brandRepository.findById(input.brandId);

      if (!brandResult.success) {
        return Result.fail(brandResult.error);
      }

      const brand = brandResult.data;

      if (!brand) {
        return Result.fail(new Error('Enseigne non trouvée'));
      }

      if (brand.ownerId !== userId) {
        return Result.fail(new Error('Cette enseigne ne vous appartient pas'));
      }

      // Créer le prize set
      const prizeSet = await this.prizeSetRepository.create({
        name: input.name,
        brandId: input.brandId,
        description: input.description || null,
      });

      return Result.ok(prizeSet);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
