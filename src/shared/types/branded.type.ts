/**
 * Branded Types pour la type-safety des IDs
 * Empêche la confusion entre différents types d'IDs
 */

declare const __brand: unique symbol;

export type Brand<K, T> = T & { [__brand]: K };

// User Types
export type UserId = Brand<"UserId", string>;
export type Email = Brand<"Email", string>;
export type Password = Brand<"Password", string>;

// Store Types
export type StoreId = Brand<"StoreId", string>;
export type StoreName = Brand<"StoreName", string>;
export type GooglePlaceId = Brand<"GooglePlaceId", string>;

// Campaign Types
export type CampaignId = Brand<"CampaignId", string>;
export type ClaimCode = Brand<"ClaimCode", string>;

// Prize Types
export type PrizeId = Brand<"PrizeId", string>;
export type PrizePoolId = Brand<"PrizePoolId", string>;

// Subscription Types
export type SubscriptionId = Brand<"SubscriptionId", string>;
export type CustomerId = Brand<"CustomerId", string>;
export type PaymentMethodId = Brand<"PaymentMethodId", string>;

// Review Types
export type ReviewId = Brand<"ReviewId", string>;
export type ReviewToken = Brand<"ReviewToken", string>;

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