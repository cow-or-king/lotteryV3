/**
 * ListPrizeTemplatesUseCase
 * Use case pour lister les prize templates d'un utilisateur
 */

import { Result } from '@/shared/types/result.type';
import type {
  PrizeTemplateRepository,
  PrizeTemplateEntity,
} from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export class ListPrizeTemplatesUseCase {
  constructor(
    private readonly prizeTemplateRepository: PrizeTemplateRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(userId: string): Promise<Result<PrizeTemplateEntity[], Error>> {
    try {
      // Récupérer tous les prize templates de l'utilisateur (spécifiques + communs)
      const prizeTemplates = await this.prizeTemplateRepository.findManyByOwnerId(userId);

      return Result.ok(prizeTemplates);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
