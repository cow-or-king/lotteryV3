/**
 * useStoreEffects Hook
 * Effects pour la gestion des stores
 * IMPORTANT: ZERO any types
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import type { StoreFormData } from '@/lib/types/store-form.types';

interface UseStoreEffectsProps {
  selectedBrand:
    | { brandName: string; logoUrl: string; [key: string]: string | null | boolean | undefined }
    | null
    | undefined;
  isNewBrand: boolean;
  setFormData: React.Dispatch<React.SetStateAction<StoreFormData>>;
  setShowCreateForm: (show: boolean) => void;
  setOpenMenuId: (id: string | null) => void;
}

export function useStoreEffects({
  selectedBrand,
  isNewBrand,
  setFormData,
  setShowCreateForm,
  setOpenMenuId,
}: UseStoreEffectsProps) {
  const searchParams = useSearchParams();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, isNewBrand]);

  // Ouvrir le modal si paramètre ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
