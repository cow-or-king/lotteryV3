/**
 * ListStoresUseCase
 * Use case pour lister les commerces d'un utilisateur
 */

import { Result } from '@/lib/types/result.type';
import type { StoreRepository, StoreEntity } from '@/core/ports/store.repository';

export class ListStoresUseCase {
  constructor(private readonly storeRepository: StoreRepository) {}

  async execute(userId: string): Promise<Result<StoreEntity[], Error>> {
    try {
      const stores = await this.storeRepository.findManyByOwnerId(userId);
      return Result.ok(stores);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erreur inconnue'));
    }
  }
}
