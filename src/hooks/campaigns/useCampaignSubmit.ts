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

type TransformedPrize = {
  name: string;
  description?: string;
  value?: number;
  color: string;
  probability: number;
  quantity: number;
};

type PrizeSet = {
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
};

/**
 * Calculate the item quantity with infinite quantity handling
 */
function calculateItemQuantity(itemQuantity: number, prizeQuantity: number): number {
  return itemQuantity === 0 ? 999999 : itemQuantity * prizeQuantity;
}

/**
 * Transform a single prize set item into a prize configuration
 */
function transformPrizeItem(
  item: PrizeSet['items'][number],
  prizeQuantity: number,
): TransformedPrize | null {
  if (!item.prizeTemplate) {
    return null;
  }

  const itemQuantity = calculateItemQuantity(item.quantity, prizeQuantity);

  return {
    name: item.prizeTemplate.name,
    description: item.prizeTemplate.description || undefined,
    value: item.prizeTemplate.minPrice || undefined,
    color: item.prizeTemplate.color,
    probability: item.probability,
    quantity: itemQuantity,
  };
}

/**
 * Transform prize set items into individual prize configurations
 */
function transformPrizeSetItems(
  prizeConfig: PrizeConfig,
  prizeSets: PrizeSet[] | undefined,
): TransformedPrize[] {
  const prizeSet = prizeSets?.find((ps) => ps.id === prizeConfig.prizeSetId);
  if (!prizeSet?.items) {
    return [];
  }

  const transformedItems: TransformedPrize[] = [];
  for (const item of prizeSet.items) {
    const transformedItem = transformPrizeItem(item, prizeConfig.quantity);
    if (transformedItem) {
      transformedItems.push(transformedItem);
    }
  }

  return transformedItems;
}

/**
 * Transform all prize configurations into individual prizes
 */
function transformPrizes(
  prizes: PrizeConfig[],
  prizeSets: PrizeSet[] | undefined,
): TransformedPrize[] {
  const transformedPrizes: TransformedPrize[] = [];

  for (const prizeConfig of prizes) {
    const items = transformPrizeSetItems(prizeConfig, prizeSets);
    transformedPrizes.push(...items);
  }

  return transformedPrizes;
}

/**
 * Create a Google Review condition
 */
function createGoogleReviewCondition(googleBusinessUrl: string): ConditionItem {
  const metadata = CONDITION_TYPE_METADATA.GOOGLE_REVIEW;
  return {
    id: crypto.randomUUID(),
    type: 'GOOGLE_REVIEW',
    title: metadata.label,
    description: metadata.description,
    iconEmoji: metadata.defaultIcon,
    config: {
      googleReviewUrl: googleBusinessUrl,
      waitTimeSeconds: 20,
    },
    enablesGame: true,
  };
}

/**
 * Check if conditions include Google Review
 */
function hasGoogleReviewCondition(conditions: ConditionItem[]): boolean {
  return conditions.some((c) => c.type === 'GOOGLE_REVIEW');
}

/**
 * Get Google Business URL for a store
 */
function getStoreGoogleUrl(
  storeId: string,
  stores: Array<{ id: string; googleBusinessUrl: string | null }> | undefined,
): string | null {
  const selectedStore = stores?.find((s) => s.id === storeId);
  return selectedStore?.googleBusinessUrl || null;
}

/**
 * Ensure Google Review condition is present as first condition
 */
function ensureGoogleReviewCondition(
  conditions: ConditionItem[],
  storeId: string,
  stores: Array<{ id: string; googleBusinessUrl: string | null }> | undefined,
): ConditionItem[] {
  if (hasGoogleReviewCondition(conditions)) {
    return [...conditions];
  }

  const googleBusinessUrl = getStoreGoogleUrl(storeId, stores);
  if (!googleBusinessUrl) {
    return [...conditions];
  }

  const googleCondition = createGoogleReviewCondition(googleBusinessUrl);
  return [googleCondition, ...conditions];
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
      const transformedPrizes = transformPrizes(prizes, prizeSets);
      const finalConditions = ensureGoogleReviewCondition(conditions, storeId, stores);

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
