/**
 * UpdateStoreUseCase
 * Use case pour mettre à jour un commerce
 * Logique métier pure sans dépendances externes
 * Architecture hexagonale: Core business logic
 */

import { Result } from '@/shared/types/result.type';
import type { StoreRepository, StoreEntity } from '@/core/ports/store.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';
import type { ApiKeyEncryptionService } from '@/infrastructure/encryption/api-key-encryption.service';

export interface UpdateStoreInput {
  id: string;
  name?: string;
  googleBusinessUrl?: string;
  googlePlaceId?: string | null;
  googleApiKey?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export class UpdateStoreUseCase {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly brandRepository: BrandRepository,
    private readonly encryptionService: ApiKeyEncryptionService,
  ) {}

  async execute(input: UpdateStoreInput, userId: string): Promise<Result<StoreEntity, Error>> {
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

    // 3. Préparer les données de mise à jour (seulement les champs fournis)
    const updateData: Partial<UpdateStoreInput> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.googleBusinessUrl !== undefined)
      updateData.googleBusinessUrl = input.googleBusinessUrl;
    if (input.googlePlaceId !== undefined) updateData.googlePlaceId = input.googlePlaceId;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    // 4. Chiffrer la clé API Google si fournie (AES-256-GCM)
    if (input.googleApiKey !== undefined) {
      if (input.googleApiKey === null || input.googleApiKey.trim() === '') {
        // Supprimer la clé API (mise à null)
        updateData.googleApiKey = null;
      } else {
        // Chiffrer la clé API
        const encryptionResult = this.encryptionService.encrypt(input.googleApiKey);
        if (!encryptionResult.success) {
          return Result.fail(new Error('Erreur lors du chiffrement de la clé API'));
        }
        updateData.googleApiKey = encryptionResult.data;
      }
    }

    // 5. Mettre à jour le store
    const updatedStore = await this.storeRepository.update(input.id, updateData);

    return Result.ok(updatedStore);
  }
}
