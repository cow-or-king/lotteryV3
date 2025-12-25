/**
 * Hook to manage game user from cookies
 */
import { useState, useEffect } from 'react';

interface GameUser {
  id: string;
  email: string;
  name: string;
}

export function useGameUser() {
  const [gameUser, setGameUser] = useState<GameUser | null>(null);

  useEffect(() => {
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    };

    const userCookie = getCookie('cb-game-user');
    if (userCookie) {
      try {
        setGameUser(JSON.parse(decodeURIComponent(userCookie)));
      } catch (_e) {
        // Error parsing game user cookie, ignore
      }
    }
  }, []);

  return gameUser;
}
