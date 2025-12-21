/**
 * Campaign Landing Page via QR Code
 * Page d'atterrissage quand un utilisateur scanne le QR code par défaut d'un store
 * Route: /c/[shortCode]
 *
 * Flow:
 * 1. Trouve QRCode par shortCode
 * 2. Trouve Store lié au QRCode
 * 3. Trouve la campagne ACTIVE du Store
 * 4. Affiche la landing page de la campagne
 */

'use client';

import { api } from '@/lib/trpc/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function QRCodeLandingPage() {
  const params = useParams();
  const router = useRouter();
  const shortCode = params.shortCode as string;

  // Récupérer le QRCode, le Store et la campagne active via une seule query
  const { data, isLoading, error } = api.qrCode.getActiveCampaignByShortCode.useQuery(
    { shortCode },
    { enabled: !!shortCode },
  );

  // Vérifier si l'utilisateur a déjà une session de jeu
  useEffect(() => {
    if (!data?.campaign) {
      return;
    }

    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    };

    const gameSession = getCookie('cb-game-session');
    const gameUser = getCookie('cb-game-user');

    // Si session existe et correspond à cette campagne, rediriger vers le jeu
    if (gameSession && gameUser) {
      try {
        const session = JSON.parse(decodeURIComponent(gameSession));
        if (session.campaignId === data.campaign.id) {
          router.push(`/game/${data.campaign.id}`);
          return;
        }
      } catch (e) {
        console.error('Error parsing game session:', e);
      }
    }
  }, [data, router]);

  const handleStartGame = async () => {
    if (!data?.campaign) {
      return;
    }

    try {
      // Connexion Google OAuth
      const redirectUrl = `${window.location.origin}/auth/callback?campaignId=${data.campaign.id}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('Erreur lors de la connexion Google:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-linear-to-br from-purple-300 via-white to-pink-300">
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
        </div>
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-800 text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // Error state or no active campaign
  if (error || !data?.campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-linear-to-br from-purple-300 via-white to-pink-300">
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
        </div>
        <div className="text-center max-w-md mx-4">
          <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {error ? 'Erreur' : 'Aucune campagne active'}
            </h1>
            <p className="text-gray-700">
              {error
                ? 'Une erreur est survenue. Veuillez réessayer.'
                : "Ce commerce n'a pas de campagne active pour le moment."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { campaign, store } = data;

  // Main landing page
  return (
    <div className="min-h-screen p-4 relative bg-linear-to-br from-purple-300 via-white to-pink-300">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div
          className="absolute -top-20 -right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-30 animate-blob"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute -bottom-20 left-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-30 animate-blob"
          style={{ animationDelay: '4s' }}
        ></div>
        <div
          className="absolute -bottom-20 right-1/4 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-blob"
          style={{ animationDelay: '6s' }}
        ></div>
      </div>

      <div className="max-w-4xl w-full py-8 mx-auto">
        {/* Store Name */}
        <div className="text-center mb-6">
          <p className="text-gray-700 text-lg font-medium">{store.name}</p>
        </div>

        {/* Header Animated */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6 animate-float">
            <div className="w-28 h-28 bg-white/70 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-5xl">🎁</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Gagnez à <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
              Coup Sûr
            </span>{' '}
            !
          </h1>
          <p className="text-2xl text-gray-700 max-w-2xl mx-auto font-medium">
            {campaign.description || 'Participez et gagnez des cadeaux !'}
          </p>
        </div>

        {/* How it Works - Horizontal Timeline */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/30 text-center shadow-lg">
              <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-white shadow-lg">
                1
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">📝 Connectez-vous</h4>
              <p className="text-gray-700 text-sm">Avec votre compte Google</p>
            </div>

            <div className="hidden md:block text-gray-400 text-3xl">→</div>

            <div className="flex-1 w-full bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/30 text-center shadow-lg">
              <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-white shadow-lg">
                2
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">🎰 Jouez</h4>
              <p className="text-gray-700 text-sm">Tournez la roue</p>
            </div>

            <div className="hidden md:block text-gray-400 text-3xl">→</div>

            <div className="flex-1 w-full bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/30 text-center shadow-lg">
              <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl text-white shadow-lg">
                3
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">🎁 Gagnez</h4>
              <p className="text-gray-700 text-sm">Récupérez votre cadeau</p>
            </div>
          </div>
        </div>

        {/* Why Participate Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl mb-10">
          <div className="bg-linear-to-r from-purple-600 to-pink-600 p-3 text-white rounded-t-3xl">
            <h2 className="text-2xl font-bold text-white text-center">Pourquoi participer ?</h2>
          </div>

          <div className="space-y-4 p-4">
            <div
              className="flex items-start gap-3 animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              <svg
                className="w-6 h-6 text-green-500 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p className="text-gray-700 text-lg">100% de chances de gagner un prize</p>
            </div>
            <div
              className="flex items-start gap-3 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <svg
                className="w-6 h-6 text-green-500 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p className="text-gray-700 text-lg">Cadeaux et réductions exclusifs</p>
            </div>
            <div
              className="flex items-start gap-3 animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <svg
                className="w-6 h-6 text-green-500 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p className="text-gray-700 text-lg">Simple et rapide</p>
            </div>
          </div>
        </div>

        {/* Giant CTA */}
        <div className="text-center">
          <button
            onClick={handleStartGame}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-purple-600 text-gray-900 text-lg font-semibold rounded-full hover:bg-blue-50 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            Continuer avec Google
          </button>
          <div className="mt-6 flex items-center justify-center gap-6 text-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="text-sm font-medium">100% Gagnant</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="text-sm font-medium">Gratuit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
