/**
 * Hook to manage brands and auto-selection
 */
import { useMemo, useEffect } from 'react';

interface Store {
  id: string;
  brandId: string;
  brandName: string;
}

interface UseWizardBrandsProps {
  stores?: Store[];
  selectedBrandId: string;
  onBrandChange: (brandId: string) => void;
}

export function useWizardBrands({ stores, selectedBrandId, onBrandChange }: UseWizardBrandsProps) {
  // Get unique brands from stores
  const brands = useMemo(
    () =>
      stores && Array.isArray(stores)
        ? Array.from(
            new Map(
              stores.map((store) => [store.brandId, { id: store.brandId, name: store.brandName }]),
            ).values(),
          )
        : [],
    [stores],
  );

  // Auto-select brand if only one
  useEffect(() => {
    if (brands.length === 1 && !selectedBrandId && brands[0]) {
      onBrandChange(brands[0].id);
    }
  }, [brands, selectedBrandId, onBrandChange]);

  return {
    brands,
  };
}
