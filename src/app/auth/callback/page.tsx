/**
 * Auth Callback Page
 * Gère les callbacks d'authentification (magic link, OAuth, etc.)
 * IMPORTANT: ZERO any types
 */

'use client';

import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    const handleCallback = async () => {
      // IMPORTANT: Récupérer campaignId depuis l'URL OU depuis localStorage
      let campaignId = searchParams.get('campaignId');

      // Si pas de campaignId dans l'URL, vérifier le localStorage
      if (!campaignId) {
        const pendingCampaign = localStorage.getItem('rl-pending-campaign');
        if (pendingCampaign) {
          campaignId = pendingCampaign;
          console.log('🔍 CampaignId récupéré depuis localStorage:', campaignId);
        }
      }

      const isGameAuth = !!campaignId;

      console.log('🔍 Auth Callback - campaignId:', campaignId, 'isGameAuth:', isGameAuth);

      const next = searchParams.get('next') ?? (isGameAuth ? `/game/${campaignId}` : '/dashboard');

      // Vérifier si on a un hash fragment (implicit flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      console.log('🔍 Hash has accessToken:', !!accessToken);
      console.log('🔍 Next redirect:', next);

      // IMPORTANT: Si on a un access_token, on ignore les erreurs dans l'URL
      // car Supabase peut envoyer access_token + error en même temps
      if (accessToken) {
        try {
          // Récupérer la session depuis le hash
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

          if (sessionError || !sessionData.session) {
            throw new Error('Failed to get session');
          }

          const user = sessionData.session.user;

          console.log('✅ Session récupérée, user:', user.email);
          console.log('✅ isGameAuth:', isGameAuth, 'campaignId:', campaignId);

          // Si c'est une auth de jeu, créer le GameUser dans la DB
          if (isGameAuth && campaignId) {
            console.log('✅ Création GameUser pour campaign:', campaignId);

            // Créer le GameUser directement via l'API
            const createUserResponse = await fetch('/api/game-users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                supabaseId: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.user_metadata?.given_name || 'Joueur',
                avatarUrl: user.user_metadata?.avatar_url,
                provider: 'google',
              }),
            });

            if (!createUserResponse.ok) {
              console.error('Échec création GameUser');
            } else {
              const gameUserData = await createUserResponse.json();
              console.log('✅ GameUser créé:', gameUserData);
            }

            console.log('✅ Stockage cookies jeu');
            document.cookie = `rl-game-session=${sessionData.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''} samesite=lax`;
            document.cookie = `rl-game-user=${JSON.stringify({ id: user.id, email: user.email, name: user.user_metadata?.name || user.user_metadata?.given_name || 'Joueur' })}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
          }

          // Nettoyer le localStorage après succès
          localStorage.removeItem('rl-pending-campaign');

          setStatus('success');
          setMessage('Authentification réussie! Redirection...');
          console.log('✅ Redirection vers:', next);
          setTimeout(() => router.push(next), 1500);
          return;
        } catch (_err) {
          console.error('❌ Erreur auth:', _err);
          setStatus('error');
          setMessage("Échec de l'authentification. Redirection...");
          setTimeout(() => router.push(isGameAuth ? `/c/${campaignId}` : '/login'), 3000);
          return;
        }
      }

      // Si pas d'access_token, vérifier les erreurs
      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription =
        searchParams.get('error_description') || hashParams.get('error_description');

      if (error) {
        console.error('🔍 OAuth Error:', error, errorDescription);
        setStatus('error');
        setMessage(errorDescription || error);
        setTimeout(() => router.push(isGameAuth ? `/c/${campaignId}` : '/login'), 3000);
        return;
      }

      // PKCE flow avec code
      const code = searchParams.get('code');
      if (!code) {
        setStatus('error');
        setMessage("Code d'authentification manquant.");
        setTimeout(() => router.push(isGameAuth ? `/c/${campaignId}` : '/login'), 3000);
        return;
      }

      try {
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, campaignId }),
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = (await response.json()) as {
          success: boolean;
          isGameAuth?: boolean;
          user: { id: string; email: string; name?: string };
          session?: { access_token: string };
        };

        if (data.isGameAuth && data.session && campaignId) {
          document.cookie = `rl-game-session=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''} samesite=lax`;
          document.cookie = `rl-game-user=${JSON.stringify({ id: data.user.id, email: data.user.email, name: data.user.name })}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        }

        // Nettoyer le localStorage après succès
        localStorage.removeItem('rl-pending-campaign');

        setStatus('success');
        setMessage('Authentification réussie! Redirection...');
        setTimeout(() => router.push(next), 1500);
      } catch (_err) {
        setStatus('error');
        setMessage("Échec de l'authentification. Redirection...");
        setTimeout(() => router.push(isGameAuth ? `/c/${campaignId}` : '/login'), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <AnimatedBackground />

      <GlassCard className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          )}
          {status === 'success' && (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">
          {status === 'processing' && 'Authentification'}
          {status === 'success' && 'Succès!'}
          {status === 'error' && 'Erreur'}
        </h1>

        <p className="text-white/70">{message}</p>
      </GlassCard>
    </div>
  );
}
