/**
 * CreatePrizeTemplateUseCase
 * Use case pour créer un nouveau prize template
 * Logique métier pure sans dépendances externes
 * Architecture hexagonale: Core business logic
 */

import { Result } from '@/shared/types/result.type';
import type {
  PrizeTemplateRepository,
  PrizeTemplateEntity,
} from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface CreatePrizeTemplateInput {
  name: string;
  brandId: string | null; // null = gain commun à toutes les enseignes
  description?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  iconUrl?: string;
}

export class CreatePrizeTemplateUseCase {
  constructor(
    private readonly prizeTemplateRepository: PrizeTemplateRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(
    input: CreatePrizeTemplateInput,
    userId: string,
  ): Promise<Result<PrizeTemplateEntity, Error>> {
    // Si brandId est fourni, vérifier que le brand existe et appartient à l'utilisateur
    if (input.brandId) {
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
    }

    // Créer le prize template
    try {
      const prizeTemplate = await this.prizeTemplateRepository.create({
        name: input.name,
        brandId: input.brandId,
        ownerId: userId,
        description: input.description || null,
        minPrice: input.minPrice || null,
        maxPrice: input.maxPrice || null,
        color: input.color || '#8B5CF6',
        iconUrl: input.iconUrl || null,
      });

      return Result.ok(prizeTemplate);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
