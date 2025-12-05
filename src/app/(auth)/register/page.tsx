/**
 * Register Page - Glassmorphism
 * Page d'inscription avec design moderne
 * IMPORTANT: Utilise tRPC pour l'inscription
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassCard } from '@/components/ui/GlassCard';
import { api } from '@/lib/trpc/client';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = api.auth.register.useMutation({
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

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.name) {
      newErrors.name = 'Nom requis';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      name: formData.name,
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Animated blobs background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-60 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
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
            <p className="mt-2 text-gray-600">Créez votre compte gratuit</p>
          </div>

          {/* Glass card */}
          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Inscription</h2>
                <p className="mt-1 text-sm text-gray-600">Rejoignez des milliers de commerces</p>
              </div>

              {errors.general && (
                <div className="p-4 bg-red-400/20 backdrop-blur-xl border border-red-400/30 rounded-2xl">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              )}

              <GlassInput
                type="text"
                label="Nom complet"
                icon="👤"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={errors.name}
                placeholder="Jean Dupont"
                fullWidth
              />

              <GlassInput
                type="email"
                label="Email professionnel"
                icon="📧"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                placeholder="vous@entreprise.com"
                fullWidth
              />

              <GlassInput
                type="password"
                label="Mot de passe"
                icon="🔑"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                fullWidth
              />

              <GlassInput
                type="password"
                label="Confirmer le mot de passe"
                icon="🔒"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                placeholder="••••••••"
                fullWidth
              />

              <div className="space-y-3">
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-1 rounded bg-white/50 border-white/50"
                    required
                  />
                  <span className="text-xs text-gray-600">
                    J'accepte les{' '}
                    <Link href="/terms" className="text-purple-600 hover:text-purple-700 underline">
                      conditions d'utilisation
                    </Link>{' '}
                    et la{' '}
                    <Link
                      href="/privacy"
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      politique de confidentialité
                    </Link>
                  </span>
                </label>
              </div>

              <GlassButton type="submit" fullWidth size="lg" loading={registerMutation.isPending}>
                Créer mon compte
              </GlassButton>
            </form>
          </GlassCard>

          {/* Sign in link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Déjà inscrit?{' '}
              <Link
                href="/login"
                className="font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text hover:from-purple-700 hover:to-pink-700"
              >
                Connectez-vous
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex justify-center space-x-4">
            <div className="px-3 py-1.5 bg-white/30 backdrop-blur-xl rounded-full text-xs font-medium text-gray-700">
              🔒 100% Sécurisé
            </div>
            <div className="px-3 py-1.5 bg-white/30 backdrop-blur-xl rounded-full text-xs font-medium text-gray-700">
              ✨ Sans engagement
            </div>
            <div className="px-3 py-1.5 bg-white/30 backdrop-blur-xl rounded-full text-xs font-medium text-gray-700">
              🚀 Setup rapide
            </div>
          </div>
        </div>
      </div>

      {/* CSS pour les animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
