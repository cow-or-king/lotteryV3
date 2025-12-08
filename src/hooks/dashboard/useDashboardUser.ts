/**
 * useDashboardUser Hook
 * Gère les données utilisateur et la déconnexion
 * IMPORTANT: ZERO any types
 */

'use client';

import { api } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useDashboardUser() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Récupérer les infos utilisateur
  const { data: user, isLoading: userLoading } = api.auth.getMe.useQuery();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/trpc/auth.logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return {
    user,
    userLoading,
    isLoggingOut,
    handleLogout,
  };
}
