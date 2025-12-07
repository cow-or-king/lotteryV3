import { Result } from '@/shared/types/result.type';
import type { PrizeSetRepository, PrizeSetItemEntity } from '@/core/ports/prize-set.repository';
import type { PrizeTemplateRepository } from '@/core/ports/prize-template.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface AddItemToSetInput {
  prizeSetId: string;
  prizeTemplateId: string;
  probability: number;
  quantity: number;
}

export class AddItemToSetUseCase {
  constructor(
    private readonly prizeSetRepository: PrizeSetRepository,
    private readonly prizeTemplateRepository: PrizeTemplateRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(
    input: AddItemToSetInput,
    userId: string,
  ): Promise<Result<PrizeSetItemEntity, Error>> {
    try {
      const prizeSet = await this.prizeSetRepository.findById(input.prizeSetId);
      if (!prizeSet) return Result.fail(new Error('Lot non trouvé'));

      const brand = await this.brandRepository.findById(prizeSet.brandId);
      if (!brand || brand.ownerId !== userId)
        return Result.fail(new Error('Ce lot ne vous appartient pas'));

      const prizeTemplate = await this.prizeTemplateRepository.findById(input.prizeTemplateId);
      if (!prizeTemplate) return Result.fail(new Error('Gain non trouvé'));
      if (prizeTemplate.brandId !== prizeSet.brandId)
        return Result.fail(new Error('Le gain doit appartenir à la même enseigne'));

      const item = await this.prizeSetRepository.addItem({
        prizeSetId: input.prizeSetId,
        prizeTemplateId: input.prizeTemplateId,
        probability: input.probability,
        quantity: input.quantity,
      });

      return Result.ok(item);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
