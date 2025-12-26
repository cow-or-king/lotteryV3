/**
 * PrizeTemplate Entity - Représente un modèle de gain réutilisable
 * RÈGLES:
 * - Un prize template appartient à un brand
 * - Un prize template peut être utilisé dans plusieurs prize sets
 * - Un prize template a un nom, une description optionnelle, une valeur optionnelle, une couleur et une icône optionnelle
 */

import { Result } from '@/lib/types/result.type';
import { PrizeTemplateId, BrandId } from '@/lib/types/branded.type';

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

export interface PrizeTemplateUpdateProps {
  name?: string;
  description?: string;
  value?: number;
  color?: string;
  iconUrl?: string;
}

// Helper functions for validation - shared between create and update
function validateName(name: string | undefined): Result<string> {
  if (!name || name.trim().length < 2) {
    return Result.fail(
      new InvalidPrizeTemplateDataError('Prize template name must be at least 2 characters'),
    );
  }

  if (name.length > 100) {
    return Result.fail(
      new InvalidPrizeTemplateDataError('Prize template name must be less than 100 characters'),
    );
  }

  return Result.ok(name.trim());
}

function validateNameUpdate(name: string): Result<string> {
  return validateName(name);
}

function validateDescription(description: string | undefined): Result<string | null> {
  if (description && description.length > 500) {
    return Result.fail(
      new InvalidPrizeTemplateDataError('Description must be less than 500 characters'),
    );
  }

  return Result.ok(description?.trim() || null);
}

function validateDescriptionUpdate(description: string): Result<string | null> {
  return validateDescription(description);
}

function validateValue(value: number | undefined): Result<number | null> {
  if (value !== undefined && value < 0) {
    return Result.fail(new InvalidPrizeTemplateDataError('Value must be positive'));
  }

  return Result.ok(value ?? null);
}

function validateValueUpdate(value: number): Result<number> {
  if (value < 0) {
    return Result.fail(new InvalidPrizeTemplateDataError('Value must be positive'));
  }

  return Result.ok(value);
}

function validateColorUpdate(color: string): Result<string> {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexRegex.test(color)) {
    return Result.fail(new InvalidPrizeTemplateDataError('Invalid color format'));
  }

  return Result.ok(color);
}

function validateIconUrlUpdate(iconUrl: string): Result<string | null> {
  if (iconUrl) {
    try {
      new URL(iconUrl);
    } catch {
      return Result.fail(new InvalidPrizeTemplateDataError('Invalid icon URL'));
    }
  }

  return Result.ok(iconUrl || null);
}

function buildUpdatedProps(
  currentProps: PrizeTemplateProps,
  updates: PrizeTemplateUpdateProps,
): PrizeTemplateProps {
  return {
    ...currentProps,
    name: updates.name !== undefined ? updates.name : currentProps.name,
    description: updates.description !== undefined ? updates.description : currentProps.description,
    value: updates.value !== undefined ? updates.value : currentProps.value,
    color: updates.color !== undefined ? updates.color : currentProps.color,
    iconUrl: updates.iconUrl !== undefined ? updates.iconUrl : currentProps.iconUrl,
    updatedAt: new Date(),
  };
}

/**
 * PrizeTemplate Entity
 */
export class PrizeTemplateEntity {
  private constructor(private props: PrizeTemplateProps) {}

  // Factory Methods
  static create(props: CreatePrizeTemplateProps): Result<PrizeTemplateEntity> {
    // Validate name
    const nameResult = validateName(props.name);
    if (!nameResult.success) {
      return Result.fail(nameResult.error);
    }

    // Validate description
    const descriptionResult = validateDescription(props.description);
    if (!descriptionResult.success) {
      return Result.fail(descriptionResult.error);
    }

    // Validate value
    const valueResult = validateValue(props.value);
    if (!valueResult.success) {
      return Result.fail(valueResult.error);
    }

    // Validate color
    const color = props.color || '#8B5CF6';
    const colorResult = validateColorUpdate(color);
    if (!colorResult.success) {
      return Result.fail(colorResult.error);
    }

    // Validate icon URL
    if (props.iconUrl) {
      const iconResult = validateIconUrlUpdate(props.iconUrl);
      if (!iconResult.success) {
        return Result.fail(iconResult.error);
      }
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
  update(updates: PrizeTemplateUpdateProps): Result<PrizeTemplateEntity> {
    const validatedUpdates: PrizeTemplateUpdateProps = {};

    // Validate name if provided
    if (updates.name !== undefined) {
      const nameResult = validateNameUpdate(updates.name);
      if (!nameResult.success) {
        return nameResult;
      }
      validatedUpdates.name = nameResult.data;
    }

    // Validate description if provided
    if (updates.description !== undefined) {
      const descriptionResult = validateDescriptionUpdate(updates.description);
      if (!descriptionResult.success) {
        return descriptionResult;
      }
      validatedUpdates.description = descriptionResult.data ?? undefined;
    }

    // Validate value if provided
    if (updates.value !== undefined) {
      const valueResult = validateValueUpdate(updates.value);
      if (!valueResult.success) {
        return valueResult;
      }
      validatedUpdates.value = valueResult.data;
    }

    // Validate color if provided
    if (updates.color !== undefined) {
      const colorResult = validateColorUpdate(updates.color);
      if (!colorResult.success) {
        return colorResult;
      }
      validatedUpdates.color = colorResult.data;
    }

    // Validate iconUrl if provided
    if (updates.iconUrl !== undefined) {
      const iconUrlResult = validateIconUrlUpdate(updates.iconUrl);
      if (!iconUrlResult.success) {
        return iconUrlResult;
      }
      validatedUpdates.iconUrl = iconUrlResult.data ?? undefined;
    }

    const updatedProps = buildUpdatedProps(this.props, validatedUpdates);
    const updatedPrizeTemplate = new PrizeTemplateEntity(updatedProps);

    return Result.ok(updatedPrizeTemplate);
  }

  private static generatePrizeTemplateId(): PrizeTemplateId {
    return `prize_template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as PrizeTemplateId;
  }

  // Serialization
  toPersistence(): PrizeTemplateProps {
    return { ...this.props };
  }
}
