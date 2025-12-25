/**
 * Component to display and complete conditions
 */
import { ConditionRenderer } from '@/components/conditions/ConditionRenderer';
import type { CampaignConditionData } from '@/types/condition.types';
import type { ConditionType } from '@/generated/prisma';

interface ConditionsStepProps {
  currentCondition: {
    id: string;
    type: ConditionType;
    order: number;
    title: string;
    description: string | null;
    redirectUrl: string | null;
    iconEmoji: string | null;
    config: unknown;
    isRequired: boolean;
    createdAt: string;
    updatedAt: string;
    campaignId: string;
  };
  totalConditions: number;
  onConditionComplete: () => void;
}

export function ConditionsStep({
  currentCondition,
  totalConditions,
  onConditionComplete,
}: ConditionsStepProps) {
  const typedCondition: CampaignConditionData = {
    id: currentCondition.id,
    campaignId: currentCondition.campaignId,
    type: currentCondition.type,
    order: currentCondition.order,
    title: currentCondition.title,
    description: currentCondition.description,
    redirectUrl: currentCondition.redirectUrl,
    iconEmoji: currentCondition.iconEmoji,
    config: currentCondition.config as unknown as
      | import('@/types/condition.types').ConditionConfig
      | null,
    isRequired: currentCondition.isRequired,
    createdAt: new Date(currentCondition.createdAt),
    updatedAt: new Date(currentCondition.updatedAt),
  };

  return (
    <ConditionRenderer
      condition={typedCondition}
      onConditionComplete={onConditionComplete}
      totalConditions={totalConditions}
      currentConditionIndex={currentCondition.order}
    />
  );
}
