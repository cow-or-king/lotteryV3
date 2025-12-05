/**
 * Login Page - Glassmorphism
 * Design moderne avec effets de verre et formes organiques
 * IMPORTANT: Utilise tRPC pour l'authentification
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassBadge,
  AnimatedBackground,
} from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const loginMutation = api.auth.login.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error) => {
      setErrors({ general: error.message });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Email requis' }));
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Mot de passe requis' }));
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <AnimatedBackground className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-white/30 backdrop-blur-xl rounded-3xl mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl"></div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800">
              Review
              <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                Lottery
              </span>
            </h1>
            <p className="mt-2 text-gray-600">L'expérience client réinventée</p>
          </div>

          {/* Glass card */}
          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Bon retour!</h2>
                <p className="mt-1 text-sm text-gray-600">Connectez-vous pour continuer</p>
              </div>

              {errors.general && (
                <div className="p-4 bg-red-400/20 backdrop-blur-xl border border-red-400/30 rounded-2xl">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              )}

              <GlassInput
                type="email"
                label="Email"
                icon="📧"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="vous@example.com"
                fullWidth
              />

              <GlassInput
                type="password"
                label="Mot de passe"
                icon="🔑"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                fullWidth
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded-lg bg-white/50 border-white/50"
                  />
                  <span className="ml-2 text-gray-700">Rester connecté</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Besoin d'aide?
                </Link>
              </div>

              <GlassButton type="submit" fullWidth size="lg" loading={loginMutation.isPending}>
                Se connecter
              </GlassButton>

              {/* Social login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/50"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-transparent text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <GlassButton type="button" variant="secondary" size="sm">
                  <span className="text-lg">🔵</span>
                </GlassButton>
                <GlassButton type="button" variant="secondary" size="sm">
                  <span className="text-lg">🔴</span>
                </GlassButton>
                <GlassButton type="button" variant="secondary" size="sm">
                  <span className="text-lg">⚫</span>
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          {/* Sign up link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Pas encore de compte?{' '}
              <Link
                href="/register"
                className="font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text hover:from-purple-700 hover:to-pink-700"
              >
                Inscrivez-vous gratuitement
              </Link>
            </p>
          </div>

          {/* Floating badges */}
          <div className="mt-8 flex justify-center space-x-4">
            <GlassBadge>✅ RGPD Compliant</GlassBadge>
            <GlassBadge>🏆 #1 en France</GlassBadge>
            <GlassBadge>⭐ 4.9/5</GlassBadge>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
