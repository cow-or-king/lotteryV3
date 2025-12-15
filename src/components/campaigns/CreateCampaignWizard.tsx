/**
 * Campaign Creation Wizard
 * Wizard multi-étapes pour créer une campagne
 * IMPORTANT: ZERO any types
 */

'use client';

import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Calendar, Gift, Gamepad2, Clock, Users } from 'lucide-react';
import { useStores } from '@/hooks/stores';
import { api } from '@/lib/trpc/client';
import { useCreateCampaign, useGameSuggestion } from '@/hooks/campaigns';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PrizeConfig {
  prizeSetId: string;
  quantity: number;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function CreateCampaignWizard({ isOpen, onClose }: WizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form data
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [prizeClaimExpiryDays, setPrizeClaimExpiryDays] = useState(30);
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null);

  // Hooks
  const { stores, isLoading: isLoadingStores } = useStores();
  const { data: prizeSets, isLoading: isLoadingPrizeSets } = api.prizeSet.list.useQuery();
  const { data: availableGames, isLoading: isLoadingGames } = api.game.list.useQuery();
  const { suggestGame, isLoading: isSuggesting, data: gameSuggestion } = useGameSuggestion();
  const { createCampaign, isCreating } = useCreateCampaign();

  // Game selection mode
  const [gameSelectionMode, setGameSelectionMode] = useState<'auto' | 'manual'>('auto');

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

  const handleNext = async () => {
    if (currentStep === 3 && prizes.length > 0 && !gameId) {
      // Calculer le nombre total de gains dans tous les lots sélectionnés
      const totalPrizesCount = prizes.reduce((total, prize) => {
        const prizeSet = prizeSets?.find((ps) => ps.id === prize.prizeSetId);
        const itemsCount = prizeSet?.items?.length || 0;
        return total + itemsCount * prize.quantity;
      }, 0);

      // Récupérer les noms des prix pour la configuration du jeu
      const prizeNames: string[] = [];
      for (const prizeConfig of prizes) {
        const prizeSet = prizeSets?.find((ps) => ps.id === prizeConfig.prizeSetId);
        if (prizeSet && prizeSet.items) {
          for (const item of prizeSet.items) {
            if (item.prizeTemplate) {
              prizeNames.push(item.prizeTemplate.name);
            }
          }
        }
      }

      // Auto-suggest game based on total prize count and create it
      try {
        const result = await suggestGame({
          numberOfPrizes: totalPrizesCount,
          prizeNames,
        });
        if (result && result.gameId) {
          setGameId(result.gameId);
        }
      } catch (error) {
        console.error('Error suggesting game:', error);
      }
    }

    if (currentStep < 6) {
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

          // Calculate quantity based on set quantity and item quantity
          // If item quantity is 0, it means unlimited
          const itemQuantity =
            item.quantity === 0
              ? 999999 // Unlimited represented as a very large number
              : item.quantity * prizeConfig.quantity;

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
        isActive,
        gameId: gameId || undefined,
        prizeClaimExpiryDays,
        maxParticipants: maxParticipants || undefined,
        prizes: transformedPrizes,
      });

      // Reset and close
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
    setIsActive(false);
    setPrizes([]);
    setGameId(null);
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

  const addPrize = () => {
    setPrizes([...prizes, { prizeSetId: '', quantity: 1 }]);
  };

  const updatePrize = (index: number, field: keyof PrizeConfig, value: string | number) => {
    const updated = [...prizes];
    const item = updated[index];
    if (!item) return;

    if (field === 'quantity') {
      item[field] = Number(value);
    } else {
      item[field] = value as string;
    }
    setPrizes(updated);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Si plusieurs enseignes, vérifier que l'enseigne est sélectionnée
        const brandValid = brands.length <= 1 || selectedBrandId;
        return brandValid && storeId && name && name.length >= 2;
      case 2:
        // Toujours valide, status est optionnel
        return true;
      case 3:
        // Vérifier qu'il y a au moins un lot (prize set) avec quantité
        return prizes.length > 0 && prizes.every((p) => p.prizeSetId && p.quantity > 0);
      case 4:
        // Auto mode: pas besoin de gameId, la suggestion se fera plus tard
        // Manual mode: il faut un gameId sélectionné
        return gameSelectionMode === 'auto' || gameId !== null;
      case 5:
        return prizeClaimExpiryDays > 0;
      case 6:
        // Validation finale avant création
        const brandValidFinal = brands.length <= 1 || selectedBrandId;
        return (
          brandValidFinal &&
          storeId &&
          name &&
          name.length >= 2 &&
          prizes.length > 0 &&
          prizes.every((p) => p.prizeSetId && p.quantity > 0) &&
          prizeClaimExpiryDays > 0
        );
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nouvelle Campagne</h2>
            <p className="text-sm text-gray-500">Étape {currentStep} sur 6</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
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
                      setStoreId(''); // Reset store selection when brand changes
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
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
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
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

          {/* Step 2: Status */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Statut de la campagne</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Gestion de l&apos;activation de votre campagne
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <p className="text-sm text-blue-800">
                  ℹ️ Votre campagne sera créée en mode <strong>inactif</strong> par défaut.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Vous pourrez l&apos;activer depuis la liste des campagnes une fois la création
                  terminée.
                </p>
                <p className="text-xs text-blue-600 mt-3">
                  Note: Une seule campagne peut être active par commerce à la fois.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Prizes */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Gift className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Configuration des lots</h3>
                <p className="text-sm text-gray-500">
                  Sélectionnez un lot (ensemble de gains avec probabilités pré-définies)
                </p>
              </div>

              {prizes.map((prize, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <select
                      value={prize.prizeSetId}
                      onChange={(e) => updatePrize(index, 'prizeSetId', e.target.value)}
                      className="w-full rounded-md border-gray-300 text-sm text-gray-900"
                      disabled={isLoadingPrizeSets}
                    >
                      <option value="">Sélectionnez un lot</option>
                      {prizeSets?.map((prizeSet) => {
                        const itemsCount = prizeSet.items?.length || 0;
                        return (
                          <option key={prizeSet.id} value={prizeSet.id}>
                            {prizeSet.name} ({itemsCount} gain{itemsCount > 1 ? 's' : ''})
                          </option>
                        );
                      })}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={prize.quantity}
                      onChange={(e) => updatePrize(index, 'quantity', e.target.value)}
                      className="w-full rounded-md border-gray-300 text-sm text-gray-900"
                      placeholder="Quantité totale disponible"
                    />
                  </div>
                  <button
                    onClick={() => removePrize(index)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={addPrize}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600"
              >
                + Ajouter un lot
              </button>
            </div>
          )}

          {/* Step 4: Game Selection */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Gamepad2 className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Type de jeu</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Choisissez comment sélectionner le jeu pour votre campagne
                </p>
              </div>

              {/* Mode selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setGameSelectionMode('auto')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    gameSelectionMode === 'auto'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-semibold text-gray-900">Suggestion auto</div>
                    <div className="text-xs text-gray-500 mt-1">Adapté au nombre de gains</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGameSelectionMode('manual')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    gameSelectionMode === 'manual'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎮</div>
                    <div className="font-semibold text-gray-900">Choix manuel</div>
                    <div className="text-xs text-gray-500 mt-1">Sélectionner un jeu existant</div>
                  </div>
                </button>
              </div>

              {/* Auto mode */}
              {gameSelectionMode === 'auto' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  {gameSuggestion ? (
                    <div>
                      <p className="text-sm text-purple-900 font-medium mb-2">
                        ✓ Jeu suggéré automatiquement
                      </p>
                      <p className="text-xs text-purple-700">
                        {gameSuggestion.name} - {gameSuggestion.reason}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-purple-900">
                      {isSuggesting
                        ? 'Suggestion en cours...'
                        : "Jeu suggéré disponible à l'étape suivante"}
                    </p>
                  )}
                </div>
              )}

              {/* Manual mode */}
              {gameSelectionMode === 'manual' && (
                <div className="space-y-3">
                  {isLoadingGames ? (
                    <div className="text-center py-4">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-purple-600 border-r-transparent"></div>
                      <p className="text-sm text-gray-500 mt-2">Chargement des jeux...</p>
                    </div>
                  ) : availableGames && availableGames.length > 0 ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sélectionnez un jeu *
                      </label>
                      <select
                        value={gameId || ''}
                        onChange={(e) => setGameId(e.target.value || null)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                      >
                        <option value="">-- Choisir un jeu --</option>
                        {availableGames.map((game) => (
                          <option key={game.id} value={game.id}>
                            {game.name} ({game.type})
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Gamepad2 className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Aucun jeu disponible. Créez d'abord un jeu ou utilisez la suggestion
                        automatique.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Prize Claim Expiry */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Clock className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Expiration des gains</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de jours pour récupérer un gain *
                </label>
                <input
                  type="number"
                  min="1"
                  value={prizeClaimExpiryDays}
                  onChange={(e) => setPrizeClaimExpiryDays(Number(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Les participants auront {prizeClaimExpiryDays} jours pour récupérer leur gain
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Max Participants */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Limite de participants</h3>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={maxParticipants !== null}
                    onChange={(e) => setMaxParticipants(e.target.checked ? 100 : null)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
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

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  ℹ️ Une fois créée, cette campagne sera automatiquement associée au QR code par
                  défaut de votre commerce.
                </p>
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

          {currentStep < 6 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSuggesting}
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
