/**
 * DeletePrizeTemplateUseCase
 * Use case pour supprimer un prize template
 */

import { Result } from '@/lib/types/result.type';
import type { PrizeTemplateRepository } from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface DeletePrizeTemplateInput {
  id: string;
}

export class DeletePrizeTemplateUseCase {
  constructor(
    private readonly prizeTemplateRepository: PrizeTemplateRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(input: DeletePrizeTemplateInput, userId: string): Promise<Result<void, Error>> {
    try {
      // Vérifier que le prize template existe
      const prizeTemplate = await this.prizeTemplateRepository.findById(input.id);

      if (!prizeTemplate) {
        return Result.fail(new Error('Gain non trouvé'));
      }

      // Vérifier que le brand appartient à l'utilisateur
      const brandResult = await this.brandRepository.findById(prizeTemplate.brandId);

      if (!brandResult.success) {
        return Result.fail(brandResult.error);
      }

      const brand = brandResult.data;

      if (!brand) {
        return Result.fail(new Error('Enseigne non trouvée'));
      }

      if (brand.ownerId !== userId) {
        return Result.fail(new Error('Ce gain ne vous appartient pas'));
      }

      // Supprimer le prize template
      await this.prizeTemplateRepository.delete(input.id);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
