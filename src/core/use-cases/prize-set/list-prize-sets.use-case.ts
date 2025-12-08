import { Result } from '@/lib/types/result.type';
import type { PrizeSetRepository, PrizeSetWithItems } from '@/core/ports/prize-set.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export class ListPrizeSetsUseCase {
  constructor(
    private readonly prizeSetRepository: PrizeSetRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(userId: string): Promise<Result<PrizeSetWithItems[], Error>> {
    try {
      const brandsResult = await this.brandRepository.findByOwnerId(userId);

      if (!brandsResult.success) {
        return Result.fail(brandsResult.error);
      }

      const brands = brandsResult.data;
      const allPrizeSets = await Promise.all(
        brands.map((brand) => this.prizeSetRepository.findManyByBrandId(brand.id)),
      );
      const prizeSets = allPrizeSets.flat();
      return Result.ok(prizeSets);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
