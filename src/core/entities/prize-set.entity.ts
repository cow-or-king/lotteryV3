/**
 * PrizeSet Entity - Représente un lot de gains
 * RÈGLES:
 * - Un prize set appartient à un brand
 * - Un prize set peut contenir plusieurs prize templates
 * - Un prize set a un nom et une description optionnelle
 */

import { Result } from '@/shared/types/result.type';
import { PrizeSetId, BrandId, PrizeTemplateId, PrizeSetItemId } from '@/shared/types/branded.type';

// Domain Errors
export class InvalidPrizeSetDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPrizeSetDataError';
  }
}

export class PrizeSetOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrizeSetOperationError';
  }
}

export interface PrizeSetItem {
  readonly id: PrizeSetItemId;
  readonly prizeTemplateId: PrizeTemplateId;
  readonly probability: number;
  readonly quantity: number;
}

export interface CreatePrizeSetProps {
  readonly name: string;
  readonly brandId: BrandId;
  readonly description?: string;
}

export interface PrizeSetProps {
  readonly id: PrizeSetId;
  readonly brandId: BrandId;
  readonly name: string;
  readonly description: string | null;
  readonly items: ReadonlyArray<PrizeSetItem>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * PrizeSet Entity
 */
export class PrizeSetEntity {
  private constructor(private props: PrizeSetProps) {}

  // Factory Methods
  static create(props: CreatePrizeSetProps): Result<PrizeSetEntity> {
    // Validation du nom
    if (!props.name || props.name.trim().length < 2) {
      return Result.fail(
        new InvalidPrizeSetDataError('Prize set name must be at least 2 characters'),
      );
    }

    if (props.name.length > 100) {
      return Result.fail(
        new InvalidPrizeSetDataError('Prize set name must be less than 100 characters'),
      );
    }

    // Validation de la description
    if (props.description && props.description.length > 500) {
      return Result.fail(
        new InvalidPrizeSetDataError('Description must be less than 500 characters'),
      );
    }

    const now = new Date();
    const prizeSetId = this.generatePrizeSetId();

    const prizeSet = new PrizeSetEntity({
      id: prizeSetId,
      brandId: props.brandId,
      name: props.name.trim(),
      description: props.description?.trim() || null,
      items: [],
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(prizeSet);
  }

  static fromPersistence(props: PrizeSetProps): PrizeSetEntity {
    return new PrizeSetEntity(props);
  }

  // Getters
  get id(): PrizeSetId {
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

  get items(): ReadonlyArray<PrizeSetItem> {
    return this.props.items;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Logic
  update(updates: { name?: string; description?: string }): Result<PrizeSetEntity> {
    // Validation du nom
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length < 2) {
        return Result.fail(
          new InvalidPrizeSetDataError('Prize set name must be at least 2 characters'),
        );
      }

      if (updates.name.length > 100) {
        return Result.fail(
          new InvalidPrizeSetDataError('Prize set name must be less than 100 characters'),
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
        new InvalidPrizeSetDataError('Description must be less than 500 characters'),
      );
    }

    const updatedPrizeSet = new PrizeSetEntity({
      ...this.props,
      name: updates.name !== undefined ? updates.name.trim() : this.props.name,
      description:
        updates.description !== undefined
          ? updates.description?.trim() || null
          : this.props.description,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPrizeSet);
  }

  addItem(item: {
    prizeTemplateId: PrizeTemplateId;
    probability: number;
    quantity: number;
  }): Result<PrizeSetEntity> {
    // Validation de la probabilité
    if (item.probability < 0 || item.probability > 100) {
      return Result.fail(new InvalidPrizeSetDataError('Probability must be between 0 and 100'));
    }

    // Validation de la quantité
    if (item.quantity < 1) {
      return Result.fail(new InvalidPrizeSetDataError('Quantity must be at least 1'));
    }

    // Vérifier que le prize template n'est pas déjà dans le set
    if (this.props.items.some((i) => i.prizeTemplateId === item.prizeTemplateId)) {
      return Result.fail(new PrizeSetOperationError('Prize template already in set'));
    }

    const newItem: PrizeSetItem = {
      id: this.generatePrizeSetItemId(),
      prizeTemplateId: item.prizeTemplateId,
      probability: item.probability,
      quantity: item.quantity,
    };

    const updatedPrizeSet = new PrizeSetEntity({
      ...this.props,
      items: [...this.props.items, newItem],
      updatedAt: new Date(),
    });

    return Result.ok(updatedPrizeSet);
  }

  removeItem(prizeTemplateId: PrizeTemplateId): Result<PrizeSetEntity> {
    // Vérifier que le prize template est dans le set
    if (!this.props.items.some((i) => i.prizeTemplateId === prizeTemplateId)) {
      return Result.fail(new PrizeSetOperationError('Prize template not in set'));
    }

    const updatedPrizeSet = new PrizeSetEntity({
      ...this.props,
      items: this.props.items.filter((i) => i.prizeTemplateId !== prizeTemplateId),
      updatedAt: new Date(),
    });

    return Result.ok(updatedPrizeSet);
  }

  updateItem(
    prizeTemplateId: PrizeTemplateId,
    updates: { probability?: number; quantity?: number },
  ): Result<PrizeSetEntity> {
    // Vérifier que le prize template est dans le set
    const itemIndex = this.props.items.findIndex((i) => i.prizeTemplateId === prizeTemplateId);
    if (itemIndex === -1) {
      return Result.fail(new PrizeSetOperationError('Prize template not in set'));
    }

    // Validation de la probabilité
    if (
      updates.probability !== undefined &&
      (updates.probability < 0 || updates.probability > 100)
    ) {
      return Result.fail(new InvalidPrizeSetDataError('Probability must be between 0 and 100'));
    }

    // Validation de la quantité
    if (updates.quantity !== undefined && updates.quantity < 1) {
      return Result.fail(new InvalidPrizeSetDataError('Quantity must be at least 1'));
    }

    const currentItem = this.props.items[itemIndex];
    if (!currentItem) {
      return Result.fail(new PrizeSetOperationError('Prize template not in set'));
    }

    const updatedItem: PrizeSetItem = {
      id: currentItem.id,
      prizeTemplateId: currentItem.prizeTemplateId,
      probability:
        updates.probability !== undefined ? updates.probability : currentItem.probability,
      quantity: updates.quantity !== undefined ? updates.quantity : currentItem.quantity,
    };

    const updatedItems = [...this.props.items];
    updatedItems[itemIndex] = updatedItem;

    const updatedPrizeSet = new PrizeSetEntity({
      ...this.props,
      items: updatedItems,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPrizeSet);
  }

  // Calcul de la probabilité totale
  getTotalProbability(): number {
    return this.props.items.reduce((sum, item) => sum + item.probability, 0);
  }

  // Vérifier si le set est valide (probabilités totales <= 100%)
  isValid(): boolean {
    return this.getTotalProbability() <= 100;
  }

  // Private Helpers
  private static generatePrizeSetId(): PrizeSetId {
    return `prize_set_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as PrizeSetId;
  }

  private generatePrizeSetItemId(): PrizeSetItemId {
    return `prize_set_item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as PrizeSetItemId;
  }

  // Serialization
  toPersistence(): PrizeSetProps {
    return { ...this.props };
  }
}
