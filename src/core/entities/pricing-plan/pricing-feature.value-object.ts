/**
 * PricingFeature Value Object
 * Represents a feature associated with a pricing plan
 * IMPORTANT: ZERO any types
 */

import { PricingFeatureId } from '@/lib/types/branded.type';

/**
 * PricingFeature - Represents a single feature within a pricing plan
 */
export interface PricingFeature {
  readonly id: PricingFeatureId;
  readonly text: string;
  readonly isIncluded: boolean;
  readonly isEmphasized: boolean;
  readonly displayOrder: number;
}

/**
 * Props for updating an existing pricing feature
 */
export interface UpdatePricingFeatureProps {
  text?: string;
  isIncluded?: boolean;
  isEmphasized?: boolean;
  displayOrder?: number;
}
