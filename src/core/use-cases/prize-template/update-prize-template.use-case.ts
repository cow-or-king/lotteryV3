/**
 * UpdatePrizeTemplateUseCase
 * Use case pour mettre à jour un prize template
 */

import { Result } from '@/shared/types/result.type';
import type {
  PrizeTemplateRepository,
  PrizeTemplateEntity,
} from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface UpdatePrizeTemplateInput {
  id: string;
  name?: string;
  description?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  iconUrl?: string;
}

export class UpdatePrizeTemplateUseCase {
  constructor(
    private readonly prizeTemplateRepository: PrizeTemplateRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(
    input: UpdatePrizeTemplateInput,
    userId: string,
  ): Promise<Result<PrizeTemplateEntity, Error>> {
    try {
      // Vérifier que le prize template existe
      const prizeTemplate = await this.prizeTemplateRepository.findById(input.id);

      if (!prizeTemplate) {
        return Result.fail(new Error('Gain non trouvé'));
      }

      // Vérifier que le brand appartient à l'utilisateur
      const brand = await this.brandRepository.findById(prizeTemplate.brandId);

      if (!brand) {
        return Result.fail(new Error('Enseigne non trouvée'));
      }

      if (brand.ownerId !== userId) {
        return Result.fail(new Error('Ce gain ne vous appartient pas'));
      }

      // Mettre à jour le prize template
      const updatedPrizeTemplate = await this.prizeTemplateRepository.update(input.id, {
        name: input.name,
        description: input.description,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        color: input.color,
        iconUrl: input.iconUrl,
      });

      return Result.ok(updatedPrizeTemplate);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
