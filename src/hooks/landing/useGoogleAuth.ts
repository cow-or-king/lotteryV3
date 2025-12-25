/**
 * Hook to handle Google OAuth authentication for campaigns
 */
import { supabase } from '@/lib/supabase/client';

export function useGoogleAuth() {
  const handleStartGame = async (campaignId: string) => {
    try {
      // Connexion Google OAuth
      const redirectUrl = `${window.location.origin}/auth/callback?campaignId=${campaignId}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        // Error handled silently
      }
    } catch (_error) {
      // Error handled silently
    }
  };

  return {
    handleStartGame,
  };
}
