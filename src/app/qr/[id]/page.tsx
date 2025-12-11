/**
 * QR Code Redirect Page (PUBLIC)
 * Redirection publique + tracking des scans
 * IMPORTANT: Route NON protégée - accessible sans authentification
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/trpc/client';

export default function QRCodeRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const qrCodeId = params.id as string;
  const [error, setError] = useState<string | null>(null);

  // Mutation pour enregistrer le scan et récupérer l'URL
  const scanMutation = api.qrCode.scan.useMutation({
    onSuccess: (data) => {
      // Redirection vers l'URL cible
      window.location.href = data.redirectUrl;
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    if (qrCodeId) {
      // Récupérer les métadonnées du scan
      const userAgent = navigator.userAgent;
      const referrer = document.referrer || null;
      const language = navigator.language;

      // Enregistrer le scan
      scanMutation.mutate({
        qrCodeId,
        userAgent,
        referrer,
        language,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCodeId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/20">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Code Invalide</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/20">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirection en cours...</h1>
          <p className="text-gray-600">Vous allez être redirigé dans un instant</p>
        </div>
      </div>
    </div>
  );
}
