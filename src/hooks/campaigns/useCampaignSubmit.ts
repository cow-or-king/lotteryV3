/**
 * Hook to handle campaign submission logic
 */
import { useCreateCampaign } from '@/hooks/campaigns';
import { CONDITION_TYPE_METADATA } from '@/types/condition.types';
import type { PrizeConfig, ConditionItem } from './useWizardFormState';

interface UseCampaignSubmitProps {
  storeId: string;
  name: string;
  description: string;
  conditions: ConditionItem[];
  prizes: PrizeConfig[];
  selectedTemplateId: string | null;
  selectedGameId: string | null;
  prizeClaimExpiryDays: number;
  maxParticipants: number | null;
  minDaysBetweenPlays: number | null;
  prizeSets?: Array<{
    id: string;
    items: Array<{
      quantity: number;
      probability: number;
      prizeTemplate: {
        name: string;
        description: string | null;
        minPrice: number | null;
        color: string;
      } | null;
    }>;
  }>;
  stores?: Array<{ id: string; googleBusinessUrl: string | null }>;
  onSuccess: () => void;
}

export function useCampaignSubmit({
  storeId,
  name,
  description,
  conditions,
  prizes,
  selectedTemplateId,
  selectedGameId,
  prizeClaimExpiryDays,
  maxParticipants,
  minDaysBetweenPlays,
  prizeSets,
  stores,
  onSuccess,
}: UseCampaignSubmitProps) {
  const { createCampaign, isCreating } = useCreateCampaign();

  const handleSubmit = async () => {
    try {
      // Transform PrizeSet selections into individual prize configs
      const transformedPrizes: Array<{
        name: string;
        description?: string;
        value?: number;
        color: string;
        probability: number;
        quantity: number;
      }> = [];

      for (const prizeConfig of prizes) {
        const prizeSet = prizeSets?.find((ps) => ps.id === prizeConfig.prizeSetId);
        if (!prizeSet || !prizeSet.items) {
          continue;
        }

        for (const item of prizeSet.items) {
          if (!item.prizeTemplate) {
            continue;
          }

          const itemQuantity = item.quantity === 0 ? 999999 : item.quantity * prizeConfig.quantity;

          transformedPrizes.push({
            name: item.prizeTemplate.name,
            description: item.prizeTemplate.description || undefined,
            value: item.prizeTemplate.minPrice || undefined,
            color: item.prizeTemplate.color,
            probability: item.probability,
            quantity: itemQuantity,
          });
        }
      }

      // Ensure Google Review is always present as first condition
      let finalConditions = [...conditions];
      const hasGoogleReview = finalConditions.some((c) => c.type === 'GOOGLE_REVIEW');

      if (!hasGoogleReview) {
        // Add Google Review as the first condition if not present
        const selectedStore = stores?.find((s) => s.id === storeId);

        if (selectedStore?.googleBusinessUrl) {
          const metadata = CONDITION_TYPE_METADATA.GOOGLE_REVIEW;
          const googleCondition: ConditionItem = {
            id: crypto.randomUUID(),
            type: 'GOOGLE_REVIEW',
            title: metadata.label,
            description: metadata.description,
            iconEmoji: metadata.defaultIcon,
            config: {
              googleReviewUrl: selectedStore.googleBusinessUrl,
              waitTimeSeconds: 20,
            },
            enablesGame: true,
          };
          finalConditions = [googleCondition, ...finalConditions];
        }
      }

      const campaignData = {
        storeId,
        name,
        description: description || undefined,
        isActive: true,
        templateId: selectedTemplateId || undefined,
        gameId: selectedGameId || undefined,
        prizeClaimExpiryDays,
        maxParticipants: maxParticipants || undefined,
        minDaysBetweenPlays: minDaysBetweenPlays || undefined,
        prizes: transformedPrizes,
        conditions: finalConditions,
      };

      await createCampaign(campaignData);

      onSuccess();
    } catch (_error) {
      // Error handling is done by the mutation hook
    }
  };

  return {
    handleSubmit,
    isCreating,
  };
}
