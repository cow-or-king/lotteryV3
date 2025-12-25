/**
 * Campaign Creation Wizard V2 - Refactored
 * Wizard multi-étapes pour créer une campagne
 * IMPORTANT: ZERO any types
 */

'use client';

import { X } from 'lucide-react';
import { useStores } from '@/hooks/stores';
import { api } from '@/lib/trpc/client';
import WizardProgress from './wizard/shared/WizardProgress';
import WizardNavigation from './wizard/shared/WizardNavigation';
import Step1BasicInfo from './wizard/Step1BasicInfo';
import Step2ConditionSelection from './wizard/Step2ConditionSelection';
import Step2PrizeSelection from './wizard/Step2PrizeSelection';
import Step3GameSelection from './wizard/Step3GameSelection';
import Step4Settings from './wizard/Step4Settings';
import { useWizardFormState } from '@/hooks/campaigns/useWizardFormState';
import { useWizardBrands } from '@/hooks/campaigns/useWizardBrands';
import { useWizardValidation } from '@/hooks/campaigns/useWizardValidation';
import { useCampaignSubmit } from '@/hooks/campaigns/useCampaignSubmit';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCampaignWizard({ isOpen, onClose }: WizardProps) {
  // Data fetching hooks
  const { stores, isLoading: isLoadingStores } = useStores();
  const { data: prizeSets, isLoading: isLoadingPrizeSets } = api.prizeSet.list.useQuery();
  const { data: templates } = api.campaign.listGameTemplates.useQuery();
  const { data: customGames, isLoading: isLoadingGames } = api.game.list.useQuery();

  // Form state management
  const formState = useWizardFormState({ stores });
  const { brands } = useWizardBrands({
    stores,
    selectedBrandId: formState.selectedBrandId,
    onBrandChange: formState.handleBrandChange,
  });

  // Validation
  const { canProceed } = useWizardValidation({
    currentStep: formState.currentStep,
    brands,
    selectedBrandId: formState.selectedBrandId,
    storeId: formState.storeId,
    name: formState.name,
    prizes: formState.prizes,
    gameSelectionMode: formState.gameSelectionMode,
    selectedTemplateId: formState.selectedTemplateId,
    selectedGameId: formState.selectedGameId,
    prizeClaimExpiryDays: formState.prizeClaimExpiryDays,
  });

  // Submission
  const { handleSubmit, isCreating } = useCampaignSubmit({
    storeId: formState.storeId,
    name: formState.name,
    description: formState.description,
    conditions: formState.conditions,
    prizes: formState.prizes,
    selectedTemplateId: formState.selectedTemplateId,
    selectedGameId: formState.selectedGameId,
    prizeClaimExpiryDays: formState.prizeClaimExpiryDays,
    maxParticipants: formState.maxParticipants,
    minDaysBetweenPlays: formState.minDaysBetweenPlays,
    prizeSets,
    stores,
    onSuccess: handleClose,
  });

  function handleClose() {
    formState.resetForm();
    onClose();
  }

  if (!isOpen) {
    return null;
  }

  const renderStep = () => {
    const selectedStore = stores?.find((s) => s.id === formState.storeId);

    switch (formState.currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            brands={brands}
            stores={stores || []}
            selectedBrandId={formState.selectedBrandId}
            storeId={formState.storeId}
            name={formState.name}
            description={formState.description}
            onBrandChange={formState.handleBrandChange}
            onStoreChange={formState.setStoreId}
            onNameChange={formState.setName}
            onDescriptionChange={formState.setDescription}
            isLoadingStores={isLoadingStores}
          />
        );
      case 2:
        return (
          <Step2ConditionSelection
            conditions={formState.conditions}
            onConditionsChange={formState.setConditions}
            googleBusinessUrl={selectedStore?.googleBusinessUrl}
          />
        );
      case 3:
        return (
          <Step2PrizeSelection
            prizeSets={prizeSets}
            selectedPrizes={formState.prizes}
            onAddPrize={formState.handleAddPrize}
            onRemovePrize={formState.handleRemovePrize}
            onUpdateQuantity={formState.handleUpdatePrizeQuantity}
            isLoadingPrizeSets={isLoadingPrizeSets}
          />
        );
      case 4:
        return (
          <Step3GameSelection
            templates={templates}
            customGames={customGames}
            selectedTemplateId={formState.selectedTemplateId}
            selectedGameId={formState.selectedGameId}
            gameSelectionMode={formState.gameSelectionMode}
            onTemplateSelect={formState.setSelectedTemplateId}
            onGameSelect={formState.setSelectedGameId}
            onModeChange={formState.handleGameModeChange}
            isLoadingGames={isLoadingGames}
          />
        );
      case 5:
        return (
          <Step4Settings
            prizeClaimExpiryDays={formState.prizeClaimExpiryDays}
            maxParticipants={formState.maxParticipants}
            minDaysBetweenPlays={formState.minDaysBetweenPlays}
            onExpiryChange={formState.setPrizeClaimExpiryDays}
            onMaxParticipantsChange={formState.setMaxParticipants}
            onMinDaysBetweenPlaysChange={formState.setMinDaysBetweenPlays}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nouvelle Campagne</h2>
            <p className="text-sm text-gray-500">Étape {formState.currentStep} sur 5</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress */}
        <WizardProgress currentStep={formState.currentStep} totalSteps={5} />

        {/* Content */}
        <div className="px-6 py-6">{renderStep()}</div>

        {/* Footer */}
        <WizardNavigation
          currentStep={formState.currentStep}
          canProceed={canProceed()}
          onPrevious={formState.handleBack}
          onNext={formState.handleNext}
          onCreate={handleSubmit}
          isCreating={isCreating}
        />
      </div>
    </div>
  );
}
