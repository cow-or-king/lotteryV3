/**
 * Auth Callback Page - Refactored
 * Gère les callbacks d'authentification (magic link, OAuth, etc.)
 * IMPORTANT: ZERO any types
 */

'use client';

import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSearchParams } from 'next/navigation';
import { useAuthCallback } from '@/hooks/auth/useAuthCallback';
import { Suspense } from 'react';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const { status, message } = useAuthCallback({ searchParams });

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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
          <AnimatedBackground />
          <GlassCard className="w-full max-w-md p-8 text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            <p className="mt-4 text-white/70">Chargement...</p>
          </GlassCard>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
