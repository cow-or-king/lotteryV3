/**
 * Hook to validate wizard steps
 */
import type { WizardStep, PrizeConfig } from './useWizardFormState';

interface UseWizardValidationProps {
  currentStep: WizardStep;
  brands: Array<{ id: string; name: string }>;
  selectedBrandId: string;
  storeId: string;
  name: string;
  prizes: PrizeConfig[];
  gameSelectionMode: 'template' | 'custom';
  selectedTemplateId: string | null;
  selectedGameId: string | null;
  prizeClaimExpiryDays: number;
}

export function useWizardValidation({
  currentStep,
  brands,
  selectedBrandId,
  storeId,
  name,
  prizes,
  gameSelectionMode,
  selectedTemplateId,
  selectedGameId,
  prizeClaimExpiryDays,
}: UseWizardValidationProps) {
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1: {
        const brandValid = brands.length <= 1 || selectedBrandId;
        return !!(brandValid && storeId && name && name.length >= 2);
      }
      case 2:
        return true; // Google Review will be added automatically if not present
      case 3:
        return prizes.length > 0 && prizes.every((p) => p.prizeSetId && p.quantity > 0);
      case 4:
        return (
          (gameSelectionMode === 'template' && selectedTemplateId !== null) ||
          (gameSelectionMode === 'custom' && selectedGameId !== null)
        );
      case 5:
        return prizeClaimExpiryDays > 0;
      default:
        return false;
    }
  };

  return {
    canProceed,
  };
}
