'use client';

import { api } from '@/lib/trpc/client';
import { useState } from 'react';

export function useStoreLimits() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Récupérer les limites du plan
  const { data: limits } = api.store.getLimits.useQuery();

  return {
    limits,
    showUpgradeModal,
    setShowUpgradeModal,
  };
}
