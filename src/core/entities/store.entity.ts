/**
 * Store Entity - Représente un magasin/commerce
 * RÈGLES:
 * - Un store appartient à un utilisateur
 * - Un store peut avoir plusieurs campagnes
 * - Un store a un branding personnalisable
 */

import { Result } from '@/shared/types/result.type';
import { StoreId, StoreName, UserId, GooglePlaceId, CampaignId } from '@/shared/types/branded.type';

// Domain Errors
export class InvalidStoreDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStoreDataError';
  }
}

export class StoreOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoreOperationError';
  }
}

// Value Objects
export interface StoreBranding {
  readonly logoUrl?: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly font: 'inter' | 'poppins' | 'roboto' | 'montserrat';
  readonly wheelStyle: 'classic' | 'modern' | 'neon' | 'minimal';
  readonly wheelAnimation: 'spin' | 'bounce' | 'elastic';
}

export interface StoreSettings {
  readonly emailNotifications: boolean;
  readonly reviewMinRating: number; // 1-5
  readonly language: 'fr' | 'en';
}

export interface CreateStoreProps {
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly ownerId: UserId;
  readonly googlePlaceId?: string;
  readonly googleBusinessUrl?: string;
}

export interface StoreProps {
  readonly id: StoreId;
  readonly slug: string;
  readonly name: StoreName;
  readonly description: string | null;
  readonly ownerId: UserId;
  readonly googlePlaceId: GooglePlaceId | null;
  readonly googleBusinessUrl: string | null;
  readonly branding: StoreBranding;
  readonly settings: StoreSettings;
  readonly campaigns: ReadonlyArray<CampaignId>;
  readonly isActive: boolean;
  readonly isPaid: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Store Entity
 */
export class StoreEntity {
  private constructor(private props: StoreProps) {}

  // Factory Methods
  static create(props: CreateStoreProps): Result<StoreEntity> {
    // Validation du nom
    if (!props.name || props.name.trim().length < 2) {
      return Result.fail(new InvalidStoreDataError('Store name must be at least 2 characters'));
    }

    if (props.name.length > 100) {
      return Result.fail(new InvalidStoreDataError('Store name must be less than 100 characters'));
    }

    // Validation du slug
    if (!this.isValidSlug(props.slug)) {
      return Result.fail(new InvalidStoreDataError('Invalid slug format'));
    }

    // Validation de la description
    if (props.description && props.description.length > 500) {
      return Result.fail(new InvalidStoreDataError('Description must be less than 500 characters'));
    }

    // Validation Google Business URL
    if (props.googleBusinessUrl && !this.isValidUrl(props.googleBusinessUrl)) {
      return Result.fail(new InvalidStoreDataError('Invalid Google Business URL'));
    }

    const now = new Date();
    const storeId = this.generateStoreId();

    const defaultBranding: StoreBranding = {
      primaryColor: '#5B21B6',
      secondaryColor: '#FACC15',
      font: 'inter',
      wheelStyle: 'classic',
      wheelAnimation: 'spin',
    };

    const defaultSettings: StoreSettings = {
      emailNotifications: true,
      reviewMinRating: 4,
      language: 'fr',
    };

    const store = new StoreEntity({
      id: storeId,
      slug: props.slug.toLowerCase(),
      name: props.name.trim() as StoreName,
      description: props.description?.trim() ?? null,
      ownerId: props.ownerId,
      googlePlaceId: (props.googlePlaceId as GooglePlaceId) ?? null,
      googleBusinessUrl: props.googleBusinessUrl ?? null,
      branding: defaultBranding,
      settings: defaultSettings,
      campaigns: [],
      isActive: true,
      isPaid: true,
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(store);
  }

  static fromPersistence(props: StoreProps): StoreEntity {
    return new StoreEntity(props);
  }

  // Getters
  get id(): StoreId {
    return this.props.id;
  }

  get slug(): string {
    return this.props.slug;
  }

  get name(): StoreName {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get ownerId(): UserId {
    return this.props.ownerId;
  }

  get branding(): StoreBranding {
    return this.props.branding;
  }

  get settings(): StoreSettings {
    return this.props.settings;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get campaigns(): ReadonlyArray<CampaignId> {
    return this.props.campaigns;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Business Logic
  canBeDeleted(): boolean {
    // Un store peut être supprimé s'il n'a pas de campagnes actives
    return this.props.campaigns.length === 0;
  }

  canCreateCampaign(): boolean {
    // Vérifier si le store est actif et payé
    return this.props.isActive && this.props.isPaid;
  }

  updateBranding(branding: Partial<StoreBranding>): Result<StoreEntity> {
    // Validation des couleurs (format hex)
    if (branding.primaryColor && !this.isValidHexColor(branding.primaryColor)) {
      return Result.fail(new InvalidStoreDataError('Invalid primary color format'));
    }

    if (branding.secondaryColor && !this.isValidHexColor(branding.secondaryColor)) {
      return Result.fail(new InvalidStoreDataError('Invalid secondary color format'));
    }

    const updatedStore = new StoreEntity({
      ...this.props,
      branding: {
        ...this.props.branding,
        ...branding,
      },
      updatedAt: new Date(),
    });

    return Result.ok(updatedStore);
  }

  updateSettings(settings: Partial<StoreSettings>): Result<StoreEntity> {
    // Validation du rating minimum
    if (settings.reviewMinRating !== undefined) {
      if (settings.reviewMinRating < 1 || settings.reviewMinRating > 5) {
        return Result.fail(new InvalidStoreDataError('Review rating must be between 1 and 5'));
      }
    }

    const updatedStore = new StoreEntity({
      ...this.props,
      settings: {
        ...this.props.settings,
        ...settings,
      },
      updatedAt: new Date(),
    });

    return Result.ok(updatedStore);
  }

  activate(): Result<StoreEntity> {
    if (this.props.isActive) {
      return Result.fail(new StoreOperationError('Store is already active'));
    }

    const updatedStore = new StoreEntity({
      ...this.props,
      isActive: true,
      updatedAt: new Date(),
    });

    return Result.ok(updatedStore);
  }

  deactivate(): Result<StoreEntity> {
    if (!this.props.isActive) {
      return Result.fail(new StoreOperationError('Store is already inactive'));
    }

    const updatedStore = new StoreEntity({
      ...this.props,
      isActive: false,
      updatedAt: new Date(),
    });

    return Result.ok(updatedStore);
  }

  addCampaign(campaignId: CampaignId): Result<StoreEntity> {
    if (!this.canCreateCampaign()) {
      return Result.fail(new StoreOperationError('Store cannot create campaigns'));
    }

    if (this.props.campaigns.includes(campaignId)) {
      return Result.fail(new StoreOperationError('Campaign already associated with store'));
    }

    const updatedStore = new StoreEntity({
      ...this.props,
      campaigns: [...this.props.campaigns, campaignId],
      updatedAt: new Date(),
    });

    return Result.ok(updatedStore);
  }

  removeCampaign(campaignId: CampaignId): Result<StoreEntity> {
    if (!this.props.campaigns.includes(campaignId)) {
      return Result.fail(new StoreOperationError('Campaign not associated with store'));
    }

    const updatedStore = new StoreEntity({
      ...this.props,
      campaigns: this.props.campaigns.filter((id) => id !== campaignId),
      updatedAt: new Date(),
    });

    return Result.ok(updatedStore);
  }

  // Private Helpers
  private static isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidHexColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  private static generateStoreId(): StoreId {
    return `store_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as StoreId;
  }

  // Serialization
  toPersistence(): StoreProps {
    return { ...this.props };
  }
}
