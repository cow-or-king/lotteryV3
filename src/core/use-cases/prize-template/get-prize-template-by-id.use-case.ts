/**
 * GetPrizeTemplateByIdUseCase
 * Use case pour récupérer un prize template par son ID
 */

import { Result } from '@/shared/types/result.type';
import type {
  PrizeTemplateRepository,
  PrizeTemplateEntity,
} from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface GetPrizeTemplateByIdInput {
  id: string;
}

export class GetPrizeTemplateByIdUseCase {
  constructor(
    private readonly prizeTemplateRepository: PrizeTemplateRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(
    input: GetPrizeTemplateByIdInput,
    userId: string,
  ): Promise<Result<PrizeTemplateEntity, Error>> {
    try {
      // Vérifier que le prize template existe
      const prizeTemplate = await this.prizeTemplateRepository.findById(input.id);

      if (!prizeTemplate) {
        return Result.fail(new Error('Gain non trouvé'));
      }

      // Vérifier ownership:
      // - Si brandId est null: gain commun, vérifier que l'ownerId correspond
      // - Si brandId existe: vérifier que le brand appartient à l'utilisateur
      if (prizeTemplate.brandId === null) {
        // Gain commun: vérifier directement l'ownerId
        if (prizeTemplate.ownerId !== userId) {
          return Result.fail(new Error('Ce gain ne vous appartient pas'));
        }
      } else {
        // Gain spécifique: vérifier via le brand
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
      }

      return Result.ok(prizeTemplate);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
