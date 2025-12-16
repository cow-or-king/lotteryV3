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

import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Gift, Gamepad2, Clock, Users } from 'lucide-react';
import { useStores } from '@/hooks/stores';
import { api } from '@/lib/trpc/client';
import { useCreateCampaign } from '@/hooks/campaigns';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PrizeConfig {
  prizeSetId: string;
  quantity: number;
}

type Step = 1 | 2 | 3 | 4;

export default function CreateCampaignWizard({ isOpen, onClose }: WizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form data
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);

  // Game selection: templateId OU gameId
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [gameSelectionMode, setGameSelectionMode] = useState<'template' | 'custom'>('template');

  const [prizeClaimExpiryDays, setPrizeClaimExpiryDays] = useState(30);
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null);

  // Hooks
  const { stores, isLoading: isLoadingStores } = useStores();
  const { data: prizeSets, isLoading: isLoadingPrizeSets } = api.prizeSet.list.useQuery();
  const { data: templates } = api.campaign.listGameTemplates.useQuery();
  const { data: customGames, isLoading: isLoadingGames } = api.game.list.useQuery();
  const { createCampaign, isCreating } = useCreateCampaign();

  // Get unique brands from stores
  const brands =
    stores && Array.isArray(stores)
      ? Array.from(
          new Map(
            stores.map((store) => [store.brandId, { id: store.brandId, name: store.brandName }]),
          ).values(),
        )
      : [];

  // Auto-select brand if only one
  React.useEffect(() => {
    if (brands.length === 1 && !selectedBrandId && brands[0]) {
      setSelectedBrandId(brands[0].id);
    }
  }, [brands, selectedBrandId]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 4) {
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
        if (!prizeSet || !prizeSet.items) continue;

        for (const item of prizeSet.items) {
          if (!item.prizeTemplate) continue;

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

      await createCampaign({
        storeId,
        name,
        description: description || undefined,
        isActive: true, // Créé actif par défaut et lié au QR code du commerce
        templateId: selectedTemplateId || undefined,
        gameId: selectedGameId || undefined,
        prizeClaimExpiryDays,
        maxParticipants: maxParticipants || undefined,
        prizes: transformedPrizes,
      });

      handleClose();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedBrandId('');
    setStoreId('');
    setName('');
    setDescription('');
    setPrizes([]);
    setSelectedTemplateId(null);
    setSelectedGameId(null);
    setGameSelectionMode('template');
    setPrizeClaimExpiryDays(30);
    setMaxParticipants(null);
    onClose();
  };

  // Filter stores by selected brand
  const filteredStores = selectedBrandId
    ? stores && Array.isArray(stores)
      ? stores.filter((store) => store.brandId === selectedBrandId)
      : []
    : stores && Array.isArray(stores)
      ? stores
      : [];

  const togglePrizeSet = (prizeSetId: string) => {
    const existing = prizes.find((p) => p.prizeSetId === prizeSetId);
    if (existing) {
      setPrizes(prizes.filter((p) => p.prizeSetId !== prizeSetId));
    } else {
      setPrizes([...prizes, { prizeSetId, quantity: 1 }]);
    }
  };

  const updatePrizeQuantity = (prizeSetId: string, quantity: number) => {
    setPrizes(prizes.map((p) => (p.prizeSetId === prizeSetId ? { ...p, quantity } : p)));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        const brandValid = brands.length <= 1 || selectedBrandId;
        return brandValid && storeId && name && name.length >= 2;
      case 2:
        return prizes.length > 0 && prizes.every((p) => p.prizeSetId && p.quantity > 0);
      case 3:
        return (
          (gameSelectionMode === 'template' && selectedTemplateId !== null) ||
          (gameSelectionMode === 'custom' && selectedGameId !== null)
        );
      case 4:
        return prizeClaimExpiryDays > 0;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nouvelle Campagne</h2>
            <p className="text-sm text-gray-500">Étape {currentStep} sur 4</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full ${
                  step <= currentStep ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step 1: Store & Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {brands.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enseigne *</label>
                  <select
                    value={selectedBrandId}
                    onChange={(e) => {
                      setSelectedBrandId(e.target.value);
                      setStoreId('');
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                    disabled={isLoadingStores}
                  >
                    <option value="">Sélectionnez une enseigne</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commerce *</label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                  disabled={isLoadingStores || (brands.length > 1 && !selectedBrandId)}
                >
                  <option value="">
                    {brands.length > 1 && !selectedBrandId
                      ? "Sélectionnez d'abord une enseigne"
                      : 'Sélectionnez un commerce'}
                  </option>
                  {filteredStores?.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la campagne *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                  placeholder="Ex: Campagne Noël 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                  rows={3}
                  placeholder="Description de la campagne..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Prizes (CARTES CLIQUABLES) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Gift className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Configuration des lots</h3>
                <p className="text-sm text-gray-500">
                  Cliquez sur les cartes pour sélectionner vos lots
                </p>
              </div>

              {isLoadingPrizeSets ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                  <p className="text-sm text-gray-500 mt-2">Chargement des lots...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prizeSets?.map((prizeSet) => {
                    const isSelected = prizes.some((p) => p.prizeSetId === prizeSet.id);
                    const selectedConfig = prizes.find((p) => p.prizeSetId === prizeSet.id);
                    const itemsCount = prizeSet.items?.length || 0;

                    return (
                      <div
                        key={prizeSet.id}
                        onClick={() => togglePrizeSet(prizeSet.id)}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{prizeSet.name}</h4>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 12 12"
                              >
                                <path
                                  d="M10 3L4.5 8.5L2 6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                />
                              </svg>
                            )}
                          </div>
                        </div>

                        {prizeSet.description && (
                          <p className="text-sm text-gray-600 mb-2">{prizeSet.description}</p>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Gift className="h-4 w-4" />
                          <span>
                            {itemsCount} gain{itemsCount > 1 ? 's' : ''}
                          </span>
                        </div>

                        {isSelected && (
                          <div
                            className="mt-3 pt-3 border-t border-purple-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quantité
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={selectedConfig?.quantity || 1}
                              onChange={(e) =>
                                updatePrizeQuantity(prizeSet.id, Number(e.target.value))
                              }
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {prizes.length === 0 && !isLoadingPrizeSets && (
                <p className="text-center text-sm text-gray-500 py-4">
                  Sélectionnez au moins un lot pour continuer
                </p>
              )}
            </div>
          )}

          {/* Step 3: Game Selection (TEMPLATES + CUSTOM) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Gamepad2 className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Type de jeu</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Choisissez un template ou utilisez un jeu personnalisé
                </p>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setGameSelectionMode('template');
                    setSelectedGameId(null);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    gameSelectionMode === 'template'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎨</div>
                    <div className="font-semibold text-gray-900">Templates</div>
                    <div className="text-xs text-gray-500 mt-1">Jeux par défaut</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGameSelectionMode('custom');
                    setSelectedTemplateId(null);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    gameSelectionMode === 'custom'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">✨</div>
                    <div className="font-semibold text-gray-900">Mes jeux</div>
                    <div className="text-xs text-gray-500 mt-1">Jeux personnalisés</div>
                  </div>
                </button>
              </div>

              {/* Template Selection */}
              {gameSelectionMode === 'template' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates?.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        selectedTemplateId === template.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-center">
                        {template.previewImage ? (
                          <img
                            src={template.previewImage}
                            alt={template.name}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                        ) : (
                          <div className="w-full h-32 bg-linear-to-br from-purple-100 to-pink-100 rounded-md mb-3 flex items-center justify-center">
                            <Gamepad2 className="h-12 w-12 text-purple-400" />
                          </div>
                        )}
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {template.name}
                        </h4>
                        <p className="text-xs text-gray-500">{template.description}</p>
                        <div className="mt-2 text-xs text-purple-600 font-medium">
                          {template.minPrizes}-{template.maxPrizes} lots
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Games Selection */}
              {gameSelectionMode === 'custom' && (
                <div>
                  {isLoadingGames ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                      <p className="text-sm text-gray-500 mt-2">Chargement de vos jeux...</p>
                    </div>
                  ) : customGames && customGames.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {customGames.map((game) => (
                        <div
                          key={game.id}
                          onClick={() => setSelectedGameId(game.id)}
                          className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                            selectedGameId === game.id
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-center">
                            <div
                              className="w-full h-32 rounded-md mb-3 flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${game.primaryColor || '#8B5CF6'}, ${game.secondaryColor || '#EC4899'})`,
                              }}
                            >
                              <Gamepad2 className="h-12 w-12 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                              {game.name}
                            </h4>
                            <div className="text-xs text-gray-500">{game.type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Gamepad2 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-2">Aucun jeu personnalisé</p>
                      <p className="text-xs text-gray-500">
                        Créez d'abord un jeu ou utilisez les templates
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Settings (FUSIONNÉ: Expiration + Limite) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Clock className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Paramètres de la campagne</h3>
              </div>

              {/* Expiration des gains */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Expiration des gains *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={prizeClaimExpiryDays}
                  onChange={(e) => setPrizeClaimExpiryDays(Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Les participants auront {prizeClaimExpiryDays} jour
                  {prizeClaimExpiryDays > 1 ? 's' : ''} pour récupérer leur gain
                </p>
              </div>

              {/* Limite de participants */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={maxParticipants !== null}
                    onChange={(e) => setMaxParticipants(e.target.checked ? 100 : null)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    <Users className="inline h-4 w-4 mr-2" />
                    Limiter le nombre de participants
                  </span>
                </label>

                {maxParticipants !== null && (
                  <input
                    type="number"
                    min="1"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                    placeholder="Nombre maximum de participants"
                  />
                )}
              </div>

              {/* Informations importantes */}
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    ℹ️ Votre campagne sera créée en mode <strong>inactif</strong>.
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Activez-la depuis la liste des campagnes pour la rendre publique et l'associer
                    au QR code de votre commerce.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-900">
                    🎯 Une seule campagne peut être active par commerce à la fois.
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    La campagne active sera automatiquement liée au QR code par défaut du commerce.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isCreating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Création...' : 'Créer la campagne'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
