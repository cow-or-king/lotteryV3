/**
 * Campaign Entity - Représente une campagne de loterie
 * RÈGLES:
 * - Une campagne appartient à un store
 * - Une campagne a des dates de début et fin
 * - Une campagne peut avoir plusieurs prix
 */

import { Result } from '@/lib/types/result.type';
import { CampaignId, StoreId, PrizeId } from '@/lib/types/branded.type';

// Domain Errors
export class InvalidCampaignDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCampaignDataError';
  }
}

export class CampaignOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CampaignOperationError';
  }
}

// Value Objects
export interface CampaignSettings {
  readonly wheelStyle: 'classic' | 'modern' | 'neon' | 'minimal';
  readonly wheelAnimation: 'spin' | 'bounce' | 'elastic';
  readonly requireReview: boolean;
  readonly minReviewRating: number; // 1-5
  readonly winChancePercentage: number; // 0-100
}

export interface CreateCampaignProps {
  readonly name: string;
  readonly description?: string;
  readonly storeId: StoreId;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly settings?: Partial<CampaignSettings>;
}

export interface CampaignProps {
  readonly id: CampaignId;
  readonly name: string;
  readonly description: string | null;
  readonly storeId: StoreId;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly settings: CampaignSettings;
  readonly prizes: ReadonlyArray<PrizeId>;
  readonly participantsCount: number;
  readonly winnersCount: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Campaign Entity
 */
export class CampaignEntity {
  private constructor(private props: CampaignProps) {}

  // Factory Methods
  static create(props: CreateCampaignProps): Result<CampaignEntity> {
    // Validation du nom
    if (!props.name || props.name.trim().length < 2) {
      return Result.fail(
        new InvalidCampaignDataError('Campaign name must be at least 2 characters'),
      );
    }

    if (props.name.length > 100) {
      return Result.fail(
        new InvalidCampaignDataError('Campaign name must be less than 100 characters'),
      );
    }

    // Validation de la description
    if (props.description && props.description.length > 500) {
      return Result.fail(
        new InvalidCampaignDataError('Description must be less than 500 characters'),
      );
    }

    // Validation des dates
    const now = new Date();
    const startDate = new Date(props.startDate);
    const endDate = new Date(props.endDate);

    if (isNaN(startDate.getTime())) {
      return Result.fail(new InvalidCampaignDataError('Invalid start date'));
    }

    if (isNaN(endDate.getTime())) {
      return Result.fail(new InvalidCampaignDataError('Invalid end date'));
    }

    if (endDate <= startDate) {
      return Result.fail(new InvalidCampaignDataError('End date must be after start date'));
    }

    if (endDate < now) {
      return Result.fail(new InvalidCampaignDataError('End date cannot be in the past'));
    }

    // Settings par défaut
    const defaultSettings: CampaignSettings = {
      wheelStyle: 'classic',
      wheelAnimation: 'spin',
      requireReview: true,
      minReviewRating: 4,
      winChancePercentage: 100,
      ...props.settings,
    };

    // Validation des settings
    if (defaultSettings.minReviewRating < 1 || defaultSettings.minReviewRating > 5) {
      return Result.fail(new InvalidCampaignDataError('Min review rating must be between 1 and 5'));
    }

    if (defaultSettings.winChancePercentage < 0 || defaultSettings.winChancePercentage > 100) {
      return Result.fail(new InvalidCampaignDataError('Win chance must be between 0 and 100'));
    }

    const campaignId = this.generateCampaignId();

    const campaign = new CampaignEntity({
      id: campaignId,
      name: props.name.trim(),
      description: props.description?.trim() ?? null,
      storeId: props.storeId,
      startDate,
      endDate,
      settings: defaultSettings,
      prizes: [],
      participantsCount: 0,
      winnersCount: 0,
      isActive: false, // Inactif par défaut, doit être activé manuellement
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(campaign);
  }

  static fromPersistence(props: CampaignProps): CampaignEntity {
    return new CampaignEntity(props);
  }

  // Getters
  get id(): CampaignId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get storeId(): StoreId {
    return this.props.storeId;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get settings(): CampaignSettings {
    return this.props.settings;
  }

  get prizes(): ReadonlyArray<PrizeId> {
    return this.props.prizes;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get participantsCount(): number {
    return this.props.participantsCount;
  }

  get winnersCount(): number {
    return this.props.winnersCount;
  }

  // Business Logic
  isRunning(): boolean {
    const now = new Date();
    return this.props.isActive && now >= this.props.startDate && now <= this.props.endDate;
  }

  hasStarted(): boolean {
    return new Date() >= this.props.startDate;
  }

  hasEnded(): boolean {
    return new Date() > this.props.endDate;
  }

  canBeActivated(): boolean {
    // Une campagne peut être activée si:
    // - Elle n'est pas déjà active
    // - Elle n'est pas terminée
    // - Elle a au moins un prix
    return !this.props.isActive && !this.hasEnded() && this.props.prizes.length > 0;
  }

  canBeDeactivated(): boolean {
    return this.props.isActive && !this.hasEnded();
  }

  canBeDeleted(): boolean {
    // Une campagne peut être supprimée si elle n'a pas encore commencé
    // ou si elle n'a pas de participants
    return !this.hasStarted() || this.props.participantsCount === 0;
  }

  activate(): Result<CampaignEntity> {
    if (!this.canBeActivated()) {
      if (this.props.isActive) {
        return Result.fail(new CampaignOperationError('Campaign is already active'));
      }
      if (this.hasEnded()) {
        return Result.fail(new CampaignOperationError('Cannot activate an ended campaign'));
      }
      if (this.props.prizes.length === 0) {
        return Result.fail(new CampaignOperationError('Campaign must have at least one prize'));
      }
    }

    const updatedCampaign = new CampaignEntity({
      ...this.props,
      isActive: true,
      updatedAt: new Date(),
    });

    return Result.ok(updatedCampaign);
  }

  deactivate(): Result<CampaignEntity> {
    if (!this.canBeDeactivated()) {
      if (!this.props.isActive) {
        return Result.fail(new CampaignOperationError('Campaign is already inactive'));
      }
      if (this.hasEnded()) {
        return Result.fail(new CampaignOperationError('Cannot deactivate an ended campaign'));
      }
    }

    const updatedCampaign = new CampaignEntity({
      ...this.props,
      isActive: false,
      updatedAt: new Date(),
    });

    return Result.ok(updatedCampaign);
  }

  addPrize(prizeId: PrizeId): Result<CampaignEntity> {
    if (this.props.prizes.includes(prizeId)) {
      return Result.fail(new CampaignOperationError('Prize already associated with campaign'));
    }

    if (this.hasStarted() && this.props.isActive) {
      return Result.fail(
        new CampaignOperationError('Cannot add prizes to an active running campaign'),
      );
    }

    const updatedCampaign = new CampaignEntity({
      ...this.props,
      prizes: [...this.props.prizes, prizeId],
      updatedAt: new Date(),
    });

    return Result.ok(updatedCampaign);
  }

  removePrize(prizeId: PrizeId): Result<CampaignEntity> {
    if (!this.props.prizes.includes(prizeId)) {
      return Result.fail(new CampaignOperationError('Prize not associated with campaign'));
    }

    if (this.hasStarted() && this.props.isActive) {
      return Result.fail(
        new CampaignOperationError('Cannot remove prizes from an active running campaign'),
      );
    }

    const updatedCampaign = new CampaignEntity({
      ...this.props,
      prizes: this.props.prizes.filter((id) => id !== prizeId),
      updatedAt: new Date(),
    });

    return Result.ok(updatedCampaign);
  }

  updateSettings(settings: Partial<CampaignSettings>): Result<CampaignEntity> {
    if (this.hasStarted() && this.props.isActive) {
      return Result.fail(
        new CampaignOperationError('Cannot update settings of an active running campaign'),
      );
    }

    const newSettings = { ...this.props.settings, ...settings };

    // Validation
    if (newSettings.minReviewRating < 1 || newSettings.minReviewRating > 5) {
      return Result.fail(new InvalidCampaignDataError('Min review rating must be between 1 and 5'));
    }

    if (newSettings.winChancePercentage < 0 || newSettings.winChancePercentage > 100) {
      return Result.fail(new InvalidCampaignDataError('Win chance must be between 0 and 100'));
    }

    const updatedCampaign = new CampaignEntity({
      ...this.props,
      settings: newSettings,
      updatedAt: new Date(),
    });

    return Result.ok(updatedCampaign);
  }

  incrementParticipants(): CampaignEntity {
    return new CampaignEntity({
      ...this.props,
      participantsCount: this.props.participantsCount + 1,
      updatedAt: new Date(),
    });
  }

  incrementWinners(): CampaignEntity {
    return new CampaignEntity({
      ...this.props,
      winnersCount: this.props.winnersCount + 1,
      updatedAt: new Date(),
    });
  }

  // Private Helpers
  private static generateCampaignId(): CampaignId {
    return `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as CampaignId;
  }

  // Serialization
  toPersistence(): CampaignProps {
    return { ...this.props };
  }
}
