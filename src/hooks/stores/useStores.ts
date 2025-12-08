'use client';

import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EditingStore {
  id: string;
  name: string;
  googleBusinessUrl: string;
}

interface FormData {
  brandName: string;
  logoUrl: string;
  name: string;
  googleBusinessUrl: string;
  googlePlaceId: string;
  googleApiKey: string;
}

interface FormErrors {
  brandName?: string;
  logoUrl?: string;
  name?: string;
  googleBusinessUrl?: string;
  googlePlaceId?: string;
  googleApiKey?: string;
}

export function useStores() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState<EditingStore | null>(null);

  const [formData, setFormData] = useState<FormData>({
    brandName: '',
    logoUrl: '',
    name: '',
    googleBusinessUrl: '',
    googlePlaceId: '',
    googleApiKey: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Queries
  const { data: stores, isLoading } = api.store.list.useQuery();

  // Utils
  const utils = api.useUtils();

  // Mutations
  const createStore = api.store.create.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
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
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const deleteStore = api.store.delete.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setOpenMenuId(null);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const updateStore = api.store.update.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setEditingStore(null);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  // Récupérer l'enseigne sélectionnée pour pré-remplir
  const selectedBrand = selectedBrandId
    ? stores?.find((s) => s.brandId === selectedBrandId)
    : stores && stores.length > 0
      ? stores[0]
      : null;

  // Pré-remplir le formulaire avec l'enseigne sélectionnée si elle existe
  useEffect(() => {
    if (selectedBrand && !isNewBrand) {
      setFormData((prev) => ({
        ...prev,
        brandName: selectedBrand.brandName,
        logoUrl: selectedBrand.logoUrl,
      }));
    } else if (isNewBrand) {
      setFormData((prev) => ({
        ...prev,
        brandName: '',
        logoUrl: '',
      }));
    }
  }, [selectedBrand, isNewBrand]);

  // Ouvrir le modal si paramètre ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateForm(true);
    }
  }, [searchParams]);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu-button]') && !target.closest('[data-menu-dropdown]')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDeleteStore = (storeId: string, storeName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le commerce "${storeName}" ?`)) {
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

    const newErrors: FormErrors = {};

    if (formData.brandName.length < 2) {
      newErrors.brandName = "Le nom de l'enseigne doit contenir au moins 2 caractères";
    }
    if (!formData.logoUrl.trim()) {
      newErrors.logoUrl = 'Le logo est obligatoire';
    } else if (!formData.logoUrl.match(/^https?:\/\/.+/)) {
      newErrors.logoUrl = 'URL du logo invalide';
    }
    if (formData.name.length < 2) {
      newErrors.name = 'Le nom du commerce doit contenir au moins 2 caractères';
    }
    if (!formData.googleBusinessUrl.trim()) {
      newErrors.googleBusinessUrl = "L'URL Google Business est obligatoire";
    } else if (
      !formData.googleBusinessUrl.includes('google.com') &&
      !formData.googleBusinessUrl.includes('maps.app.goo.gl') &&
      !formData.googleBusinessUrl.includes('g.page') &&
      !formData.googleBusinessUrl.includes('goo.gl/maps')
    ) {
      newErrors.googleBusinessUrl = 'URL Google Business invalide';
    }
    if (formData.googlePlaceId.trim() && !formData.googlePlaceId.startsWith('ChIJ')) {
      newErrors.googlePlaceId = 'Le Place ID doit commencer par "ChIJ"';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
