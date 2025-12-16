/**
 * Play Login Page (Mockup)
 * Page de connexion Google mockup pour tester le parcours
 * Route: /play/login?campaignId=xxx
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Shield } from 'lucide-react';

export default function PlayLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);

    // Simuler une connexion (pour le test, pas de vraie auth)
    setTimeout(() => {
      // Stocker un faux token dans localStorage pour simulation
      localStorage.setItem(
        'mockUser',
        JSON.stringify({
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        }),
      );

      // Rediriger vers le jeu
      router.push(`/play/${campaignId}`);
    }, 1500);
  };

  if (!campaignId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-700 to-gray-900">
        <div className="text-center text-white max-w-md mx-4">
          <h1 className="text-3xl font-bold mb-4">Erreur</h1>
          <p className="text-gray-300">Aucune campagne spécifiée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        {/* Logo/Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-pink-500 mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
          <p className="text-gray-600">Connectez-vous pour jouer et tenter de gagner</p>
        </div>

        {/* Info sécurité */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Connexion sécurisée</strong>
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Vos informations Google sont sécurisées et ne seront utilisées que pour votre
            participation
          </p>
        </div>

        {/* Bouton Google (mockup) */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-gray-700 border-r-transparent"></div>
              <span>Connexion en cours...</span>
            </>
          ) : (
            <>
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Se connecter avec Google</span>
            </>
          )}
        </button>

        {/* Note de test */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">🧪 Mode test - Cliquez pour simuler la connexion</p>
        </div>
      </div>
    </div>
  );
}
