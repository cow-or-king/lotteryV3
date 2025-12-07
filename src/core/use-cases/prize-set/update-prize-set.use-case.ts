import { Result } from '@/shared/types/result.type';
import type { PrizeSetRepository, PrizeSetEntity } from '@/core/ports/prize-set.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface UpdatePrizeSetInput {
  id: string;
  name?: string;
  description?: string;
}

export class UpdatePrizeSetUseCase {
  constructor(
    private readonly prizeSetRepository: PrizeSetRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(
    input: UpdatePrizeSetInput,
    userId: string,
  ): Promise<Result<PrizeSetEntity, Error>> {
    try {
      const prizeSet = await this.prizeSetRepository.findById(input.id);
      if (!prizeSet) return Result.fail(new Error('Lot non trouvé'));

      const brand = await this.brandRepository.findById(prizeSet.brandId);
      if (!brand) return Result.fail(new Error('Enseigne non trouvée'));
      if (brand.ownerId !== userId) return Result.fail(new Error('Ce lot ne vous appartient pas'));

      const updated = await this.prizeSetRepository.update(input.id, {
        name: input.name,
        description: input.description,
      });

      return Result.ok(updated);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
