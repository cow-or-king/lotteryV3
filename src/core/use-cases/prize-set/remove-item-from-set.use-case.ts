import { Result } from '@/lib/types/result.type';
import type { PrizeSetRepository } from '@/core/ports/prize-set.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface RemoveItemFromSetInput {
  prizeSetId: string;
  prizeTemplateId: string;
}

export class RemoveItemFromSetUseCase {
  constructor(
    private readonly prizeSetRepository: PrizeSetRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(input: RemoveItemFromSetInput, userId: string): Promise<Result<void, Error>> {
    try {
      const prizeSet = await this.prizeSetRepository.findById(input.prizeSetId);
      if (!prizeSet) return Result.fail(new Error('Lot non trouvé'));

      const brandResult = await this.brandRepository.findById(prizeSet.brandId);
      if (!brandResult.success) return Result.fail(brandResult.error);

      const brand = brandResult.data;
      if (!brand || brand.ownerId !== userId)
        return Result.fail(new Error('Ce lot ne vous appartient pas'));

      await this.prizeSetRepository.removeItem(input.prizeSetId, input.prizeTemplateId);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
