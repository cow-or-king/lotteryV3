/**
 * Branded Types pour la type-safety des IDs
 * Empêche la confusion entre différents types d'IDs
 */

import type { Result } from './result.type';

declare const __brand: unique symbol;

export type Brand<K, T> = T & { [__brand]: K };

// User Types
export type UserId = Brand<'UserId', string>;
export type Email = Brand<'Email', string>;
export type Password = Brand<'Password', string>;

// Store Types
export type StoreId = Brand<'StoreId', string>;
export type StoreName = Brand<'StoreName', string>;
export type GooglePlaceId = Brand<'GooglePlaceId', string>;

// Campaign Types
export type CampaignId = Brand<'CampaignId', string>;
export type ClaimCode = Brand<'ClaimCode', string>;

// Prize Types
export type PrizeId = Brand<'PrizeId', string>;
export type PrizePoolId = Brand<'PrizePoolId', string>;
export type PrizeTemplateId = Brand<'PrizeTemplateId', string>;
export type PrizeSetId = Brand<'PrizeSetId', string>;
export type PrizeSetItemId = Brand<'PrizeSetItemId', string>;

// Brand Types
export type BrandId = Brand<'BrandId', string>;

// Subscription Types
export type SubscriptionId = Brand<'SubscriptionId', string>;
export type CustomerId = Brand<'CustomerId', string>;
export type PaymentMethodId = Brand<'PaymentMethodId', string>;

// Review Types
export type ReviewId = Brand<'ReviewId', string>;
export type ReviewToken = Brand<'ReviewToken', string>;

// Helpers
export const BrandedTypes = {
  userId: (id: string): UserId => id as UserId,
  email: (email: string): Email => email as Email,
  password: (password: string): Password => password as Password,
  storeId: (id: string): StoreId => id as StoreId,
  storeName: (name: string): StoreName => name as StoreName,
  googlePlaceId: (id: string): GooglePlaceId => id as GooglePlaceId,
  campaignId: (id: string): CampaignId => id as CampaignId,
  claimCode: (code: string): ClaimCode => code as ClaimCode,
  prizeId: (id: string): PrizeId => id as PrizeId,
  prizePoolId: (id: string): PrizePoolId => id as PrizePoolId,
  prizeTemplateId: (id: string): PrizeTemplateId => id as PrizeTemplateId,
  prizeSetId: (id: string): PrizeSetId => id as PrizeSetId,
  prizeSetItemId: (id: string): PrizeSetItemId => id as PrizeSetItemId,
  brandId: (id: string): BrandId => id as BrandId,
  subscriptionId: (id: string): SubscriptionId => id as SubscriptionId,
  customerId: (id: string): CustomerId => id as CustomerId,
  paymentMethodId: (id: string): PaymentMethodId => id as PaymentMethodId,
  reviewId: (id: string): ReviewId => id as ReviewId,
  reviewToken: (token: string): ReviewToken => token as ReviewToken,
};

// Validation helpers
export const isValidId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates UUID v4 format (Supabase Auth IDs)
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Branding function for UserId with validation
 * Validates that the ID is a valid UUID v4 (Supabase format)
 * Returns Result<UserId> for safe handling
 *
 * @param id - String to validate and brand as UserId
 * @returns Result<UserId> - Success with branded ID or error with message
 *
 * @example
 * const result = brandUserId('550e8400-e29b-41d4-a716-446655440000');
 * if (result.success) {
 *   const userId: UserId = result.data;
 * } else {
 *   console.error(result.error.message);
 * }
 */
export function brandUserId(id: string): Result<UserId> {
  // Validation 1: Check if string is non-empty
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return {
      success: false,
      error: new Error('UserId cannot be empty'),
    };
  }

  // Validation 2: Check UUID v4 format (Supabase standard)
  if (!isValidUUID(id)) {
    return {
      success: false,
      error: new Error(`Invalid UserId format: expected UUID v4, got "${id}"`),
    };
  }

  // All validations passed - safe to brand
  return {
    success: true,
    data: id as UserId,
  };
}

/**
 * Branding function for StoreId with validation
 * Validates that the ID is a valid UUID v4
 */
export function brandStoreId(id: string): Result<StoreId> {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return {
      success: false,
      error: new Error('StoreId cannot be empty'),
    };
  }

  if (!isValidUUID(id)) {
    return {
      success: false,
      error: new Error(`Invalid StoreId format: expected UUID v4, got "${id}"`),
    };
  }

  return {
    success: true,
    data: id as StoreId,
  };
}

/**
 * Branding function for CampaignId with validation
 * Validates that the ID is a valid UUID v4
 */
export function brandCampaignId(id: string): Result<CampaignId> {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return {
      success: false,
      error: new Error('CampaignId cannot be empty'),
    };
  }

  if (!isValidUUID(id)) {
    return {
      success: false,
      error: new Error(`Invalid CampaignId format: expected UUID v4, got "${id}"`),
    };
  }

  return {
    success: true,
    data: id as CampaignId,
  };
}
