/**
 * Play Login Page (Mockup)
 * Page de connexion Google mockup pour tester le parcours
 * Route: /play/login?campaignId=xxx
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

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
      <div className="min-h-screen flex items-center justify-center relative ">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
        </div>

        <div className="text-center max-w-md mx-4">
          <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Erreur</h1>
            <p className="text-gray-700">Aucune campagne spécifiée</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-linear-to-br from-purple-50 via-white to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      <div className="max-w-2xl w-full">
        {/* Progress Badge */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/70 backdrop-blur-xl border border-white/30 px-6 py-3 rounded-full text-sm font-semibold text-gray-700 shadow-lg">
            Étape 1 sur 2
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mt-6 mb-2">
            Bonjour{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
              Jean
            </span>
          </h1>
          <p className="text-gray-700 text-lg">Commençons par votre avis</p>
        </div>

        {/* Main Glass Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden mb-6">
          {/* Card Header with linear */}
          <div className="bg-linear-to-r from-purple-600 to-pink-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Avis Google</h2>
                <p className="text-white/80 text-sm">Connecté avec votre compte</p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Comment ça marche ?</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-linear-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span className="text-gray-700">
                    Cliquez sur le bouton pour ouvrir Google Avis
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-linear-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span className="text-gray-700">Partagez votre expérience en quelques mots</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-linear-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span className="text-gray-700">Revenez ici pour tourner la roue</span>
                </li>
              </ol>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full px-8 py-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl transform hover:scale-105 transition-all shadow-xl mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
                  <span>Connexion en cours...</span>
                </span>
              ) : (
                <span>Ouvrir Google Avis</span>
              )}
            </button>

            {/* Info Box */}
            <div className="bg-white/70 backdrop-blur-xl border border-purple-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-purple-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <div>
                  <p className="text-sm text-gray-800 font-medium mb-1">
                    <strong>Important :</strong> Gardez cette page ouverte
                  </p>
                  <p className="text-xs text-gray-700">
                    Vous reviendrez ici après avoir publié votre avis pour accéder à la roue de la
                    chance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-white/70 backdrop-blur-xl px-8 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">Étape suivante</span>
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Roue de la chance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-sm text-gray-600">
          Votre avis nous aide à améliorer notre service • Merci de votre participation
        </p>

        {/* Test Note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">🧪 Mode test - Cliquez pour simuler la connexion</p>
        </div>
      </div>
    </div>
  );
}
