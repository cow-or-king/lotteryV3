/**
 * CreateBrand Use Case
 * Cas d'usage: Créer une nouvelle enseigne
 * IMPORTANT: ZERO any types
 */

import type { Result } from '@/lib/types/result.type';
import { ok, fail } from '@/lib/types/result.type';
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

// ============================================================================
// HELPER FUNCTIONS (Outside class to reduce execute() complexity)
// ============================================================================

/**
 * Validates brand name
 */
function validateBrandName(name: string): Result<void> {
  if (!name || name.trim().length === 0) {
    return fail(new Error('Brand name is required'));
  }

  if (name.trim().length < 2) {
    return fail(new Error('Brand name must be at least 2 characters long'));
  }

  if (name.trim().length > 100) {
    return fail(new Error('Brand name must be at most 100 characters long'));
  }

  return ok(undefined);
}

/**
 * Validates logo URL
 */
function validateLogoUrl(logoUrl: string): Result<void> {
  if (!logoUrl || logoUrl.trim().length === 0) {
    return fail(new Error('Logo URL is required'));
  }

  return ok(undefined);
}

/**
 * Validates owner ID
 */
function validateOwnerId(ownerId: string): Result<void> {
  if (!ownerId || ownerId.trim().length === 0) {
    return fail(new Error('Owner ID is required'));
  }

  return ok(undefined);
}

/**
 * Validates hex color format
 */
function validateHexColor(color: string | undefined, colorName: string): Result<void> {
  if (!color) {
    return ok(undefined);
  }

  const hexColorRegex = /^#[0-9A-F]{6}$/i;
  if (!hexColorRegex.test(color)) {
    return fail(new Error(`${colorName} must be a valid hex color (e.g., #5B21B6)`));
  }

  return ok(undefined);
}

/**
 * Builds brand data with defaults
 */
function buildBrandData(input: CreateBrandInput) {
  return {
    name: input.name.trim(),
    logoUrl: input.logoUrl.trim(),
    ownerId: input.ownerId,
    primaryColor: input.primaryColor || '#5B21B6',
    secondaryColor: input.secondaryColor || '#FACC15',
    font: input.font || 'inter',
    isPaid: input.isPaid || false,
  };
}

export class CreateBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(input: CreateBrandInput): Promise<Result<CreateBrandOutput>> {
    // 1. Validation du nom
    const nameValidation = validateBrandName(input.name);
    if (!nameValidation.success) {
      return nameValidation;
    }

    // 2. Validation de l'URL du logo
    const logoValidation = validateLogoUrl(input.logoUrl);
    if (!logoValidation.success) {
      return logoValidation;
    }

    // 3. Validation de l'owner ID
    const ownerValidation = validateOwnerId(input.ownerId);
    if (!ownerValidation.success) {
      return ownerValidation;
    }

    // 4. Validation de la couleur primaire
    const primaryColorValidation = validateHexColor(input.primaryColor, 'Primary color');
    if (!primaryColorValidation.success) {
      return primaryColorValidation;
    }

    // 5. Validation de la couleur secondaire
    const secondaryColorValidation = validateHexColor(input.secondaryColor, 'Secondary color');
    if (!secondaryColorValidation.success) {
      return secondaryColorValidation;
    }

    // 6. Créer via repository
    const brandData = buildBrandData(input);
    const brandResult = await this.brandRepository.create(brandData);

    if (!brandResult.success) {
      return fail(brandResult.error);
    }

    return ok({
      brand: brandResult.data,
    });
  }
}
