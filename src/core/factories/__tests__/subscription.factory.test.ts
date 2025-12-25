/**
 * Subscription Factory Tests
 * IMPORTANT: ZERO any types
 */

import { describe, it, expect } from 'vitest';
import { SubscriptionFactory } from '../subscription.factory';

describe('SubscriptionFactory', () => {
  const mockUserId = 'user_123' as never;

  describe('generateSubscriptionId', () => {
    it('should generate a unique subscription ID', () => {
      const id1 = SubscriptionFactory.generateSubscriptionId();
      const id2 = SubscriptionFactory.generateSubscriptionId();

      expect(id1).toMatch(/^sub_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^sub_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('createFreeProps', () => {
    it('should create FREE subscription props', () => {
      const props = SubscriptionFactory.createFreeProps(mockUserId);

      expect(props.userId).toBe(mockUserId);
      expect(props.plan).toBe('FREE');
      expect(props.status).toBe('ACTIVE');
      expect(props.limits.storesLimit).toBe(1);
      expect(props.limits.campaignsLimit).toBe(1);
      expect(props.billing.stripeCustomerId).toBeNull();
      expect(props.billing.stripeSubscriptionId).toBeNull();
    });
  });

  describe('createStarterProps', () => {
    it('should create STARTER subscription props', () => {
      const currentPeriodEnd = new Date('2025-12-31');
      const props = SubscriptionFactory.createStarterProps(
        mockUserId,
        'cus_123',
        'sub_123',
        currentPeriodEnd,
      );

      expect(props.userId).toBe(mockUserId);
      expect(props.plan).toBe('STARTER');
      expect(props.status).toBe('ACTIVE');
      expect(props.limits.storesLimit).toBe(3);
      expect(props.limits.campaignsLimit).toBe(10);
      expect(props.billing.stripeCustomerId).toBe('cus_123');
      expect(props.billing.stripeSubscriptionId).toBe('sub_123');
      expect(props.billing.currentPeriodEnd).toBe(currentPeriodEnd);
    });
  });

  describe('createProfessionalProps', () => {
    it('should create PROFESSIONAL subscription props', () => {
      const currentPeriodEnd = new Date('2025-12-31');
      const props = SubscriptionFactory.createProfessionalProps(
        mockUserId,
        'cus_456',
        'sub_456',
        currentPeriodEnd,
      );

      expect(props.userId).toBe(mockUserId);
      expect(props.plan).toBe('PROFESSIONAL');
      expect(props.status).toBe('ACTIVE');
      expect(props.limits.storesLimit).toBe(10);
      expect(props.limits.campaignsLimit).toBe(50);
      expect(props.billing.stripeCustomerId).toBe('cus_456');
      expect(props.billing.stripeSubscriptionId).toBe('sub_456');
    });
  });

  describe('createEnterpriseProps', () => {
    it('should create ENTERPRISE subscription props', () => {
      const currentPeriodEnd = new Date('2025-12-31');
      const props = SubscriptionFactory.createEnterpriseProps(
        mockUserId,
        'cus_789',
        'sub_789',
        currentPeriodEnd,
      );

      expect(props.userId).toBe(mockUserId);
      expect(props.plan).toBe('ENTERPRISE');
      expect(props.status).toBe('ACTIVE');
      expect(props.limits.storesLimit).toBe(999999);
      expect(props.limits.campaignsLimit).toBe(999999);
      expect(props.billing.stripeCustomerId).toBe('cus_789');
      expect(props.billing.stripeSubscriptionId).toBe('sub_789');
    });
  });

  describe('props consistency', () => {
    it('should always create props with createdAt and updatedAt', () => {
      const props = SubscriptionFactory.createFreeProps(mockUserId);

      expect(props.createdAt).toBeInstanceOf(Date);
      expect(props.updatedAt).toBeInstanceOf(Date);
      expect(props.createdAt).toEqual(props.updatedAt);
    });

    it('should generate unique IDs for each call', () => {
      const props1 = SubscriptionFactory.createFreeProps(mockUserId);
      const props2 = SubscriptionFactory.createFreeProps(mockUserId);

      expect(props1.id).not.toBe(props2.id);
    });
  });
});
