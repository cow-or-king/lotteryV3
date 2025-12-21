/**
 * Condition Renderer Component
 * Composant qui affiche dynamiquement la condition appropriée selon son type
 * IMPORTANT: ZERO any types
 */

'use client';

import type { CampaignConditionData } from '@/types/condition.types';
import { GoogleReviewCondition } from './GoogleReviewCondition';
import { InstagramFollowCondition } from './InstagramFollowCondition';
import { TikTokFollowCondition } from './TikTokFollowCondition';
import { NewsletterCondition } from './NewsletterCondition';
import { LoyaltyProgramCondition } from './LoyaltyProgramCondition';
import { CustomRedirectCondition } from './CustomRedirectCondition';

interface ConditionRendererProps {
  condition: CampaignConditionData;
  onConditionComplete: () => void;
  totalConditions: number;
  currentConditionIndex: number;
}

export function ConditionRenderer({
  condition,
  onConditionComplete,
  totalConditions,
  currentConditionIndex,
}: ConditionRendererProps) {
  // Calculer la progression
  const progressPercentage = ((currentConditionIndex + 1) / (totalConditions + 1)) * 100;

  // Render le bon composant selon le type
  switch (condition.type) {
    case 'GOOGLE_REVIEW':
      return (
        <GoogleReviewCondition
          condition={condition}
          onComplete={onConditionComplete}
          progressPercentage={progressPercentage}
          currentStep={currentConditionIndex + 1}
          totalSteps={totalConditions + 1}
        />
      );

    case 'INSTAGRAM_FOLLOW':
      return (
        <InstagramFollowCondition
          condition={condition}
          onComplete={onConditionComplete}
          progressPercentage={progressPercentage}
          currentStep={currentConditionIndex + 1}
          totalSteps={totalConditions + 1}
        />
      );

    case 'TIKTOK_FOLLOW':
      return (
        <TikTokFollowCondition
          condition={condition}
          onComplete={onConditionComplete}
          progressPercentage={progressPercentage}
          currentStep={currentConditionIndex + 1}
          totalSteps={totalConditions + 1}
        />
      );

    case 'NEWSLETTER':
      return (
        <NewsletterCondition
          condition={condition}
          onComplete={onConditionComplete}
          progressPercentage={progressPercentage}
          currentStep={currentConditionIndex + 1}
          totalSteps={totalConditions + 1}
        />
      );

    case 'LOYALTY_PROGRAM':
      return (
        <LoyaltyProgramCondition
          condition={condition}
          onComplete={onConditionComplete}
          progressPercentage={progressPercentage}
          currentStep={currentConditionIndex + 1}
          totalSteps={totalConditions + 1}
        />
      );

    case 'CUSTOM_REDIRECT':
      return (
        <CustomRedirectCondition
          condition={condition}
          onComplete={onConditionComplete}
          progressPercentage={progressPercentage}
          currentStep={currentConditionIndex + 1}
          totalSteps={totalConditions + 1}
        />
      );

    case 'GAME':
      // Le type GAME ne devrait pas être affiché comme condition
      // C'est géré automatiquement après la complétion d'une condition avec enablesGame=true
      return null;

    default:
      // Type exhaustiveness check - TypeScript will error if we miss a case
      return null;
  }
}
