/**
 * Hook to manage game session from cookies
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UseGameSessionProps {
  campaignId?: string;
  enabled: boolean;
}

export function useGameSession({ campaignId, enabled }: UseGameSessionProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled || !campaignId) {
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
        if (session.campaignId === campaignId) {
          router.push(`/game/${campaignId}`);
          return;
        }
      } catch (_e) {
        // Error parsing game session, ignore
      }
    }
  }, [campaignId, enabled, router]);
}
