/**
 * Hook for handling auth callback logic
 */
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AuthStatus, AuthCallbackResponse } from '@/types/auth.types';
import {
  getUserName,
  getRedirectUrl,
  getErrorRedirectUrl,
  createGameUser,
  setGameSessionCookies,
  retrieveCampaignId,
  cleanupAuthStorage,
} from '@/lib/auth/auth-helpers';

interface UseAuthCallbackParams {
  searchParams: URLSearchParams;
}

/**
 * Handle implicit OAuth flow (hash-based)
 */
async function handleImplicitFlow(
  campaignId: string | null,
  isGameAuth: boolean,
  nextUrl: string,
): Promise<{ success: boolean; redirectUrl: string }> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    throw new Error('Failed to get session');
  }

  const user = sessionData.session.user;

  // Create game user if needed
  if (isGameAuth && campaignId) {
    await createGameUser(user);
    setGameSessionCookies(
      sessionData.session.access_token,
      user.id,
      user.email ?? '',
      getUserName(user),
    );
  }

  cleanupAuthStorage();
  return { success: true, redirectUrl: nextUrl };
}

/**
 * Handle PKCE flow (code-based)
 */
async function handlePKCEFlow(
  code: string,
  campaignId: string | null,
  nextUrl: string,
): Promise<{ success: boolean; redirectUrl: string }> {
  const response = await fetch('/api/auth/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, campaignId }),
  });

  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  const data = (await response.json()) as AuthCallbackResponse;

  if (data.isGameAuth && data.session && campaignId) {
    setGameSessionCookies(
      data.session.access_token,
      data.user.id,
      data.user.email,
      data.user.name ?? 'Joueur',
    );
  }

  cleanupAuthStorage();
  return { success: true, redirectUrl: nextUrl };
}

export function useAuthCallback({ searchParams }: UseAuthCallbackParams) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>('processing');
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get campaign ID from URL or localStorage
        const urlCampaignId = searchParams.get('campaignId');
        const campaignId = retrieveCampaignId(urlCampaignId);
        const isGameAuth = !!campaignId;

        // Determine redirect URL
        const searchParamsNext = searchParams.get('next');
        const nextUrl = getRedirectUrl(campaignId, isGameAuth, searchParamsNext);

        // Check for hash-based access token (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');

        if (accessToken) {
          const result = await handleImplicitFlow(campaignId, isGameAuth, nextUrl);
          setStatus('success');
          setMessage('Authentification réussie! Redirection...');
          setTimeout(() => router.push(result.redirectUrl), 1500);
          return;
        }

        // Check for errors
        const error = searchParams.get('error') || hashParams.get('error');
        const errorDescription =
          searchParams.get('error_description') || hashParams.get('error_description');

        if (error) {
          throw new Error(errorDescription || error);
        }

        // Handle PKCE flow with code
        const code = searchParams.get('code');
        if (!code) {
          throw new Error("Code d'authentification manquant");
        }

        const result = await handlePKCEFlow(code, campaignId, nextUrl);
        setStatus('success');
        setMessage('Authentification réussie! Redirection...');
        setTimeout(() => router.push(result.redirectUrl), 1500);
      } catch (error) {
        const urlCampaignId = searchParams.get('campaignId');
        const campaignId = retrieveCampaignId(urlCampaignId);
        const errorRedirect = getErrorRedirectUrl(campaignId, !!campaignId);

        setStatus('error');
        setMessage(
          error instanceof Error ? error.message : "Échec de l'authentification. Redirection...",
        );
        setTimeout(() => router.push(errorRedirect), 3000);
      }
    };

    processCallback();
  }, [router, searchParams]);

  return { status, message };
}
