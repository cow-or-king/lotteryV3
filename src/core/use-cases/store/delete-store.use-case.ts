/**
 * DeleteStoreUseCase
 * Use case pour supprimer un commerce
 * Logique métier pure sans dépendances externes
 */

import { Result } from '@/lib/types/result.type';
import type { StoreRepository } from '@/core/ports/store.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';
import type { StoreHistoryRepository } from '@/core/ports/store-history.repository';

export interface DeleteStoreInput {
  id: string;
  userEmail: string;
  isFreePlan: boolean;
}

export class DeleteStoreUseCase {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly brandRepository: BrandRepository,
    private readonly storeHistoryRepository: StoreHistoryRepository,
  ) {}

  async execute(input: DeleteStoreInput, userId: string): Promise<Result<void, Error>> {
    // 1. Vérifier que le store existe
    const store = await this.storeRepository.findById(input.id);

    if (!store) {
      return Result.fail(new Error('Commerce non trouvé'));
    }

    // 2. Vérifier que le store appartient à l'utilisateur (via Brand)
    const brandResult = await this.brandRepository.findById(store.brandId);

    if (!brandResult.success) {
      return Result.fail(brandResult.error);
    }

    const brand = brandResult.data;

    if (!brand) {
      return Result.fail(new Error('Enseigne non trouvée'));
    }

    if (brand.ownerId !== userId) {
      return Result.fail(new Error('Ce commerce ne vous appartient pas'));
    }

    // 3. ANTI-FRAUDE: Archiver dans l'historique avant suppression
    await this.storeHistoryRepository.create({
      googleBusinessUrl: store.googleBusinessUrl,
      storeName: store.name,
      userId,
      userEmail: input.userEmail,
      wasOnFreePlan: input.isFreePlan,
    });

    // 4. Supprimer le store
    await this.storeRepository.delete(input.id);

    return Result.ok(undefined);
  }
}
