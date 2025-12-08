'use client';

import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import { useEffect, useState } from 'react';

interface EditingBrand {
  id: string;
  name: string;
  logoUrl: string;
}

interface BrandGroup {
  brandId: string;
  brandName: string;
  logoUrl: string;
  stores: Array<{
    id: string;
    name: string;
    slug: string;
    googleBusinessUrl: string;
    googlePlaceId: string | null;
    brandId: string;
    brandName: string;
    logoUrl: string;
    createdAt: Date;
  }>;
}

export function useBrands() {
  const { toast } = useToast();
  const [openBrandMenuId, setOpenBrandMenuId] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<EditingBrand | null>(null);

  // Utils
  const utils = api.useUtils();

  // Queries
  const { data: stores } = api.store.list.useQuery();

  // Mutations
  const deleteBrand = api.brand.delete.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setOpenBrandMenuId(null);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const updateBrand = api.brand.update.useMutation({
    onSuccess: () => {
      utils.store.list.invalidate();
      setEditingBrand(null);
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  // Fermer le menu brand si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu-button]') && !target.closest('[data-menu-dropdown]')) {
        setOpenBrandMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDeleteBrand = (brandId: string, brandName: string) => {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer l'enseigne "${brandName}" et tous ses commerces ?`,
      )
    ) {
      deleteBrand.mutate({ id: brandId });
    }
  };

  const handleUpdateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;

    updateBrand.mutate({
      id: editingBrand.id,
      name: editingBrand.name,
      logoUrl: editingBrand.logoUrl,
    });
  };

  // Organiser les stores par brand
  const brandGroups = stores?.reduce(
    (acc, store) => {
      const brandId = store.brandId;
      if (!acc[brandId]) {
        acc[brandId] = {
          brandId,
          brandName: store.brandName,
          logoUrl: store.logoUrl,
          stores: [],
        };
      }
      acc[brandId].stores.push(store);
      return acc;
    },
    {} as Record<string, BrandGroup>,
  );

  const brands = brandGroups ? Object.values(brandGroups) : [];

  return {
    // State
    brands,
    openBrandMenuId,
    setOpenBrandMenuId,
    editingBrand,
    setEditingBrand,

    // Mutations
    deleteBrand,
    updateBrand,

    // Handlers
    handleDeleteBrand,
    handleUpdateBrand,
  };
}
