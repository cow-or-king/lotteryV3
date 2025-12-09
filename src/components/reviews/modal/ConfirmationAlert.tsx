/**
 * Composant ConfirmationAlert
 * Alerte de confirmation avant envoi de la réponse
 * IMPORTANT: ZERO any types, Mobile-first responsive
 */

'use client';

import { AlertTriangle } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface ConfirmationAlertProps {
  dontShowAgain: boolean;
  onDontShowAgainChange: (value: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ConfirmationAlert({
  dontShowAgain,
  onDontShowAgainChange,
  onConfirm,
  onCancel,
  isSubmitting,
}: ConfirmationAlertProps) {
  const alertRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to alert when it appears
  useEffect(() => {
    if (alertRef.current) {
      setTimeout(() => {
        alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, []);

  return (
    <div ref={alertRef} className="p-4 bg-red-50 border-2 border-red-300 rounded-xl animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-bold text-red-900 mb-1">Attention - Action irréversible</h4>
          <p className="text-sm text-red-800 mb-2">
            Une fois publiée, votre réponse{' '}
            <strong>ne pourra plus être modifiée ni supprimée via cette interface</strong>.
            Assurez-vous que votre message est correct avant de l&apos;envoyer.
          </p>
          <p className="text-xs text-gray-700 bg-white/50 p-2 rounded border border-gray-200">
            <strong>Note :</strong> Vous pourrez modifier ou supprimer votre réponse ultérieurement
            en vous connectant directement à votre{' '}
            <a
              href="https://business.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              compte Google Business
            </a>
            .
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="dont-show-again"
            checked={dontShowAgain}
            onChange={(e) => onDontShowAgainChange(e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
          />
          <label htmlFor="dont-show-again" className="text-xs text-gray-700 cursor-pointer">
            Ne plus afficher cette alerte
          </label>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            Confirmer et envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
