/**
 * Pricing Plan Validators
 * All validation helper functions for PricingPlanEntity
 * IMPORTANT: ZERO any types
 */

import { Result } from '@/lib/types/result.type';
import { InvalidPricingPlanDataError } from '../pricing-plan.entity';

/**
 * Validates a pricing plan name
 * @param name - The name to validate
 * @returns Result with validated and trimmed name
 */
export function validateName(name: string | undefined): Result<string> {
  if (!name || name.trim().length < 2) {
    return Result.fail(
      new InvalidPricingPlanDataError('Pricing plan name must be at least 2 characters'),
    );
  }

  if (name.length > 100) {
    return Result.fail(
      new InvalidPricingPlanDataError('Pricing plan name must be less than 100 characters'),
    );
  }

  return Result.ok(name.trim());
}

/**
 * Validates a pricing plan name for updates
 * @param name - The name to validate
 * @returns Result with validated and trimmed name
 */
export function validateNameUpdate(name: string): Result<string> {
  return validateName(name);
}

/**
 * Validates a pricing plan slug
 * @param slug - The slug to validate
 * @returns Result with validated and trimmed slug
 */
export function validateSlug(slug: string | undefined): Result<string> {
  if (!slug || slug.trim().length < 2) {
    return Result.fail(
      new InvalidPricingPlanDataError('Pricing plan slug must be at least 2 characters'),
    );
  }

  if (slug.length > 50) {
    return Result.fail(
      new InvalidPricingPlanDataError('Pricing plan slug must be less than 50 characters'),
    );
  }

  // Slug must be lowercase, alphanumeric + hyphens only
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return Result.fail(
      new InvalidPricingPlanDataError(
        'Pricing plan slug must be lowercase, alphanumeric and hyphens only',
      ),
    );
  }

  return Result.ok(slug.trim());
}

/**
 * Validates a pricing plan slug for updates
 * @param slug - The slug to validate
 * @returns Result with validated and trimmed slug
 */
export function validateSlugUpdate(slug: string): Result<string> {
  return validateSlug(slug);
}

/**
 * Validates a pricing plan description
 * @param description - The description to validate
 * @returns Result with validated and trimmed description
 */
export function validateDescription(description: string | undefined): Result<string> {
  if (!description || description.trim().length < 2) {
    return Result.fail(
      new InvalidPricingPlanDataError('Description must be at least 2 characters'),
    );
  }

  if (description.length > 500) {
    return Result.fail(
      new InvalidPricingPlanDataError('Description must be less than 500 characters'),
    );
  }

  return Result.ok(description.trim());
}

/**
 * Validates a pricing plan description for updates
 * @param description - The description to validate
 * @returns Result with validated and trimmed description
 */
export function validateDescriptionUpdate(description: string): Result<string> {
  return validateDescription(description);
}

/**
 * Validates a price value
 * @param price - The price to validate
 * @returns Result with validated price or null
 */
export function validatePrice(price: number | undefined | null): Result<number | null> {
  if (price === undefined || price === null) {
    return Result.ok(null);
  }

  if (price < 0) {
    return Result.fail(new InvalidPricingPlanDataError('Price must be positive or zero'));
  }

  return Result.ok(price);
}

/**
 * Validates a price value for updates
 * @param price - The price to validate
 * @returns Result with validated price or null
 */
export function validatePriceUpdate(price: number | null): Result<number | null> {
  return validatePrice(price);
}

/**
 * Validates a currency code
 * @param currency - The currency code to validate
 * @returns Result with validated currency code
 */
export function validateCurrency(currency: string | undefined): Result<string> {
  const defaultCurrency = 'EUR';
  const curr = currency || defaultCurrency;

  // Currency must be 3 uppercase letters
  const currencyRegex = /^[A-Z]{3}$/;
  if (!currencyRegex.test(curr)) {
    return Result.fail(
      new InvalidPricingPlanDataError('Currency must be 3 uppercase letters (EUR, USD, GBP)'),
    );
  }

  return Result.ok(curr);
}

/**
 * Validates a currency code for updates
 * @param currency - The currency code to validate
 * @returns Result with validated currency code
 */
export function validateCurrencyUpdate(currency: string): Result<string> {
  return validateCurrency(currency);
}

/**
 * Validates a display order value
 * @param displayOrder - The display order to validate
 * @returns Result with validated display order
 */
export function validateDisplayOrder(displayOrder: number | undefined): Result<number> {
  const order = displayOrder ?? 0;

  if (order < 0) {
    return Result.fail(new InvalidPricingPlanDataError('Display order must be positive or zero'));
  }

  return Result.ok(order);
}

/**
 * Validates a display order value for updates
 * @param displayOrder - The display order to validate
 * @returns Result with validated display order
 */
export function validateDisplayOrderUpdate(displayOrder: number): Result<number> {
  if (displayOrder < 0) {
    return Result.fail(new InvalidPricingPlanDataError('Display order must be positive or zero'));
  }

  return Result.ok(displayOrder);
}

/**
 * Validates CTA (Call-to-Action) text
 * @param ctaText - The CTA text to validate
 * @returns Result with validated CTA text
 */
export function validateCtaText(ctaText: string | undefined): Result<string> {
  const text = ctaText || "Commencer l'essai";

  if (text.length > 100) {
    return Result.fail(
      new InvalidPricingPlanDataError('CTA text must be less than 100 characters'),
    );
  }

  return Result.ok(text);
}

/**
 * Validates CTA text for updates
 * @param ctaText - The CTA text to validate
 * @returns Result with validated CTA text
 */
export function validateCtaTextUpdate(ctaText: string): Result<string> {
  return validateCtaText(ctaText);
}

/**
 * Validates CTA (Call-to-Action) href
 * @param ctaHref - The CTA href to validate
 * @returns Result with validated CTA href
 */
export function validateCtaHref(ctaHref: string | undefined): Result<string> {
  const href = ctaHref || '/login';

  if (href.length > 500) {
    return Result.fail(
      new InvalidPricingPlanDataError('CTA href must be less than 500 characters'),
    );
  }

  return Result.ok(href);
}

/**
 * Validates CTA href for updates
 * @param ctaHref - The CTA href to validate
 * @returns Result with validated CTA href
 */
export function validateCtaHrefUpdate(ctaHref: string): Result<string> {
  return validateCtaHref(ctaHref);
}

/**
 * Validates badge text
 * @param badgeText - The badge text to validate
 * @returns Result with validated badge text or null
 */
export function validateBadgeText(badgeText: string | undefined | null): Result<string | null> {
  if (!badgeText) {
    return Result.ok(null);
  }

  if (badgeText.length > 50) {
    return Result.fail(
      new InvalidPricingPlanDataError('Badge text must be less than 50 characters'),
    );
  }

  return Result.ok(badgeText.trim());
}

/**
 * Validates badge text for updates
 * @param badgeText - The badge text to validate
 * @returns Result with validated badge text or null
 */
export function validateBadgeTextUpdate(badgeText: string | null): Result<string | null> {
  return validateBadgeText(badgeText);
}
