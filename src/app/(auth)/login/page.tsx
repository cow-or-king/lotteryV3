/**
 * Login Page - Glassmorphism
 * Design moderne avec effets de verre et formes organiques
 * IMPORTANT: Utilise tRPC pour l'authentification
 */

'use client';

import {
  AnimatedBackground,
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassInput,
} from '@/components/ui';
import { api } from '@/lib/trpc/client';
import { Key, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
    <div className="relative min-h-dvh overflow-x-hidden">
      <AnimatedBackground className="absolute inset-0" />
      <div className="relative min-h-dvh flex items-center justify-center px-4 py-6 sm:py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-block p-2 sm:p-3 bg-white/30 backdrop-blur-xl rounded-2xl sm:rounded-3xl mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-purple-400 to-pink-400 rounded-xl sm:rounded-2xl"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Review
              <span className="text-transparent bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text">
                Lottery
              </span>
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              L'expérience client réinventée
            </p>
          </div>

          {/* Glass card */}
          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Bon retour!</h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  Connectez-vous pour continuer
                </p>
              </div>

              {errors.general && (
                <div className="p-4 bg-red-400/20 backdrop-blur-xl border border-red-400/30 rounded-2xl">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              )}

              <GlassInput
                type="email"
                label="Email"
                icon={<Mail className="w-5 h-5 text-purple-300" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="vous@example.com"
                fullWidth
              />

              <GlassInput
                type="password"
                label="Mot de passe"
                icon={<Key className="w-5 h-5 text-purple-300" />}
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

              {/* Social login - hidden on very small screens */}
              <div className="relative hidden sm:block">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/50"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-transparent text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              <div className="grid-cols-3 gap-2 sm:gap-3 hidden sm:grid">
                <GlassButton type="button" variant="secondary" size="sm">
                  <span className="text-base sm:text-lg">🔵</span>
                </GlassButton>
                <GlassButton type="button" variant="secondary" size="sm">
                  <span className="text-base sm:text-lg">🔴</span>
                </GlassButton>
                <GlassButton type="button" variant="secondary" size="sm">
                  <span className="text-base sm:text-lg">⚫</span>
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          {/* Sign up link */}
          <div className="mt-4 sm:mt-8 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Pas encore de compte?{' '}
              <Link
                href="/register"
                className="font-bold text-transparent bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text hover:from-purple-700 hover:to-pink-700"
              >
                Inscrivez-vous
              </Link>
            </p>
          </div>

          {/* Floating badges */}
          <div className="mt-4 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4">
            <GlassBadge className="text-xs sm:text-sm">✅ RGPD</GlassBadge>
            <GlassBadge className="text-xs sm:text-sm hidden sm:inline-flex">
              🏆 #1 en France
            </GlassBadge>
            <GlassBadge className="text-xs sm:text-sm">⭐ 4.9/5</GlassBadge>
          </div>
        </div>
      </div>
    </div>
  );
}
