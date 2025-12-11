/**
 * Reviews Page
 * Page de gestion des avis Google
 * IMPORTANT: Route protégée par le middleware
 */

'use client';

import {
  GoogleApiConfigModal,
  NoApiConfigMessage,
  NoStoresMessage,
  ResponseModal,
  ReviewFilters,
  ReviewList,
  ReviewStatsCards,
} from '@/components/reviews';
import { AIServiceBadge } from '@/components/ui/AIServiceBadge';
import { useGoogleApiConfig, useReviewResponse, useReviews } from '@/hooks/reviews';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import React, { useState } from 'react';

export default function ReviewsPage() {
  const { toast } = useToast();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Récupérer la liste des stores
  const { data: stores, isLoading: storesLoading } = api.store.list.useQuery();

  // Hooks personnalisés
  const { stats, reviewsData, syncMutation } = useReviews({ storeId: selectedStoreId });
  const googleApiConfig = useGoogleApiConfig();
  const reviewResponseHook = useReviewResponse();

  // Gestion de la synchronisation
  const handleSync = () => {
    if (!selectedStoreId) {
      toast({
        title: 'Aucun commerce sélectionné',
        description: 'Veuillez sélectionner un commerce pour synchroniser ses avis',
        variant: 'error',
      });
      return;
    }

    syncMutation.mutate(
      { storeId: selectedStoreId },
      {
        onSuccess: (data) => {
          toast({
            title: 'Synchronisation réussie',
            description: `${data.synchronized} avis synchronisés avec succès`,
          });
        },
        onError: (error) => {
          toast({
            title: 'Erreur de synchronisation',
            description: error.message,
            variant: 'error',
          });
        },
      },
    );
  };

  // Gestion de la soumission du formulaire API
  const handleApiConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStoreId) {
      toast({
        title: 'Erreur',
        description: 'Aucun commerce sélectionné',
        variant: 'error',
      });
      return;
    }

    googleApiConfig.validateAndSubmit(selectedStoreId);
  };

  // Sélectionner automatiquement le premier store si disponible
  React.useEffect(() => {
    if (stores && stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0]?.id ?? null);
    }
  }, [stores, selectedStoreId]);

  // Trouver le store sélectionné pour vérifier l'API key
  const selectedStore = stores?.find((s) => s.id === selectedStoreId);

  // Vérifier que le commerce a un Place ID ET une API Key configurée
  const hasApiKey =
    selectedStore?.googlePlaceId &&
    selectedStore.googlePlaceId.trim().length > 0 &&
    selectedStore?.googleApiKeyStatus === 'configured';

  // Compter les commerces sans API configurée
  const storesWithoutApi =
    stores?.filter(
      (s) =>
        !s.googlePlaceId || s.googlePlaceId.length === 0 || s.googleApiKeyStatus !== 'configured',
    ) || [];
  const isSingleStoreWithoutApi = stores && stores.length === 1 && storesWithoutApi.length === 1;

  return (
    <div>
      {/* Header */}
      {!isSingleStoreWithoutApi && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-800">Avis Google</h1>
              <AIServiceBadge />
            </div>
            <p className="text-gray-600">Gérez et répondez aux avis de vos clients</p>
          </div>
        </div>
      )}

      {/* Sélecteur de Store + Bouton Sync - masqué si un seul commerce sans API */}
      {!isSingleStoreWithoutApi && (
        <ReviewFilters
          stores={stores}
          storesLoading={storesLoading}
          selectedStoreId={selectedStoreId}
          onStoreChange={setSelectedStoreId}
          onSync={handleSync}
          syncLoading={syncMutation.isPending}
        />
      )}

      {/* Message si pas d'API Key configurée */}
      {selectedStoreId && !hasApiKey && (
        <NoApiConfigMessage
          onConfigureClick={() =>
            googleApiConfig.openModal(selectedStore?.googlePlaceId || undefined)
          }
        />
      )}

      {/* Statistiques - Sticky on scroll */}
      {selectedStoreId && hasApiKey && (
        <div className="sticky z-10 bg-linear-to-br from-purple-50/95 via-pink-50/95 to-blue-50/95 backdrop-blur-lg pt-4 pb-2 -mx-6 px-6">
          <ReviewStatsCards stats={stats} />
        </div>
      )}

      {/* Liste des avis */}
      {selectedStoreId && hasApiKey && (
        <div
          className="bg-white/50 backdrop-blur-xl border border-purple-600/20 rounded-2xl p-6 overflow-auto"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Liste des avis</h2>
          <ReviewList
            reviews={reviewsData?.reviews}
            onRespond={reviewResponseHook.openResponseModal}
          />
        </div>
      )}

      {/* Message si aucun store */}
      {!storesLoading && (!stores || stores.length === 0) && <NoStoresMessage />}

      {/* Modal: Configuration API Google */}
      <GoogleApiConfigModal
        isOpen={googleApiConfig.isOpen}
        onClose={googleApiConfig.closeModal}
        store={
          selectedStore
            ? {
                id: selectedStore.id,
                name: selectedStore.name,
                googlePlaceId: selectedStore.googlePlaceId || undefined,
              }
            : null
        }
        formData={googleApiConfig.formData}
        formErrors={googleApiConfig.formErrors}
        onFormDataChange={googleApiConfig.setFormData}
        onSubmit={handleApiConfigSubmit}
        isSubmitting={googleApiConfig.isSubmitting}
      />

      {/* Modal: Réponse aux avis avec IA */}
      <ResponseModal
        isOpen={reviewResponseHook.isModalOpen}
        onClose={reviewResponseHook.closeResponseModal}
        review={reviewResponseHook.selectedReview}
        responseContent={reviewResponseHook.responseContent}
        responseStars={reviewResponseHook.responseStars}
        onResponseContentChange={reviewResponseHook.setResponseContent}
        onResponseStarsChange={reviewResponseHook.setResponseStars}
        selectedTone={reviewResponseHook.selectedTone}
        onToneChange={reviewResponseHook.setSelectedTone}
        aiSuggestion={reviewResponseHook.aiSuggestion}
        aiServiceAvailable={reviewResponseHook.aiServiceAvailable}
        onGenerateAi={reviewResponseHook.generateAiSuggestion}
        onUseAiSuggestion={reviewResponseHook.useAiSuggestion}
        onSubmit={reviewResponseHook.submitResponse}
        isSubmitting={reviewResponseHook.isSubmitting}
        isGeneratingAi={reviewResponseHook.isGeneratingAi}
      />
    </div>
  );
}
