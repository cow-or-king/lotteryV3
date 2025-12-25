/**
 * Hook to manage wizard form state
 */
import { useState, useEffect } from 'react';
import type { ConditionType } from '@/generated/prisma';
import { CONDITION_TYPE_METADATA } from '@/types/condition.types';

export interface PrizeConfig {
  prizeSetId: string;
  quantity: number;
}

export interface ConditionItem {
  id: string;
  type: ConditionType;
  title: string;
  description: string;
  iconEmoji: string;
  config: Record<string, string | number | boolean> | null;
  enablesGame?: boolean;
}

export type WizardStep = 1 | 2 | 3 | 4 | 5;

interface UseWizardFormStateProps {
  stores?: Array<{ id: string; googleBusinessUrl: string | null }>;
}

export function useWizardFormState({ stores }: UseWizardFormStateProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [googleReviewInitialized, setGoogleReviewInitialized] = useState(false);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gameSelectionMode, setGameSelectionMode] = useState<'template' | 'custom'>('template');
  const [prizeClaimExpiryDays, setPrizeClaimExpiryDays] = useState(30);
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null);
  const [minDaysBetweenPlays, setMinDaysBetweenPlays] = useState<number | null>(null);

  // Initialize Google Review condition when store is selected
  useEffect(() => {
    if (storeId && !googleReviewInitialized && stores) {
      const selectedStore = stores.find((s) => s.id === storeId);

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
        setConditions([googleCondition]);
        setGoogleReviewInitialized(true);
      }
    }
  }, [storeId, stores, googleReviewInitialized]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
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

  const resetForm = () => {
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
  };

  return {
    // State
    currentStep,
    selectedBrandId,
    storeId,
    name,
    description,
    conditions,
    prizes,
    selectedTemplateId,
    selectedGameId,
    gameSelectionMode,
    prizeClaimExpiryDays,
    maxParticipants,
    minDaysBetweenPlays,

    // Setters
    setCurrentStep,
    setSelectedBrandId,
    setStoreId,
    setName,
    setDescription,
    setConditions,
    setPrizes,
    setSelectedTemplateId,
    setSelectedGameId,
    setGameSelectionMode,
    setPrizeClaimExpiryDays,
    setMaxParticipants,
    setMinDaysBetweenPlays,

    // Handlers
    handleNext,
    handleBack,
    handleBrandChange,
    handleAddPrize,
    handleRemovePrize,
    handleUpdatePrizeQuantity,
    handleGameModeChange,
    resetForm,
  };
}
