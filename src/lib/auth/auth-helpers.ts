/**
 * Auth helper functions
 */
import type { GoogleUserMetadata, GameUserData } from '@/types/auth.types';
import type { User } from '@supabase/supabase-js';

/**
 * Extract user name from Google metadata
 */
export function getUserName(user: User): string {
  const metadata = user.user_metadata as GoogleUserMetadata;
  return metadata?.name || metadata?.given_name || 'Joueur';
}

/**
 * Get redirect URL based on auth context
 */
export function getRedirectUrl(
  campaignId: string | null,
  isGameAuth: boolean,
  searchParamsNext?: string | null,
): string {
  if (searchParamsNext) {
    return searchParamsNext;
  }
  return isGameAuth && campaignId ? `/game/${campaignId}` : '/dashboard';
}

/**
 * Get fallback URL on error
 */
export function getErrorRedirectUrl(campaignId: string | null, isGameAuth: boolean): string {
  return isGameAuth && campaignId ? `/c/${campaignId}` : '/login';
}

/**
 * Create game user via API
 */
export async function createGameUser(user: User): Promise<void> {
  const metadata = user.user_metadata as GoogleUserMetadata;
  const gameUserData: GameUserData = {
    supabaseId: user.id,
    email: user.email ?? '',
    name: getUserName(user),
    avatarUrl: metadata?.avatar_url || metadata?.picture,
    provider: 'google',
  };

  const response = await fetch('/api/game-users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameUserData),
  });

  if (!response.ok) {
    throw new Error('Failed to create game user');
  }
}

/**
 * Set game session cookies
 */
export function setGameSessionCookies(
  accessToken: string,
  userId: string,
  email: string,
  name: string,
): void {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const secure = process.env.NODE_ENV === 'production' ? 'secure;' : '';

  document.cookie = `cb-game-session=${accessToken}; path=/; max-age=${maxAge}; ${secure} samesite=lax`;
  document.cookie = `cb-game-user=${JSON.stringify({ id: userId, email, name })}; path=/; max-age=${maxAge}; samesite=lax`;
}

/**
 * Retrieve campaign ID from URL or localStorage
 */
export function retrieveCampaignId(urlCampaignId: string | null): string | null {
  if (urlCampaignId) {
    return urlCampaignId;
  }

  const pendingCampaign = localStorage.getItem('cb-pending-campaign');
  return pendingCampaign;
}

/**
 * Clean up auth storage
 */
export function cleanupAuthStorage(): void {
  localStorage.removeItem('cb-pending-campaign');
}
