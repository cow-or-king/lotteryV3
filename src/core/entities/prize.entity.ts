/**
 * Prize Entity - Représente un prix dans une campagne
 * RÈGLES:
 * - Un prix appartient à une campagne
 * - Un prix a une probabilité de gain
 * - Un prix a une quantité limitée
 */

import { Result } from '@/lib/types/result.type';
import { PrizeId, CampaignId } from '@/lib/types/branded.type';
import { Money } from '@/core/value-objects/money.vo';

// Domain Errors
export class InvalidPrizeDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPrizeDataError';
  }
}

export class PrizeOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrizeOperationError';
  }
}

export interface CreatePrizeProps {
  readonly name: string;
  readonly description?: string;
  readonly campaignId: CampaignId;
  readonly value?: number; // Valeur monétaire optionnelle en euros
  readonly color: string; // Couleur sur la roue
  readonly probability: number; // 0.0 à 1.0
  readonly quantity: number; // Nombre total disponible
}

export interface PrizeProps {
  readonly id: PrizeId;
  readonly name: string;
  readonly description: string | null;
  readonly campaignId: CampaignId;
  readonly value: Money | null;
  readonly color: string;
  readonly probability: number;
  readonly quantity: number;
  readonly remaining: number;
  readonly winnersCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Module-level validation helpers
function validateName(name: string | undefined): Result<string> {
  if (!name || name.trim().length < 2) {
    return Result.fail(new InvalidPrizeDataError('Prize name must be at least 2 characters'));
  }

  if (name.length > 100) {
    return Result.fail(new InvalidPrizeDataError('Prize name must be less than 100 characters'));
  }

  return Result.ok(name.trim());
}

function validateDescription(description: string | undefined): Result<string | null> {
  if (description && description.length > 500) {
    return Result.fail(new InvalidPrizeDataError('Description must be less than 500 characters'));
  }

  return Result.ok(description?.trim() ?? null);
}

function validateMonetaryValue(value: number | undefined): Result<Money | null> {
  if (value === undefined) {
    return Result.ok(null);
  }

  const moneyResult = Money.create(value, 'EUR');
  if (!moneyResult.success) {
    return Result.fail(new InvalidPrizeDataError('Invalid monetary value'));
  }

  return Result.ok(moneyResult.data);
}

function validateHexColor(color: string): Result<string> {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexRegex.test(color)) {
    return Result.fail(new InvalidPrizeDataError('Color must be a valid hex color'));
  }

  return Result.ok(color.toUpperCase());
}

function validateProbability(probability: number): Result<number> {
  if (probability < 0 || probability > 1) {
    return Result.fail(new InvalidPrizeDataError('Probability must be between 0 and 1'));
  }

  return Result.ok(probability);
}

function validateQuantity(quantity: number): Result<number> {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return Result.fail(new InvalidPrizeDataError('Quantity must be a positive integer'));
  }

  if (quantity > 10000) {
    return Result.fail(new InvalidPrizeDataError('Quantity cannot exceed 10000'));
  }

  return Result.ok(quantity);
}

// Helper function to build updated props
function buildUpdatedPrizeProps(
  currentProps: PrizeProps,
  updates: { name?: string; description?: string | null; color?: string; value?: Money | null },
): PrizeProps {
  return {
    ...currentProps,
    name: updates.name !== undefined ? updates.name : currentProps.name,
    description: updates.description !== undefined ? updates.description : currentProps.description,
    color: updates.color !== undefined ? updates.color : currentProps.color,
    value: updates.value !== undefined ? updates.value : currentProps.value,
    updatedAt: new Date(),
  };
}

/**
 * Prize Entity
 */
export class PrizeEntity {
  private constructor(private props: PrizeProps) {}

  // Factory Methods
  static create(props: CreatePrizeProps): Result<PrizeEntity> {
    // Validate name
    const nameResult = validateName(props.name);
    if (!nameResult.success) {
      return nameResult;
    }

    // Validate description
    const descriptionResult = validateDescription(props.description);
    if (!descriptionResult.success) {
      return descriptionResult;
    }

    // Validate monetary value
    const valueResult = validateMonetaryValue(props.value);
    if (!valueResult.success) {
      return valueResult;
    }

    // Validate color
    const colorResult = validateHexColor(props.color);
    if (!colorResult.success) {
      return colorResult;
    }

    // Validate probability
    const probabilityResult = validateProbability(props.probability);
    if (!probabilityResult.success) {
      return probabilityResult;
    }

    // Validate quantity
    const quantityResult = validateQuantity(props.quantity);
    if (!quantityResult.success) {
      return quantityResult;
    }

    const now = new Date();
    const prizeId = this.generatePrizeId();

    const prize = new PrizeEntity({
      id: prizeId,
      name: nameResult.data,
      description: descriptionResult.data,
      campaignId: props.campaignId,
      value: valueResult.data,
      color: colorResult.data,
      probability: probabilityResult.data,
      quantity: quantityResult.data,
      remaining: quantityResult.data, // Initially, remaining equals quantity
      winnersCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(prize);
  }

  static fromPersistence(props: PrizeProps): PrizeEntity {
    return new PrizeEntity(props);
  }

  // Getters
  get id(): PrizeId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get campaignId(): CampaignId {
    return this.props.campaignId;
  }

  get value(): Money | null {
    return this.props.value;
  }

  get color(): string {
    return this.props.color;
  }

  get probability(): number {
    return this.props.probability;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get remaining(): number {
    return this.props.remaining;
  }

  get winnersCount(): number {
    return this.props.winnersCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Business Logic
  isAvailable(): boolean {
    return this.props.remaining > 0;
  }

  isOutOfStock(): boolean {
    return this.props.remaining === 0;
  }

  getAvailabilityPercentage(): number {
    if (this.props.quantity === 0) {
      return 0;
    }
    return (this.props.remaining / this.props.quantity) * 100;
  }

  canBeAwarded(): boolean {
    return this.isAvailable();
  }

  canBeDeleted(): boolean {
    // Un prix peut être supprimé s'il n'a pas encore été gagné
    return this.props.winnersCount === 0;
  }

  award(): Result<PrizeEntity> {
    if (!this.canBeAwarded()) {
      return Result.fail(new PrizeOperationError('Prize is no longer available'));
    }

    const updatedPrize = new PrizeEntity({
      ...this.props,
      remaining: this.props.remaining - 1,
      winnersCount: this.props.winnersCount + 1,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPrize);
  }

  /**
   * Restaure un prix (en cas d'annulation de gain)
   */
  restore(): Result<PrizeEntity> {
    if (this.props.winnersCount === 0) {
      return Result.fail(new PrizeOperationError('No winners to restore from'));
    }

    if (this.props.remaining >= this.props.quantity) {
      return Result.fail(new PrizeOperationError('Cannot restore beyond original quantity'));
    }

    const updatedPrize = new PrizeEntity({
      ...this.props,
      remaining: this.props.remaining + 1,
      winnersCount: this.props.winnersCount - 1,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPrize);
  }

  updateQuantity(newQuantity: number): Result<PrizeEntity> {
    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      return Result.fail(new InvalidPrizeDataError('Quantity must be a positive integer'));
    }

    if (newQuantity < this.props.winnersCount) {
      return Result.fail(
        new PrizeOperationError(
          `Cannot set quantity to ${newQuantity} as ${this.props.winnersCount} prizes have already been won`,
        ),
      );
    }

    const quantityDiff = newQuantity - this.props.quantity;
    const newRemaining = Math.max(0, this.props.remaining + quantityDiff);

    const updatedPrize = new PrizeEntity({
      ...this.props,
      quantity: newQuantity,
      remaining: newRemaining,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPrize);
  }

  updateProbability(newProbability: number): Result<PrizeEntity> {
    if (newProbability < 0 || newProbability > 1) {
      return Result.fail(new InvalidPrizeDataError('Probability must be between 0 and 1'));
    }

    const updatedPrize = new PrizeEntity({
      ...this.props,
      probability: newProbability,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPrize);
  }

  updateDetails(
    updates: Partial<{ name: string; description: string; color: string; value: number }>,
  ): Result<PrizeEntity> {
    const validatedUpdates: {
      name?: string;
      description?: string | null;
      color?: string;
      value?: Money | null;
    } = {};

    // Validate name if provided
    if (updates.name !== undefined) {
      const nameResult = validateName(updates.name);
      if (!nameResult.success) {
        return nameResult;
      }
      validatedUpdates.name = nameResult.data;
    }

    // Validate description if provided
    if (updates.description !== undefined) {
      const descriptionResult = validateDescription(updates.description);
      if (!descriptionResult.success) {
        return descriptionResult;
      }
      validatedUpdates.description = descriptionResult.data;
    }

    // Validate color if provided
    if (updates.color !== undefined) {
      const colorResult = validateHexColor(updates.color);
      if (!colorResult.success) {
        return colorResult;
      }
      validatedUpdates.color = colorResult.data;
    }

    // Validate value if provided
    if (updates.value !== undefined) {
      const valueResult = validateMonetaryValue(updates.value);
      if (!valueResult.success) {
        return valueResult;
      }
      validatedUpdates.value = valueResult.data;
    }

    const updatedProps = buildUpdatedPrizeProps(this.props, validatedUpdates);
    const updatedPrize = new PrizeEntity(updatedProps);

    return Result.ok(updatedPrize);
  }

  // Private Helpers
  private static generatePrizeId(): PrizeId {
    return `prize_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as PrizeId;
  }

  // Serialization
  toPersistence(): PrizeProps {
    return { ...this.props };
  }
}
