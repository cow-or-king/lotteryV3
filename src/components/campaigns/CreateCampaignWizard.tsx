/**
 * Campaign Creation Wizard V2
 * Wizard multi-étapes pour créer une campagne
 * IMPORTANT: ZERO any types
 *
 * Changements:
 * - Step 2 (Statut) supprimé → toujours créé ACTIF et lié au QR code du commerce
 * - Step 2 (Prizes) → Cartes cliquables au lieu de sélecteurs
 * - Step 3 (Game) → Templates système + jeux personnalisés avec previews
 * - Step 4 (Settings) → Expiration + limite participants fusionnés
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStores } from '@/hooks/stores';
import { api } from '@/lib/trpc/client';
import { useCreateCampaign } from '@/hooks/campaigns';
import WizardProgress from './wizard/shared/WizardProgress';
import WizardNavigation from './wizard/shared/WizardNavigation';
import Step1BasicInfo from './wizard/Step1BasicInfo';
import Step2ConditionSelection from './wizard/Step2ConditionSelection';
import Step2PrizeSelection from './wizard/Step2PrizeSelection';
import Step3GameSelection from './wizard/Step3GameSelection';
import Step4Settings from './wizard/Step4Settings';
import type { ConditionType } from '@/generated/prisma';
import { CONDITION_TYPE_METADATA } from '@/types/condition.types';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PrizeConfig {
  prizeSetId: string;
  quantity: number;
}

interface ConditionItem {
  id: string;
  type: ConditionType;
  title: string;
  description: string;
  iconEmoji: string;
  config: Record<string, string | number | boolean> | null;
  enablesGame?: boolean; // Donne accès au jeu (par défaut true)
}

type Step = 1 | 2 | 3 | 4 | 5;

export default function CreateCampaignWizard({ isOpen, onClose }: WizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form data
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [googleReviewInitialized, setGoogleReviewInitialized] = useState(false);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);

  // Game selection: templateId OU gameId
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gameSelectionMode, setGameSelectionMode] = useState<'template' | 'custom'>('template');

  const [prizeClaimExpiryDays, setPrizeClaimExpiryDays] = useState(30);
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null);
  const [minDaysBetweenPlays, setMinDaysBetweenPlays] = useState<number | null>(null);

  // Hooks
  const { stores, isLoading: isLoadingStores } = useStores();
  const { data: prizeSets, isLoading: isLoadingPrizeSets } = api.prizeSet.list.useQuery();
  const { data: templates } = api.campaign.listGameTemplates.useQuery();
  const { data: customGames, isLoading: isLoadingGames } = api.game.list.useQuery();
  const { createCampaign, isCreating } = useCreateCampaign();

  // Get unique brands from stores (memoized to prevent useEffect issues)
  const brands = React.useMemo(
    () =>
      stores && Array.isArray(stores)
        ? Array.from(
            new Map(
              stores.map((store) => [store.brandId, { id: store.brandId, name: store.brandName }]),
            ).values(),
          )
        : [],
    [stores],
  );

  // Auto-select brand if only one
  React.useEffect(() => {
    if (brands.length === 1 && !selectedBrandId && brands[0]) {
      setSelectedBrandId(brands[0].id);
    }
  }, [brands, selectedBrandId]);

  // Initialize conditions with Google Avis by default when store is selected
  useEffect(() => {
    if (storeId && !googleReviewInitialized && stores) {
      const selectedStore = stores.find((s) => s.id === storeId);
      console.log('🔍 useEffect - Initializing Google Review condition');
      console.log('🔍 storeId:', storeId);
      console.log('🔍 selectedStore:', selectedStore);
      console.log('🔍 googleBusinessUrl:', selectedStore?.googleBusinessUrl);

      if (selectedStore?.googleBusinessUrl) {
        console.log('✅ Adding Google Review condition automatically');
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
          enablesGame: true, // Par défaut, donne accès au jeu
        };
        setConditions([googleCondition]);
        setGoogleReviewInitialized(true);
      } else {
        console.log('❌ No Google Business URL found for store');
      }
    }
  }, [storeId, stores, googleReviewInitialized]);

  if (!isOpen) {
    return null;
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

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

      console.log('📝 hasGoogleReview:', hasGoogleReview);
      console.log('📝 conditions state:', conditions);

      if (!hasGoogleReview) {
        // Add Google Review as the first condition if not present
        const selectedStore = stores?.find((s) => s.id === storeId);
        console.log('📝 selectedStore:', selectedStore);
        console.log('📝 storeId:', storeId);
        console.log('📝 stores:', stores);

        if (selectedStore?.googleBusinessUrl) {
          console.log('📝 Google Business URL found:', selectedStore.googleBusinessUrl);
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
            enablesGame: true, // Par défaut, donne accès au jeu
          };
          finalConditions = [googleCondition, ...finalConditions];
        }
      }

      console.log('📝 Creating campaign with conditions:', finalConditions);
      console.log('📝 finalConditions count:', finalConditions.length);
      console.log('📝 finalConditions details:', JSON.stringify(finalConditions, null, 2));

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

      console.log('📝 Sending campaign data:', JSON.stringify(campaignData, null, 2));
      console.log('📝 Prizes array:', transformedPrizes);
      console.log(
        '📝 Total probability:',
        transformedPrizes.reduce((sum, p) => sum + p.probability, 0),
      );

      await createCampaign(campaignData);

      handleClose();
    } catch (_error) {
      // Error handling is done by the mutation hook
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedBrandId('');
    setStoreId('');
    setName('');
    setDescription('');
    setConditions([]);
    setGoogleReviewInitialized(false);
    setPrizes([]);
    setSelectedTemplateId(null);
    setSelectedGameId(null);
    setGameSelectionMode('template');
    setPrizeClaimExpiryDays(30);
    setMaxParticipants(null);
    setMinDaysBetweenPlays(null);
    onClose();
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    setStoreId('');
    setConditions([]);
    setGoogleReviewInitialized(false);
  };

  const handleAddPrize = (prizeSetId: string) => {
    setPrizes([...prizes, { prizeSetId, quantity: 1 }]);
  };

  const handleRemovePrize = (prizeSetId: string) => {
    setPrizes(prizes.filter((p) => p.prizeSetId !== prizeSetId));
  };

  const handleUpdatePrizeQuantity = (prizeSetId: string, quantity: number) => {
    setPrizes(prizes.map((p) => (p.prizeSetId === prizeSetId ? { ...p, quantity } : p)));
  };

  const handleGameModeChange = (mode: 'template' | 'custom') => {
    setGameSelectionMode(mode);
    if (mode === 'template') {
      setSelectedGameId(null);
    } else {
      setSelectedTemplateId(null);
    }
  };

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

  const renderStep = () => {
    const selectedStore = stores?.find((s) => s.id === storeId);

    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            brands={brands}
            stores={stores || []}
            selectedBrandId={selectedBrandId}
            storeId={storeId}
            name={name}
            description={description}
            onBrandChange={handleBrandChange}
            onStoreChange={setStoreId}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            isLoadingStores={isLoadingStores}
          />
        );
      case 2:
        return (
          <Step2ConditionSelection
            conditions={conditions}
            onConditionsChange={setConditions}
            googleBusinessUrl={selectedStore?.googleBusinessUrl}
          />
        );
      case 3:
        return (
          <Step2PrizeSelection
            prizeSets={prizeSets}
            selectedPrizes={prizes}
            onAddPrize={handleAddPrize}
            onRemovePrize={handleRemovePrize}
            onUpdateQuantity={handleUpdatePrizeQuantity}
            isLoadingPrizeSets={isLoadingPrizeSets}
          />
        );
      case 4:
        return (
          <Step3GameSelection
            templates={templates}
            customGames={customGames}
            selectedTemplateId={selectedTemplateId}
            selectedGameId={selectedGameId}
            gameSelectionMode={gameSelectionMode}
            onTemplateSelect={setSelectedTemplateId}
            onGameSelect={setSelectedGameId}
            onModeChange={handleGameModeChange}
            isLoadingGames={isLoadingGames}
          />
        );
      case 5:
        return (
          <Step4Settings
            prizeClaimExpiryDays={prizeClaimExpiryDays}
            maxParticipants={maxParticipants}
            minDaysBetweenPlays={minDaysBetweenPlays}
            onExpiryChange={setPrizeClaimExpiryDays}
            onMaxParticipantsChange={setMaxParticipants}
            onMinDaysBetweenPlaysChange={setMinDaysBetweenPlays}
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
            <p className="text-sm text-gray-500">Étape {currentStep} sur 5</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress */}
        <WizardProgress currentStep={currentStep} totalSteps={5} />

        {/* Content */}
        <div className="px-6 py-6">{renderStep()}</div>

        {/* Footer */}
        <WizardNavigation
          currentStep={currentStep}
          canProceed={canProceed()}
          onPrevious={handleBack}
          onNext={handleNext}
          onCreate={handleSubmit}
          isCreating={isCreating}
        />
      </div>
    </div>
  );
}
