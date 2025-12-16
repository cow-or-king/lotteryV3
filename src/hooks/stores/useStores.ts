'use client';

import { api } from '@/lib/trpc/client';
import { useState, useMemo } from 'react';
import type { EditingStore, StoreFormData, StoreFormErrors } from '@/lib/types/store-form.types';
import { useStoreMutations } from './mutations/useStoreMutations';
import { validateStoreForm } from './utils/storeValidation';
import { useStoreEffects } from './effects/useStoreEffects';
import { useConfirm } from '@/hooks/ui/useConfirm';

export function useStores() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState<EditingStore | null>(null);

  const [formData, setFormData] = useState<StoreFormData>({
    brandName: '',
    logoUrl: '',
    logoFile: null,
    logoPreviewUrl: null,
    name: '',
    googleBusinessUrl: '',
    googlePlaceId: '',
    googleApiKey: '',
  });
  const [errors, setErrors] = useState<StoreFormErrors>({});

  // Hook de confirmation
  const { ConfirmDialogProps, confirm } = useConfirm();

  // Queries
  const { data: stores, isLoading } = api.store.list.useQuery();

  // Mutations
  const { createStore, deleteStore, updateStore } = useStoreMutations({
    onCreateSuccess: () => {
      // Clean up preview URL before reset
      if (formData.logoPreviewUrl) {
        URL.revokeObjectURL(formData.logoPreviewUrl);
      }
      setFormData({
        brandName: '',
        logoUrl: '',
        logoFile: null,
        logoPreviewUrl: null,
        name: '',
        googleBusinessUrl: '',
        googlePlaceId: '',
        googleApiKey: '',
      });
      setErrors({});
      setShowCreateForm(false);
      setIsNewBrand(false);
      setSelectedBrandId(null);
    },
    onDeleteSuccess: () => {
      setOpenMenuId(null);
    },
    onUpdateSuccess: () => {
      setEditingStore(null);
    },
  });

  // Récupérer l'enseigne sélectionnée pour pré-remplir
  const selectedBrand = selectedBrandId
    ? stores?.find((s) => s.brandId === selectedBrandId)
    : stores && stores.length > 0
      ? stores[0]
      : null;

  // Mémoriser l'objet selectedBrand pour éviter les re-renders inutiles
  const memoizedSelectedBrand = useMemo(
    () =>
      selectedBrand
        ? {
            brandName: selectedBrand.brandName,
            logoUrl: selectedBrand.logoUrl ?? '',
          }
        : null,
    [selectedBrand],
  );

  // Effects
  useStoreEffects({
    selectedBrand: memoizedSelectedBrand,
    isNewBrand,
    setFormData,
    setShowCreateForm,
    setOpenMenuId,
  });

  const handleDeleteStore = async (storeId: string, storeName: string) => {
    const confirmed = await confirm({
      title: 'Supprimer le commerce',
      message: `Êtes-vous sûr de vouloir supprimer le commerce "${storeName}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger',
    });

    if (confirmed) {
      deleteStore.mutate({ id: storeId });
    }
  };

  const handleUpdateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) {
      return;
    }

    updateStore.mutate({
      id: editingStore.id,
      name: editingStore.name,
      googleBusinessUrl: editingStore.googleBusinessUrl,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateStoreForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Convertir logoFile en base64 si présent
    let logoFileData: string | undefined;
    let logoFileName: string | undefined;
    let logoFileType: string | undefined;

    if (formData.logoFile) {
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(formData.logoFile!);
        });
        logoFileData = await base64Promise;
        logoFileName = formData.logoFile.name;
        logoFileType = formData.logoFile.type;
      } catch (error) {
        console.error('Erreur conversion base64:', error);
      }
    }

    if (selectedBrandId && !isNewBrand) {
      createStore.mutate({
        brandId: selectedBrandId,
        name: formData.name,
        googleBusinessUrl: formData.googleBusinessUrl,
        googlePlaceId: formData.googlePlaceId.trim() || undefined,
        logoFileData,
        logoFileName,
        logoFileType,
      });
    } else {
      createStore.mutate({
        brandName: formData.brandName,
        name: formData.name,
        logoUrl: formData.logoUrl,
        googleBusinessUrl: formData.googleBusinessUrl,
        googlePlaceId: formData.googlePlaceId.trim() || undefined,
        logoFileData,
        logoFileName,
        logoFileType,
      });
    }
  };

  const resetForm = () => {
    // Clean up preview URL before reset
    if (formData.logoPreviewUrl) {
      URL.revokeObjectURL(formData.logoPreviewUrl);
    }
    setShowCreateForm(false);
    setFormData({
      brandName: '',
      logoUrl: '',
      logoFile: null,
      logoPreviewUrl: null,
      name: '',
      googleBusinessUrl: '',
      googlePlaceId: '',
      googleApiKey: '',
    });
    setErrors({});
    setIsNewBrand(false);
    setSelectedBrandId(null);
  };

  return {
    // State
    stores,
    isLoading,
    showCreateForm,
    setShowCreateForm,
    isNewBrand,
    setIsNewBrand,
    selectedBrandId,
    setSelectedBrandId,
    selectedBrand,
    openMenuId,
    setOpenMenuId,
    editingStore,
    setEditingStore,
    formData,
    setFormData,
    errors,
    setErrors,

    // Mutations
    createStore,
    deleteStore,
    updateStore,

    // Handlers
    handleDeleteStore,
    handleUpdateStore,
    handleSubmit,
    resetForm,

    // Confirm Dialog
    ConfirmDialogProps,
  };
}
