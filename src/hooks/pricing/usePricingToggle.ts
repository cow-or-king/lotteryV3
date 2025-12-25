/**
 * Hook for managing pricing toggle state (monthly/annual)
 */
import { useState } from 'react';

export function usePricingToggle() {
  const [isAnnual, setIsAnnual] = useState(false);

  return {
    isAnnual,
    setIsAnnual,
  };
}
