/**
 * Prize Entity - Représente un prix dans une campagne
 * RÈGLES:
 * - Un prix appartient à une campagne
 * - Un prix a une probabilité de gain
 * - Un prix a une quantité limitée
 */

import { Result } from '@/shared/types/result.type';
import { PrizeId, CampaignId } from '@/shared/types/branded.type';
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

/**
 * Prize Entity
 */
export class PrizeEntity {
  private constructor(private props: PrizeProps) {}

  // Factory Methods
  static create(props: CreatePrizeProps): Result<PrizeEntity> {
    // Validation du nom
    if (!props.name || props.name.trim().length < 2) {
      return Result.fail(new InvalidPrizeDataError('Prize name must be at least 2 characters'));
    }

    if (props.name.length > 100) {
      return Result.fail(new InvalidPrizeDataError('Prize name must be less than 100 characters'));
    }

    // Validation de la description
    if (props.description && props.description.length > 500) {
      return Result.fail(new InvalidPrizeDataError('Description must be less than 500 characters'));
    }

    // Validation de la valeur monétaire
    let value: Money | null = null;
    if (props.value !== undefined) {
      const moneyResult = Money.create(props.value, 'EUR');
      if (!moneyResult.success) {
        return Result.fail(new InvalidPrizeDataError('Invalid monetary value'));
      }
      value = moneyResult.data;
    }

    // Validation de la couleur (format hex)
    if (!this.isValidHexColor(props.color)) {
      return Result.fail(new InvalidPrizeDataError('Color must be a valid hex color'));
    }

    // Validation de la probabilité
    if (props.probability < 0 || props.probability > 1) {
      return Result.fail(new InvalidPrizeDataError('Probability must be between 0 and 1'));
    }

    // Validation de la quantité
    if (!Number.isInteger(props.quantity) || props.quantity < 1) {
      return Result.fail(new InvalidPrizeDataError('Quantity must be a positive integer'));
    }

    if (props.quantity > 10000) {
      return Result.fail(new InvalidPrizeDataError('Quantity cannot exceed 10000'));
    }

    const now = new Date();
    const prizeId = this.generatePrizeId();

    const prize = new PrizeEntity({
      id: prizeId,
      name: props.name.trim(),
      description: props.description?.trim() ?? null,
      campaignId: props.campaignId,
      value,
      color: props.color.toUpperCase(),
      probability: props.probability,
      quantity: props.quantity,
      remaining: props.quantity, // Initially, remaining equals quantity
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
    if (this.props.quantity === 0) return 0;
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
    // Validation du nom
    if (updates.name !== undefined) {
      if (updates.name.trim().length < 2 || updates.name.length > 100) {
        return Result.fail(new InvalidPrizeDataError('Invalid prize name'));
      }
    }

    // Validation de la description
    if (updates.description !== undefined && updates.description.length > 500) {
      return Result.fail(new InvalidPrizeDataError('Description too long'));
    }

    // Validation de la couleur
    if (updates.color !== undefined && !PrizeEntity.isValidHexColor(updates.color)) {
      return Result.fail(new InvalidPrizeDataError('Invalid color format'));
    }

    // Validation de la valeur
    let newValue = this.props.value;
    if (updates.value !== undefined) {
      const moneyResult = Money.create(updates.value, 'EUR');
      if (!moneyResult.success) {
        return Result.fail(new InvalidPrizeDataError('Invalid monetary value'));
      }
      newValue = moneyResult.data;
    }

    const updatedPrize = new PrizeEntity({
      ...this.props,
      name: updates.name?.trim() ?? this.props.name,
      description: updates.description?.trim() ?? this.props.description,
      color: updates.color?.toUpperCase() ?? this.props.color,
      value: newValue,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPrize);
  }

  // Private Helpers
  private static isValidHexColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  private static generatePrizeId(): PrizeId {
    return `prize_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as PrizeId;
  }

  // Serialization
  toPersistence(): PrizeProps {
    return { ...this.props };
  }
}
