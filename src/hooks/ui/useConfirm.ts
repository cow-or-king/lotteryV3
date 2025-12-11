/**
 * useConfirm Hook
 * Hook pour faciliter l'utilisation du ConfirmDialog
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState, useCallback } from 'react';
import type { ConfirmDialogProps } from '@/components/ui/ConfirmDialog';

type ConfirmOptions = Omit<ConfirmDialogProps, 'open' | 'onConfirm' | 'onCancel'>;

interface ConfirmState extends ConfirmOptions {
  open: boolean;
}

interface UseConfirmReturn {
  ConfirmDialogProps: ConfirmDialogProps;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

/**
 * Hook pour gérer facilement les dialogues de confirmation
 *
 * @example
 * ```tsx
 * const { ConfirmDialogProps, confirm } = useConfirm();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Supprimer',
 *     message: 'Êtes-vous sûr ?',
 *     variant: 'danger',
 *   });
 *
 *   if (confirmed) {
 *     // Effectuer la suppression
 *   }
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleDelete}>Supprimer</button>
 *     <ConfirmDialog {...ConfirmDialogProps} />
 *   </>
 * );
 * ```
 */
export function useConfirm(): UseConfirmReturn {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    variant: 'warning',
  });

  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({
        ...options,
        open: true,
      });
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const ConfirmDialogProps: ConfirmDialogProps = {
    open: state.open,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
    title: state.title,
    message: state.message,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    variant: state.variant,
  };

  return {
    ConfirmDialogProps,
    confirm,
  };
}
