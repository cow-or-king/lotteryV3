/**
 * GetStoreByIdUseCase
 * Use case pour récupérer un commerce par son ID
 */

import { Result } from '@/shared/types/result.type';
import type { StoreRepository, StoreEntity } from '@/core/ports/store.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface GetStoreByIdInput {
  id: string;
}

export class GetStoreByIdUseCase {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(input: GetStoreByIdInput, userId: string): Promise<Result<StoreEntity, Error>> {
    try {
      // 1. Trouver le store
      const store = await this.storeRepository.findById(input.id);

      if (!store) {
        return Result.fail(new Error('Commerce non trouvé'));
      }

      // 2. Vérifier que le store appartient à l'utilisateur (via Brand)
      const brand = await this.brandRepository.findById(store.brandId);

      if (!brand) {
        return Result.fail(new Error('Enseigne non trouvée'));
      }

      if (brand.ownerId !== userId) {
        return Result.fail(new Error('Commerce non trouvé')); // Ne pas révéler qu'il existe
      }

      return Result.ok(store);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
