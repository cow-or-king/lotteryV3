/**
 * PricingPlan Entity - Représente un plan de tarification
 * RÈGLES:
 * - Un pricing plan a un nom unique (slug)
 * - Un pricing plan peut avoir un prix mensuel et/ou annuel
 * - Un pricing plan peut être actif ou inactif
 * - Un pricing plan peut être marqué comme populaire
 * - Un pricing plan a des features associées
 */

import { Result } from '@/lib/types/result.type';
import { PricingPlanId, PricingFeatureId } from '@/lib/types/branded.type';
import {
  validateName,
  validateNameUpdate,
  validateSlug,
  validateSlugUpdate,
  validateDescription,
  validateDescriptionUpdate,
  validatePrice,
  validatePriceUpdate,
  validateCurrency,
  validateCurrencyUpdate,
  validateDisplayOrder,
  validateDisplayOrderUpdate,
  validateCtaText,
  validateCtaTextUpdate,
  validateCtaHref,
  validateCtaHrefUpdate,
  validateBadgeText,
  validateBadgeTextUpdate,
} from './pricing-plan/pricing-plan.validators';
import type {
  PricingFeature,
  UpdatePricingFeatureProps,
} from './pricing-plan/pricing-feature.value-object';

// Domain Errors
export class InvalidPricingPlanDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPricingPlanDataError';
  }
}

export class PricingPlanOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PricingPlanOperationError';
  }
}

// Re-export for backward compatibility
export type {
  PricingFeature,
  UpdatePricingFeatureProps,
} from './pricing-plan/pricing-feature.value-object';

// Value Objects
export interface CreatePricingPlanProps {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly monthlyPrice?: number;
  readonly annualPrice?: number;
  readonly currency?: string;
  readonly isActive?: boolean;
  readonly isPopular?: boolean;
  readonly displayOrder?: number;
  readonly ctaText?: string;
  readonly ctaHref?: string;
  readonly badgeText?: string;
}

export interface PricingPlanProps {
  readonly id: PricingPlanId;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly monthlyPrice: number | null;
  readonly annualPrice: number | null;
  readonly currency: string;
  readonly isActive: boolean;
  readonly isPopular: boolean;
  readonly displayOrder: number;
  readonly ctaText: string;
  readonly ctaHref: string;
  readonly badgeText: string | null;
  readonly features: ReadonlyArray<PricingFeature>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UpdatePricingPlanProps {
  name?: string;
  slug?: string;
  description?: string;
  monthlyPrice?: number | null;
  annualPrice?: number | null;
  currency?: string;
  isActive?: boolean;
  isPopular?: boolean;
  displayOrder?: number;
  ctaText?: string;
  ctaHref?: string;
  badgeText?: string | null;
}

// Helper function to build updated props
function buildUpdatedProps(
  currentProps: PricingPlanProps,
  updates: UpdatePricingPlanProps,
): PricingPlanProps {
  return {
    ...currentProps,
    name: updates.name !== undefined ? updates.name : currentProps.name,
    slug: updates.slug !== undefined ? updates.slug : currentProps.slug,
    description: updates.description !== undefined ? updates.description : currentProps.description,
    monthlyPrice:
      updates.monthlyPrice !== undefined ? updates.monthlyPrice : currentProps.monthlyPrice,
    annualPrice: updates.annualPrice !== undefined ? updates.annualPrice : currentProps.annualPrice,
    currency: updates.currency !== undefined ? updates.currency : currentProps.currency,
    isActive: updates.isActive !== undefined ? updates.isActive : currentProps.isActive,
    isPopular: updates.isPopular !== undefined ? updates.isPopular : currentProps.isPopular,
    displayOrder:
      updates.displayOrder !== undefined ? updates.displayOrder : currentProps.displayOrder,
    ctaText: updates.ctaText !== undefined ? updates.ctaText : currentProps.ctaText,
    ctaHref: updates.ctaHref !== undefined ? updates.ctaHref : currentProps.ctaHref,
    badgeText: updates.badgeText !== undefined ? updates.badgeText : currentProps.badgeText,
    updatedAt: new Date(),
  };
}

/**
 * PricingPlan Entity
 */
export class PricingPlanEntity {
  private constructor(private props: PricingPlanProps) {}

  // Factory Methods
  static create(props: CreatePricingPlanProps): Result<PricingPlanEntity> {
    // Validate name
    const nameResult = validateName(props.name);
    if (!nameResult.success) {
      return Result.fail(nameResult.error);
    }

    // Validate slug
    const slugResult = validateSlug(props.slug);
    if (!slugResult.success) {
      return Result.fail(slugResult.error);
    }

    // Validate description
    const descriptionResult = validateDescription(props.description);
    if (!descriptionResult.success) {
      return Result.fail(descriptionResult.error);
    }

    // Validate monthly price
    const monthlyPriceResult = validatePrice(props.monthlyPrice);
    if (!monthlyPriceResult.success) {
      return Result.fail(monthlyPriceResult.error);
    }

    // Validate annual price
    const annualPriceResult = validatePrice(props.annualPrice);
    if (!annualPriceResult.success) {
      return Result.fail(annualPriceResult.error);
    }

    // Validate currency
    const currencyResult = validateCurrency(props.currency);
    if (!currencyResult.success) {
      return Result.fail(currencyResult.error);
    }

    // Validate display order
    const displayOrderResult = validateDisplayOrder(props.displayOrder);
    if (!displayOrderResult.success) {
      return Result.fail(displayOrderResult.error);
    }

    // Validate CTA text
    const ctaTextResult = validateCtaText(props.ctaText);
    if (!ctaTextResult.success) {
      return Result.fail(ctaTextResult.error);
    }

    // Validate CTA href
    const ctaHrefResult = validateCtaHref(props.ctaHref);
    if (!ctaHrefResult.success) {
      return Result.fail(ctaHrefResult.error);
    }

    // Validate badge text
    const badgeTextResult = validateBadgeText(props.badgeText);
    if (!badgeTextResult.success) {
      return Result.fail(badgeTextResult.error);
    }

    const now = new Date();
    const pricingPlanId = this.generatePricingPlanId();

    const pricingPlan = new PricingPlanEntity({
      id: pricingPlanId,
      name: nameResult.data,
      slug: slugResult.data,
      description: descriptionResult.data,
      monthlyPrice: monthlyPriceResult.data,
      annualPrice: annualPriceResult.data,
      currency: currencyResult.data,
      isActive: props.isActive ?? true,
      isPopular: props.isPopular ?? false,
      displayOrder: displayOrderResult.data,
      ctaText: ctaTextResult.data,
      ctaHref: ctaHrefResult.data,
      badgeText: badgeTextResult.data,
      features: [],
      createdAt: now,
      updatedAt: now,
    });

    return Result.ok(pricingPlan);
  }

  static fromPersistence(props: PricingPlanProps): PricingPlanEntity {
    return new PricingPlanEntity(props);
  }

  // Getters
  get id(): PricingPlanId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get description(): string {
    return this.props.description;
  }

  get monthlyPrice(): number | null {
    return this.props.monthlyPrice;
  }

  get annualPrice(): number | null {
    return this.props.annualPrice;
  }

  get currency(): string {
    return this.props.currency;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get isPopular(): boolean {
    return this.props.isPopular;
  }

  get displayOrder(): number {
    return this.props.displayOrder;
  }

  get ctaText(): string {
    return this.props.ctaText;
  }

  get ctaHref(): string {
    return this.props.ctaHref;
  }

  get badgeText(): string | null {
    return this.props.badgeText;
  }

  get features(): ReadonlyArray<PricingFeature> {
    return this.props.features;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Logic
  update(updates: UpdatePricingPlanProps): Result<PricingPlanEntity> {
    const validatedUpdates: UpdatePricingPlanProps = {};

    // Validate name if provided
    if (updates.name !== undefined) {
      const nameResult = validateNameUpdate(updates.name);
      if (!nameResult.success) {
        return nameResult;
      }
      validatedUpdates.name = nameResult.data;
    }

    // Validate slug if provided
    if (updates.slug !== undefined) {
      const slugResult = validateSlugUpdate(updates.slug);
      if (!slugResult.success) {
        return slugResult;
      }
      validatedUpdates.slug = slugResult.data;
    }

    // Validate description if provided
    if (updates.description !== undefined) {
      const descriptionResult = validateDescriptionUpdate(updates.description);
      if (!descriptionResult.success) {
        return descriptionResult;
      }
      validatedUpdates.description = descriptionResult.data;
    }

    // Validate monthly price if provided
    if (updates.monthlyPrice !== undefined) {
      const monthlyPriceResult = validatePriceUpdate(updates.monthlyPrice);
      if (!monthlyPriceResult.success) {
        return monthlyPriceResult;
      }
      validatedUpdates.monthlyPrice = monthlyPriceResult.data;
    }

    // Validate annual price if provided
    if (updates.annualPrice !== undefined) {
      const annualPriceResult = validatePriceUpdate(updates.annualPrice);
      if (!annualPriceResult.success) {
        return annualPriceResult;
      }
      validatedUpdates.annualPrice = annualPriceResult.data;
    }

    // Validate currency if provided
    if (updates.currency !== undefined) {
      const currencyResult = validateCurrencyUpdate(updates.currency);
      if (!currencyResult.success) {
        return currencyResult;
      }
      validatedUpdates.currency = currencyResult.data;
    }

    // Validate display order if provided
    if (updates.displayOrder !== undefined) {
      const displayOrderResult = validateDisplayOrderUpdate(updates.displayOrder);
      if (!displayOrderResult.success) {
        return displayOrderResult;
      }
      validatedUpdates.displayOrder = displayOrderResult.data;
    }

    // Validate CTA text if provided
    if (updates.ctaText !== undefined) {
      const ctaTextResult = validateCtaTextUpdate(updates.ctaText);
      if (!ctaTextResult.success) {
        return ctaTextResult;
      }
      validatedUpdates.ctaText = ctaTextResult.data;
    }

    // Validate CTA href if provided
    if (updates.ctaHref !== undefined) {
      const ctaHrefResult = validateCtaHrefUpdate(updates.ctaHref);
      if (!ctaHrefResult.success) {
        return ctaHrefResult;
      }
      validatedUpdates.ctaHref = ctaHrefResult.data;
    }

    // Validate badge text if provided
    if (updates.badgeText !== undefined) {
      const badgeTextResult = validateBadgeTextUpdate(updates.badgeText);
      if (!badgeTextResult.success) {
        return badgeTextResult;
      }
      validatedUpdates.badgeText = badgeTextResult.data;
    }

    // Pass through boolean flags without validation
    if (updates.isActive !== undefined) {
      validatedUpdates.isActive = updates.isActive;
    }

    if (updates.isPopular !== undefined) {
      validatedUpdates.isPopular = updates.isPopular;
    }

    const updatedProps = buildUpdatedProps(this.props, validatedUpdates);
    const updatedPricingPlan = new PricingPlanEntity(updatedProps);

    return Result.ok(updatedPricingPlan);
  }

  addFeature(feature: PricingFeature): Result<PricingPlanEntity> {
    // Check if feature already exists
    const featureExists = this.props.features.some((f) => f.id === feature.id);
    if (featureExists) {
      return Result.fail(
        new PricingPlanOperationError('Feature already exists in this pricing plan'),
      );
    }

    const updatedPricingPlan = new PricingPlanEntity({
      ...this.props,
      features: [...this.props.features, feature],
      updatedAt: new Date(),
    });

    return Result.ok(updatedPricingPlan);
  }

  removeFeature(featureId: PricingFeatureId): Result<PricingPlanEntity> {
    const featureExists = this.props.features.some((f) => f.id === featureId);
    if (!featureExists) {
      return Result.fail(
        new PricingPlanOperationError('Feature does not exist in this pricing plan'),
      );
    }

    const updatedFeatures = this.props.features.filter((f) => f.id !== featureId);

    const updatedPricingPlan = new PricingPlanEntity({
      ...this.props,
      features: updatedFeatures,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPricingPlan);
  }

  updateFeature(
    featureId: PricingFeatureId,
    updates: UpdatePricingFeatureProps,
  ): Result<PricingPlanEntity> {
    const featureIndex = this.props.features.findIndex((f) => f.id === featureId);
    if (featureIndex === -1) {
      return Result.fail(
        new PricingPlanOperationError('Feature does not exist in this pricing plan'),
      );
    }

    const currentFeature = this.props.features[featureIndex]!;
    const updatedFeature: PricingFeature = {
      id: currentFeature.id,
      text: updates.text !== undefined ? updates.text : currentFeature.text,
      isIncluded: updates.isIncluded !== undefined ? updates.isIncluded : currentFeature.isIncluded,
      isEmphasized:
        updates.isEmphasized !== undefined ? updates.isEmphasized : currentFeature.isEmphasized,
      displayOrder:
        updates.displayOrder !== undefined ? updates.displayOrder : currentFeature.displayOrder,
    };

    const updatedFeatures = [...this.props.features];
    updatedFeatures[featureIndex] = updatedFeature;

    const updatedPricingPlan = new PricingPlanEntity({
      ...this.props,
      features: updatedFeatures,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPricingPlan);
  }

  activate(): Result<PricingPlanEntity> {
    if (this.props.isActive) {
      return Result.fail(new PricingPlanOperationError('Pricing plan is already active'));
    }

    const updatedPricingPlan = new PricingPlanEntity({
      ...this.props,
      isActive: true,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPricingPlan);
  }

  deactivate(): Result<PricingPlanEntity> {
    if (!this.props.isActive) {
      return Result.fail(new PricingPlanOperationError('Pricing plan is already inactive'));
    }

    const updatedPricingPlan = new PricingPlanEntity({
      ...this.props,
      isActive: false,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPricingPlan);
  }

  markAsPopular(): Result<PricingPlanEntity> {
    if (this.props.isPopular) {
      return Result.fail(
        new PricingPlanOperationError('Pricing plan is already marked as popular'),
      );
    }

    const updatedPricingPlan = new PricingPlanEntity({
      ...this.props,
      isPopular: true,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPricingPlan);
  }

  unmarkAsPopular(): Result<PricingPlanEntity> {
    if (!this.props.isPopular) {
      return Result.fail(new PricingPlanOperationError('Pricing plan is not marked as popular'));
    }

    const updatedPricingPlan = new PricingPlanEntity({
      ...this.props,
      isPopular: false,
      updatedAt: new Date(),
    });

    return Result.ok(updatedPricingPlan);
  }

  hasMonthlyPrice(): boolean {
    return this.props.monthlyPrice !== null && this.props.monthlyPrice > 0;
  }

  hasAnnualPrice(): boolean {
    return this.props.annualPrice !== null && this.props.annualPrice > 0;
  }

  hasBothPrices(): boolean {
    return this.hasMonthlyPrice() && this.hasAnnualPrice();
  }

  calculateAnnualSavings(): number | null {
    if (!this.hasBothPrices()) {
      return null;
    }

    const monthlyYearlyCost = this.props.monthlyPrice! * 12;
    const annualCost = this.props.annualPrice!;

    return monthlyYearlyCost - annualCost;
  }

  calculateAnnualSavingsPercentage(): number | null {
    if (!this.hasBothPrices()) {
      return null;
    }

    const savings = this.calculateAnnualSavings();
    if (savings === null) {
      return null;
    }

    const monthlyYearlyCost = this.props.monthlyPrice! * 12;
    return (savings / monthlyYearlyCost) * 100;
  }

  private static generatePricingPlanId(): PricingPlanId {
    return `pricing_plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as PricingPlanId;
  }

  // Serialization
  toPersistence(): PricingPlanProps {
    return { ...this.props };
  }
}
