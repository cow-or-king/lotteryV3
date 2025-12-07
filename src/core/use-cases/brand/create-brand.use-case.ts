/**
 * CreateBrand Use Case
 * Cas d'usage: Créer une nouvelle enseigne
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/shared/types/result.type';
import { ok, fail } from '@/shared/types/result.type';
import type { BrandRepository } from '@/core/ports/brand.repository';
import type { BrandEntity } from '@/core/entities/brand.entity';

export interface CreateBrandInput {
  name: string;
  logoUrl: string;
  ownerId: string;
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
  isPaid?: boolean;
}

export interface CreateBrandOutput {
  brand: BrandEntity;
}

export class CreateBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(input: CreateBrandInput): Promise<Result<CreateBrandOutput>> {
    // Validation du nom
    if (!input.name || input.name.trim().length === 0) {
      return fail('Brand name is required');
    }

    if (input.name.trim().length < 2) {
      return fail('Brand name must be at least 2 characters long');
    }

    if (input.name.trim().length > 100) {
      return fail('Brand name must be at most 100 characters long');
    }

    // Validation de l'URL du logo
    if (!input.logoUrl || input.logoUrl.trim().length === 0) {
      return fail('Logo URL is required');
    }

    // Validation de l'owner ID
    if (!input.ownerId || input.ownerId.trim().length === 0) {
      return fail('Owner ID is required');
    }

    // Validation des couleurs si fournies
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (input.primaryColor && !hexColorRegex.test(input.primaryColor)) {
      return fail('Primary color must be a valid hex color (e.g., #5B21B6)');
    }

    if (input.secondaryColor && !hexColorRegex.test(input.secondaryColor)) {
      return fail('Secondary color must be a valid hex color (e.g., #FACC15)');
    }

    // Créer l'entité
    const brand: BrandEntity = {
      id: '', // Will be set by repository
      name: input.name.trim(),
      logoUrl: input.logoUrl.trim(),
      ownerId: input.ownerId,
      primaryColor: input.primaryColor || '#5B21B6',
      secondaryColor: input.secondaryColor || '#FACC15',
      font: input.font || 'inter',
      isPaid: input.isPaid || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Sauvegarder
    const saveResult = await this.brandRepository.save(brand);

    if (!saveResult.success) {
      return fail(saveResult.error);
    }

    return ok({
      brand: saveResult.value,
    });
  }
}
