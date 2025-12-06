/**
 * Auth Callback Page
 * Gère les callbacks d'authentification (magic link, OAuth, etc.)
 * IMPORTANT: ZERO any types
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const next = searchParams.get('next') ?? '/dashboard';

      if (error) {
        setStatus('error');
        setMessage(errorDescription ?? "Une erreur est survenue lors de l'authentification.");
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage("Code d'authentification manquant.");
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      try {
        // Le code sera échangé côté serveur via une API route
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        setStatus('success');
        setMessage('Authentification réussie! Redirection...');
        setTimeout(() => router.push(next), 1500);
      } catch (err) {
        setStatus('error');
        setMessage("Échec de l'authentification. Redirection...");
        setTimeout(() => router.push('/login'), 3000);
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
