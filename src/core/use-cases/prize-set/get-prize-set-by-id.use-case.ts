import { Result } from '@/shared/types/result.type';
import type { PrizeSetRepository, PrizeSetWithItems } from '@/core/ports/prize-set.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface GetPrizeSetByIdInput {
  id: string;
}

export class GetPrizeSetByIdUseCase {
  constructor(
    private readonly prizeSetRepository: PrizeSetRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(
    input: GetPrizeSetByIdInput,
    userId: string,
  ): Promise<Result<PrizeSetWithItems, Error>> {
    try {
      const prizeSet = await this.prizeSetRepository.findById(input.id);
      if (!prizeSet) return Result.fail(new Error('Lot non trouvé'));

      const brand = await this.brandRepository.findById(prizeSet.brandId);
      if (!brand) return Result.fail(new Error('Enseigne non trouvée'));
      if (brand.ownerId !== userId) return Result.fail(new Error('Ce lot ne vous appartient pas'));

      return Result.ok(prizeSet);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
