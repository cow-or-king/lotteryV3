/**
 * Reset Password Page - Glassmorphism
 * Page pour définir un nouveau mot de passe après reset
 * IMPORTANT: Utilise tRPC updatePassword endpoint
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { GlassCard, GlassButton, GlassInput, AnimatedBackground } from '@/components/ui';
import { Key, CheckCircle, XCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Vérifier qu'on a bien un token dans l'URL (vient de Supabase)
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');

    if (type === 'recovery' && accessToken) {
      setHasAccess(true);
    } else {
      setHasAccess(false);
    }
  }, [searchParams]);

  const updatePasswordMutation = api.auth.updatePassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError('');
      // Rediriger vers login après 3s
      setTimeout(() => router.push('/login'), 3000);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password) {
      setError('Mot de passe requis');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    updatePasswordMutation.mutate({ newPassword: password });
  };

  // Si pas de token, afficher un message d'erreur
  if (!hasAccess) {
    return (
      <div className="relative min-h-[100dvh] overflow-x-hidden">
        <AnimatedBackground className="absolute inset-0" />
        <div className="relative min-h-[100dvh] flex items-center justify-center px-4 py-6">
          <GlassCard className="w-full max-w-md text-center">
            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Lien invalide</h2>
            <p className="text-gray-600 mb-6">
              Ce lien de réinitialisation est invalide ou a expiré.
            </p>
            <Link href="/forgot-password">
              <GlassButton fullWidth>Demander un nouveau lien</GlassButton>
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      <AnimatedBackground className="absolute inset-0" />
      <div className="relative min-h-[100dvh] flex items-center justify-center px-4 py-6 sm:py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-block p-2 sm:p-3 bg-white/30 backdrop-blur-xl rounded-2xl sm:rounded-3xl mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl sm:rounded-2xl"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Review
              <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                Lottery
              </span>
            </h1>
          </div>

          {/* Glass card */}
          <GlassCard>
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Nouveau mot de passe
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600">
                    Choisissez un mot de passe sécurisé pour votre compte.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-400/20 backdrop-blur-xl border border-red-400/30 rounded-2xl">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <GlassInput
                  type="password"
                  label="Nouveau mot de passe"
                  icon={<Key className="w-5 h-5 text-purple-300" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  fullWidth
                  autoFocus
                />

                <GlassInput
                  type="password"
                  label="Confirmer le mot de passe"
                  icon={<Key className="w-5 h-5 text-purple-300" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  fullWidth
                />

                {/* Password strength indicator */}
                {password && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Force du mot de passe:</p>
                    <div className="flex gap-1">
                      <div
                        className={`h-1 flex-1 rounded ${password.length >= 4 ? 'bg-red-500' : 'bg-gray-300'}`}
                      ></div>
                      <div
                        className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-orange-500' : 'bg-gray-300'}`}
                      ></div>
                      <div
                        className={`h-1 flex-1 rounded ${password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Recommandé: au moins 8 caractères, avec majuscules et chiffres
                    </p>
                  </div>
                )}

                <GlassButton
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={updatePasswordMutation.isPending}
                >
                  Définir le nouveau mot de passe
                </GlassButton>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Mot de passe mis à jour! ✅
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-600">
                    Votre mot de passe a été changé avec succès.
                  </p>
                </div>

                <div className="p-4 bg-blue-400/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl">
                  <p className="text-sm text-blue-900">Redirection vers la page de connexion...</p>
                </div>

                <Link href="/login">
                  <GlassButton fullWidth variant="secondary">
                    Se connecter maintenant
                  </GlassButton>
                </Link>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
