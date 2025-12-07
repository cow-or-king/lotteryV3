/**
 * Forgot Password Page - Glassmorphism
 * Page pour demander un magic link de réinitialisation
 * IMPORTANT: Utilise tRPC sendMagicLink endpoint
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc/client';
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassBadge,
  AnimatedBackground,
} from '@/components/ui';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const sendMagicLinkMutation = api.auth.sendMagicLink.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError('');
    },
    onError: (err) => {
      setError(err.message);
      setSuccess(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email requis');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email invalide');
      return;
    }

    sendMagicLinkMutation.mutate({ email });
  };

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
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Récupération de compte
            </p>
          </div>

          {/* Glass card */}
          <GlassCard>
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Mot de passe oublié?
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600">
                    Pas de souci! Entrez votre email et nous vous enverrons un lien magique pour
                    vous reconnecter.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-400/20 backdrop-blur-xl border border-red-400/30 rounded-2xl">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <GlassInput
                  type="email"
                  label="Email"
                  icon={<Mail className="w-5 h-5 text-purple-300" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error && !email ? error : undefined}
                  placeholder="vous@example.com"
                  fullWidth
                  autoFocus
                />

                <GlassButton
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={sendMagicLinkMutation.isPending}
                >
                  Envoyer le lien magique
                </GlassButton>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Email envoyé! 📧</h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-600">
                    Nous avons envoyé un lien magique à:
                  </p>
                  <p className="mt-1 font-semibold text-purple-600">{email}</p>
                </div>

                <div className="p-4 bg-blue-400/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl text-left">
                  <p className="text-sm text-blue-900 font-medium mb-2">📌 Prochaines étapes:</p>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Consultez votre boîte mail</li>
                    <li>Cliquez sur le lien magique</li>
                    <li>Vous serez automatiquement connecté</li>
                  </ol>
                </div>

                <div className="text-xs text-gray-500">
                  Pas reçu? Vérifiez vos spams ou{' '}
                  <button
                    onClick={() => {
                      setSuccess(false);
                      sendMagicLinkMutation.reset();
                    }}
                    className="text-purple-600 hover:text-purple-700 font-medium underline"
                  >
                    renvoyez un lien
                  </button>
                </div>

                <Link href="/login">
                  <GlassButton type="button" variant="secondary" fullWidth>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
                  </GlassButton>
                </Link>
              </div>
            )}
          </GlassCard>

          {/* Info badges */}
          <div className="mt-4 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4">
            <GlassBadge className="text-xs sm:text-sm">🔒 Sécurisé</GlassBadge>
            <GlassBadge className="text-xs sm:text-sm">⚡ Instantané</GlassBadge>
            <GlassBadge className="text-xs sm:text-sm">✨ Sans mot de passe</GlassBadge>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Le lien magique expire après 1 heure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
