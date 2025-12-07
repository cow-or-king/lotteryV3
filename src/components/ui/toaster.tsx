/**
 * Toaster Component
 * Composant qui affiche tous les toasts actifs
 * IMPORTANT: ZERO any types
 */

'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster(): React.ReactElement {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map((toastItem) => (
        <Toast key={toastItem.id} variant={toastItem.variant} duration={toastItem.duration || 5000}>
          <div className="flex items-start gap-3">
            <ToastIcon variant={toastItem.variant} />
            <div className="grid gap-1 flex-1">
              {toastItem.title && <ToastTitle>{toastItem.title}</ToastTitle>}
              {toastItem.description && (
                <ToastDescription>{toastItem.description}</ToastDescription>
              )}
            </div>
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
