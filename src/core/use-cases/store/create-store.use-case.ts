/**
 * CreateStoreUseCase
 * Use case pour créer un nouveau commerce
 * Logique métier pure sans dépendances externes
 * Architecture hexagonale: Core business logic
 */

import { Result } from '@/shared/types/result.type';
import type { StoreRepository, StoreEntity } from '@/core/ports/store.repository';
import type { BrandRepository } from '@/core/ports/brand.repository';

export interface CreateStoreInput {
  // Option 1: Brand existant
  brandId?: string;
  // Option 2: Créer nouveau brand
  brandName?: string;
  logoUrl?: string;
  // Infos du commerce
  name: string;
  googleBusinessUrl: string;
  description?: string;
}

export class CreateStoreUseCase {
  constructor(
    private readonly storeRepository: StoreRepository,
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(input: CreateStoreInput, userId: string): Promise<Result<StoreEntity, Error>> {
    let brandId: string;

    // Cas 1: Brand existant fourni
    if (input.brandId) {
      const brandResult = await this.brandRepository.findById(input.brandId);

      if (!brandResult.success) {
        return Result.fail(brandResult.error);
      }

      const brand = brandResult.data;

      if (!brand) {
        return Result.fail(new Error('Enseigne non trouvée'));
      }

      if (brand.ownerId !== userId) {
        return Result.fail(new Error('Cette enseigne ne vous appartient pas'));
      }

      brandId = brand.id;
    }
    // Cas 2: Créer un nouveau brand
    else if (input.brandName && input.logoUrl) {
      const countResult = await this.brandRepository.countByOwnerId(userId);

      if (!countResult.success) {
        return Result.fail(countResult.error);
      }

      const brandsCount = countResult.data;

      const newBrandResult = await this.brandRepository.create({
        name: input.brandName,
        logoUrl: input.logoUrl,
        ownerId: userId,
        isPaid: brandsCount > 0, // Le 2ème brand et suivants sont payants
      });

      if (!newBrandResult.success) {
        return Result.fail(newBrandResult.error);
      }

      brandId = newBrandResult.data.id;
    }
    // Erreur: ni brandId ni brandName+logoUrl
    else {
      return Result.fail(
        new Error(
          'Vous devez soit sélectionner une enseigne existante (brandId), soit créer une nouvelle enseigne (brandName + logoUrl)',
        ),
      );
    }

    // Récupérer le brand pour générer le slug
    const brandResult = await this.brandRepository.findById(brandId);

    if (!brandResult.success) {
      return Result.fail(brandResult.error);
    }

    const brand = brandResult.data;

    if (!brand) {
      return Result.fail(new Error("Erreur lors de la récupération de l'enseigne"));
    }

    // Générer un slug unique depuis brandName + name
    const combinedName = `${brand.name} ${input.name}`;
    const baseSlug = combinedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Vérifier si le slug existe déjà
    while (await this.storeRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Compter les stores existants pour ce brand
    const storesCount = await this.storeRepository.countByBrandId(brandId);

    // Créer le store
    const store = await this.storeRepository.create({
      name: input.name,
      slug,
      googleBusinessUrl: input.googleBusinessUrl,
      description: input.description,
      brandId,
      isPaid: storesCount > 0, // Le 2ème commerce et suivants sont payants
    });

    return Result.ok(store);
  }
}
