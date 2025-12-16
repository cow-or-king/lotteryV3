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
} from '@/components/reviews';
import { ReviewsHeader } from '@/components/reviews/ReviewsHeader';
import { ReviewsContent } from '@/components/reviews/ReviewsContent';
import { useGoogleApiConfig, useReviewResponse, useReviews } from '@/hooks/reviews';
import { useReviewsPage } from '@/hooks/reviews/useReviewsPage';
import React from 'react';

export default function ReviewsPage() {
  const pageState = useReviewsPage();
  const {
    selectedStoreId,
    setSelectedStoreId,
    stores,
    storesLoading,
    selectedStore,
    hasApiKey,
    isSingleStoreWithoutApi,
    toast,
  } = pageState;

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

  // Affichage conditionnel simplifié
  const showHeader = !isSingleStoreWithoutApi;
  const showFilters = !isSingleStoreWithoutApi;
  const showNoApiMessage = selectedStoreId && !hasApiKey;
  const showContent = selectedStoreId && hasApiKey;
  const showNoStores = !storesLoading && (!stores || stores.length === 0);

  return (
    <div>
      {showHeader && <ReviewsHeader />}

      {showFilters && (
        <ReviewFilters
          stores={stores}
          storesLoading={storesLoading}
          selectedStoreId={selectedStoreId}
          onStoreChange={setSelectedStoreId}
          onSync={handleSync}
          syncLoading={syncMutation.isPending}
        />
      )}

      {showNoApiMessage && (
        <NoApiConfigMessage
          onConfigureClick={() =>
            googleApiConfig.openModal(selectedStore?.googlePlaceId || undefined)
          }
        />
      )}

      {showContent && stats && (
        <ReviewsContent
          stats={stats}
          reviews={reviewsData?.reviews}
          onRespond={reviewResponseHook.openResponseModal}
        />
      )}

      {showNoStores && <NoStoresMessage />}

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
