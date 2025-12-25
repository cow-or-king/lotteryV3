/**
 * Subscription Plan Value Object Tests
 * IMPORTANT: ZERO any types
 */

import { describe, it, expect } from 'vitest';
import { SubscriptionPlan } from '../subscription-plan.value-object';

describe('SubscriptionPlan', () => {
  describe('canUpgradeTo', () => {
    it('should allow upgrade from FREE to STARTER', () => {
      const plan = SubscriptionPlan.from('FREE');
      expect(plan.canUpgradeTo('STARTER')).toBe(true);
    });

    it('should allow upgrade from FREE to PROFESSIONAL', () => {
      const plan = SubscriptionPlan.from('FREE');
      expect(plan.canUpgradeTo('PROFESSIONAL')).toBe(true);
    });

    it('should allow upgrade from STARTER to PROFESSIONAL', () => {
      const plan = SubscriptionPlan.from('STARTER');
      expect(plan.canUpgradeTo('PROFESSIONAL')).toBe(true);
    });

    it('should allow upgrade from PROFESSIONAL to ENTERPRISE', () => {
      const plan = SubscriptionPlan.from('PROFESSIONAL');
      expect(plan.canUpgradeTo('ENTERPRISE')).toBe(true);
    });

    it('should not allow upgrade to same plan', () => {
      const plan = SubscriptionPlan.from('STARTER');
      expect(plan.canUpgradeTo('STARTER')).toBe(false);
    });

    it('should not allow upgrade to lower plan', () => {
      const plan = SubscriptionPlan.from('PROFESSIONAL');
      expect(plan.canUpgradeTo('STARTER')).toBe(false);
    });

    it('should not allow upgrade from ENTERPRISE', () => {
      const plan = SubscriptionPlan.from('ENTERPRISE');
      expect(plan.canUpgradeTo('FREE')).toBe(false);
      expect(plan.canUpgradeTo('STARTER')).toBe(false);
      expect(plan.canUpgradeTo('PROFESSIONAL')).toBe(false);
    });
  });

  describe('canDowngradeTo', () => {
    it('should allow downgrade from ENTERPRISE to PROFESSIONAL', () => {
      const plan = SubscriptionPlan.from('ENTERPRISE');
      expect(plan.canDowngradeTo('PROFESSIONAL')).toBe(true);
    });

    it('should allow downgrade from PROFESSIONAL to STARTER', () => {
      const plan = SubscriptionPlan.from('PROFESSIONAL');
      expect(plan.canDowngradeTo('STARTER')).toBe(true);
    });

    it('should allow downgrade from STARTER to FREE', () => {
      const plan = SubscriptionPlan.from('STARTER');
      expect(plan.canDowngradeTo('FREE')).toBe(true);
    });

    it('should not allow downgrade to same plan', () => {
      const plan = SubscriptionPlan.from('STARTER');
      expect(plan.canDowngradeTo('STARTER')).toBe(false);
    });

    it('should not allow downgrade to higher plan', () => {
      const plan = SubscriptionPlan.from('STARTER');
      expect(plan.canDowngradeTo('PROFESSIONAL')).toBe(false);
    });

    it('should not allow downgrade from FREE', () => {
      const plan = SubscriptionPlan.from('FREE');
      expect(plan.canDowngradeTo('STARTER')).toBe(false);
      expect(plan.canDowngradeTo('PROFESSIONAL')).toBe(false);
      expect(plan.canDowngradeTo('ENTERPRISE')).toBe(false);
    });
  });

  describe('getHierarchyLevel', () => {
    it('should return correct hierarchy levels', () => {
      expect(SubscriptionPlan.from('FREE').getHierarchyLevel()).toBe(0);
      expect(SubscriptionPlan.from('STARTER').getHierarchyLevel()).toBe(1);
      expect(SubscriptionPlan.from('PROFESSIONAL').getHierarchyLevel()).toBe(2);
      expect(SubscriptionPlan.from('ENTERPRISE').getHierarchyLevel()).toBe(3);
    });
  });

  describe('equals', () => {
    it('should return true for same plan', () => {
      const plan1 = SubscriptionPlan.from('STARTER');
      const plan2 = SubscriptionPlan.from('STARTER');
      expect(plan1.equals(plan2)).toBe(true);
    });

    it('should return false for different plans', () => {
      const plan1 = SubscriptionPlan.from('STARTER');
      const plan2 = SubscriptionPlan.from('PROFESSIONAL');
      expect(plan1.equals(plan2)).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the correct plan value', () => {
      const plan = SubscriptionPlan.from('PROFESSIONAL');
      expect(plan.getValue()).toBe('PROFESSIONAL');
    });
  });
});
