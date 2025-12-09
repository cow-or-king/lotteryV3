/**
 * Hook useConfirmation
 * Gestion de la confirmation avant envoi avec localStorage persistence
 * IMPORTANT: ZERO any types, Single Responsibility
 */

'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'review-response-skip-confirmation';

interface UseConfirmationReturn {
  showConfirmation: boolean;
  dontShowAgain: boolean;
  skipConfirmation: boolean;
  setDontShowAgain: (value: boolean) => void;
  requestConfirmation: () => void;
  confirmAction: (callback: () => void) => void;
  cancelConfirmation: () => void;
}

export function useConfirmation(): UseConfirmationReturn {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [skipConfirmation, setSkipConfirmation] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'true') {
      setSkipConfirmation(true);
    }
  }, []);

  const requestConfirmation = () => {
    setShowConfirmation(true);
  };

  const confirmAction = (callback: () => void) => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setSkipConfirmation(true);
    }
    setShowConfirmation(false);
    callback();
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
    setDontShowAgain(false);
  };

  return {
    showConfirmation,
    dontShowAgain,
    skipConfirmation,
    setDontShowAgain,
    requestConfirmation,
    confirmAction,
    cancelConfirmation,
  };
}
