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
  userName: string;
  onConditionComplete: () => void;
  totalConditions: number;
  currentConditionIndex: number;
}

export function ConditionRenderer({
  condition,
  userName,
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
          userName={userName}
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
          userName={userName}
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
          userName={userName}
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
          userName={userName}
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
          userName={userName}
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
          userName={userName}
          onComplete={onConditionComplete}
          progressPercentage={progressPercentage}
          currentStep={currentConditionIndex + 1}
          totalSteps={totalConditions + 1}
        />
      );

    default:
      // Type exhaustiveness check - TypeScript will error if we miss a case
      const _exhaustiveCheck: never = condition.type;
      return null;
  }
}
