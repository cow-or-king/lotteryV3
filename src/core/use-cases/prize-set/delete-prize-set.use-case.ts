import { Result } from '@/shared/types/result.type';
import type { PrizeSetRepository } from '@/core/ports/prize-set.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface DeletePrizeSetInput {
  id: string;
}

export class DeletePrizeSetUseCase {
  constructor(
    private readonly prizeSetRepository: PrizeSetRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(input: DeletePrizeSetInput, userId: string): Promise<Result<void, Error>> {
    try {
      const prizeSet = await this.prizeSetRepository.findById(input.id);
      if (!prizeSet) return Result.fail(new Error('Lot non trouvé'));

      const brandResult = await this.brandRepository.findById(prizeSet.brandId);
      if (!brandResult.success) return Result.fail(brandResult.error);

      const brand = brandResult.data;
      if (!brand) return Result.fail(new Error('Enseigne non trouvée'));
      if (brand.ownerId !== userId) return Result.fail(new Error('Ce lot ne vous appartient pas'));

      await this.prizeSetRepository.delete(input.id);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
