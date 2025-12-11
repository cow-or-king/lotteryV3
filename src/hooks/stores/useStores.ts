'use client';

import { api } from '@/lib/trpc/client';
import { useState } from 'react';
import type { EditingStore, StoreFormData, StoreFormErrors } from '@/lib/types/store-form.types';
import { useStoreMutations } from './mutations/useStoreMutations';
import { validateStoreForm } from './utils/storeValidation';
import { useStoreEffects } from './effects/useStoreEffects';

export function useStores() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState<EditingStore | null>(null);

  const [formData, setFormData] = useState<StoreFormData>({
    brandName: '',
    logoUrl: '',
    name: '',
    googleBusinessUrl: '',
    googlePlaceId: '',
    googleApiKey: '',
  });
  const [errors, setErrors] = useState<StoreFormErrors>({});

  // Queries
  const { data: stores, isLoading } = api.store.list.useQuery();

  // Mutations
  const { createStore, deleteStore, updateStore } = useStoreMutations({
    onCreateSuccess: () => {
      setFormData({
        brandName: '',
        logoUrl: '',
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

  // Effects
  useStoreEffects({
    selectedBrand,
    isNewBrand,
    setFormData,
    setShowCreateForm,
    setOpenMenuId,
  });

  const handleDeleteStore = (storeId: string, storeName: string) => {
    // eslint-disable-next-line no-undef
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le commerce "${storeName}" ?`)) {
      deleteStore.mutate({ id: storeId });
    }
  };

  const handleUpdateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    updateStore.mutate({
      id: editingStore.id,
      name: editingStore.name,
      googleBusinessUrl: editingStore.googleBusinessUrl,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateStoreForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (selectedBrandId && !isNewBrand) {
      createStore.mutate({
        brandId: selectedBrandId,
        name: formData.name,
        googleBusinessUrl: formData.googleBusinessUrl,
        googlePlaceId: formData.googlePlaceId.trim() || undefined,
      });
    } else {
      createStore.mutate({
        brandName: formData.brandName,
        name: formData.name,
        logoUrl: formData.logoUrl,
        googleBusinessUrl: formData.googleBusinessUrl,
        googlePlaceId: formData.googlePlaceId.trim() || undefined,
      });
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setFormData({
      brandName: '',
      logoUrl: '',
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
  };
}
