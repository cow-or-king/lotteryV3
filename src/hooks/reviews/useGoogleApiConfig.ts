/**
 * Hook pour la configuration Google API
 * Mutation update store, état modal, validation formulaire
 */

'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

interface ApiFormData {
  googlePlaceId: string;
  googleApiKey: string;
}

interface ApiFormErrors {
  googlePlaceId?: string;
  googleApiKey?: string;
}

export function useGoogleApiConfig() {
  const { toast } = useToast();
  const utils = api.useUtils();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ApiFormData>({
    googlePlaceId: '',
    googleApiKey: '',
  });
  const [formErrors, setFormErrors] = useState<ApiFormErrors>({});

  // Mutation pour mettre à jour l'API config du store
  const updateStoreApi = api.store.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Configuration enregistrée',
        description: 'Votre clé API Google a été configurée avec succès',
      });
      setIsOpen(false);
      setFormData({ googlePlaceId: '', googleApiKey: '' });
      setFormErrors({});
      // Rafraîchir les données
      utils.store.list.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Erreur de configuration',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const openModal = (initialPlaceId?: string) => {
    setFormData({
      googlePlaceId: initialPlaceId || '',
      googleApiKey: '',
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setFormData({ googlePlaceId: '', googleApiKey: '' });
    setFormErrors({});
  };

  const validateAndSubmit = (storeId: string) => {
    // Validation
    const newErrors: ApiFormErrors = {};

    if (formData.googlePlaceId.trim() && !formData.googlePlaceId.startsWith('ChIJ')) {
      newErrors.googlePlaceId = 'Le Place ID doit commencer par "ChIJ"';
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    // Mettre à jour le store
    updateStoreApi.mutate({
      id: storeId,
      googlePlaceId: formData.googlePlaceId.trim() || undefined,
      googleApiKey: formData.googleApiKey.trim() || undefined,
    });
  };

  return {
    isOpen,
    formData,
    formErrors,
    setFormData,
    openModal,
    closeModal,
    validateAndSubmit,
    isSubmitting: updateStoreApi.isPending,
  };
}
