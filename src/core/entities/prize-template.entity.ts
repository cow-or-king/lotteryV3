/**
 * PrizeTemplate Entity - Représente un modèle de gain réutilisable
 * RÈGLES:
 * - Un prize template appartient à un brand
 * - Un prize template peut être utilisé dans plusieurs prize sets
 * - Un prize template a un nom, une description optionnelle, une valeur optionnelle, une couleur et une icône optionnelle
 */

import { Result } from '@/shared/types/result.type';
import { PrizeTemplateId, BrandId } from '@/shared/types/branded.type';

// Domain Errors
export class InvalidPrizeTemplateDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPrizeTemplateDataError';
  }
}

export class PrizeTemplateOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrizeTemplateOperationError';
  }
}

export interface CreatePrizeTemplateProps {
  readonly name: string;
  readonly brandId: BrandId;
  readonly description?: string;
  readonly value?: number;
  readonly color?: string;
  readonly iconUrl?: string;
}

export interface PrizeTemplateProps {
  readonly id: PrizeTemplateId;
  readonly brandId: BrandId;
  readonly name: string;
  readonly description: string | null;
  readonly value: number | null;
  readonly color: string;
  readonly iconUrl: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * PrizeTemplate Entity
 */
export class PrizeTemplateEntity {
  private constructor(private props: PrizeTemplateProps) {}

  // Factory Methods
  static create(props: CreatePrizeTemplateProps): Result<PrizeTemplateEntity> {
    // Validation du nom
    if (!props.name || props.name.trim().length < 2) {
      return Result.fail(
        new InvalidPrizeTemplateDataError('Prize template name must be at least 2 characters'),
      );
    }

    if (props.name.length > 100) {
      return Result.fail(
        new InvalidPrizeTemplateDataError('Prize template name must be less than 100 characters'),
      );
    }

    // Validation de la description
    if (props.description && props.description.length > 500) {
      return Result.fail(
        new InvalidPrizeTemplateDataError('Description must be less than 500 characters'),
      );
    }

    // Validation de la valeur
    if (props.value !== undefined && props.value < 0) {
      return Result.fail(new InvalidPrizeTemplateDataError('Value must be positive'));
    }

    // Validation de la couleur
    const color = props.color || '#8B5CF6';
    if (!this.isValidHexColor(color)) {
      return Result.fail(new InvalidPrizeTemplateDataError('Invalid color format'));
    }

    // Validation de l'URL de l'icône
    if (props.iconUrl && !this.isValidUrl(props.iconUrl)) {
      return Result.fail(new InvalidPrizeTemplateDataError('Invalid icon URL'));
    }

    const now = new Date();
    const prizeTemplateId = this.generatePrizeTemplateId();

    const prizeTemplate = new PrizeTemplateEntity({
      id: prizeTemplateId,
      brandId: props.brandId,
      name: props.name.trim(),
      description: props.description?.trim() || null,
      value: props.value || null,
      color,
      iconUrl: props.iconUrl || null,
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(prizeTemplate);
  }

  static fromPersistence(props: PrizeTemplateProps): PrizeTemplateEntity {
    return new PrizeTemplateEntity(props);
  }

  // Getters
  get id(): PrizeTemplateId {
    return this.props.id;
  }

  get brandId(): BrandId {
    return this.props.brandId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get value(): number | null {
    return this.props.value;
  }

  get color(): string {
    return this.props.color;
  }

  get iconUrl(): string | null {
    return this.props.iconUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Logic
  update(updates: {
    name?: string;
    description?: string;
    value?: number;
    color?: string;
    iconUrl?: string;
  }): Result<PrizeTemplateEntity> {
    // Validation du nom
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length < 2) {
        return Result.fail(
          new InvalidPrizeTemplateDataError('Prize template name must be at least 2 characters'),
        );
      }

      if (updates.name.length > 100) {
        return Result.fail(
          new InvalidPrizeTemplateDataError('Prize template name must be less than 100 characters'),
        );
      }
    }

    // Validation de la description
    if (
      updates.description !== undefined &&
      updates.description &&
      updates.description.length > 500
    ) {
      return Result.fail(
        new InvalidPrizeTemplateDataError('Description must be less than 500 characters'),
      );
    }

    // Validation de la valeur
    if (updates.value !== undefined && updates.value < 0) {
      return Result.fail(new InvalidPrizeTemplateDataError('Value must be positive'));
    }

    // Validation de la couleur
    if (updates.color !== undefined && !PrizeTemplateEntity.isValidHexColor(updates.color)) {
      return Result.fail(new InvalidPrizeTemplateDataError('Invalid color format'));
    }

    // Validation de l'URL de l'icône
    if (
      updates.iconUrl !== undefined &&
      updates.iconUrl &&
      !PrizeTemplateEntity.isValidUrl(updates.iconUrl)
    ) {
      return Result.fail(new InvalidPrizeTemplateDataError('Invalid icon URL'));
    }

    const updatedPrizeTemplate = new PrizeTemplateEntity({
      ...this.props,
      name: updates.name !== undefined ? updates.name.trim() : this.props.name,
      description:
        updates.description !== undefined
          ? updates.description?.trim() || null
          : this.props.description,
      value: updates.value !== undefined ? updates.value : this.props.value,
      color: updates.color !== undefined ? updates.color : this.props.color,
      iconUrl: updates.iconUrl !== undefined ? updates.iconUrl || null : this.props.iconUrl,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPrizeTemplate);
  }

  // Private Helpers
  private static isValidHexColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static generatePrizeTemplateId(): PrizeTemplateId {
    return `prize_template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as PrizeTemplateId;
  }

  // Serialization
  toPersistence(): PrizeTemplateProps {
    return { ...this.props };
  }
}
