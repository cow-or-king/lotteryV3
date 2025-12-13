/**
 * Register Page - Glassmorphism
 * Page d'inscription avec design moderne
 * IMPORTANT: Utilise tRPC pour l'inscription
 */

'use client';

import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { api } from '@/lib/trpc/client';
import { Key, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
    <div className="relative min-h-dvh overflow-x-hidden">
      {/* Animated blobs background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-60 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
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
              Créez votre compte gratuit
            </p>
          </div>

          {/* Glass card */}
          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Inscription</h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  Rejoignez des milliers de commerces
                </p>
              </div>

              {errors.general && (
                <div className="p-4 bg-red-400/20 backdrop-blur-xl border border-red-400/30 rounded-2xl">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              )}

              <GlassInput
                type="text"
                label="Nom complet"
                icon={<User className="w-5 h-5 text-purple-300" />}
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={errors.name}
                placeholder="Jean Dupont"
                fullWidth
              />

              <GlassInput
                type="email"
                label="Email professionnel"
                icon={<Mail className="w-5 h-5 text-purple-300" />}
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                placeholder="vous@entreprise.com"
                fullWidth
              />

              <GlassInput
                type="password"
                label="Mot de passe"
                icon={<Key className="w-5 h-5 text-purple-300" />}
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                fullWidth
              />

              <GlassInput
                type="password"
                label="Confirmer le mot de passe"
                icon={<Lock className="w-5 h-5 text-purple-300" />}
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                placeholder="••••••••"
                fullWidth
              />

              <div className="space-y-2">
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 sm:mt-1 rounded bg-white/50 border-white/50 shrink-0"
                    required
                  />
                  <span className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                    J'accepte les{' '}
                    <Link href="/terms" className="text-purple-600 hover:text-purple-700 underline">
                      CGU
                    </Link>{' '}
                    et la{' '}
                    <Link
                      href="/privacy"
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      confidentialité
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
          <div className="mt-4 sm:mt-8 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Déjà inscrit?{' '}
              <Link
                href="/login"
                className="font-bold text-transparent bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text hover:from-purple-700 hover:to-pink-700"
              >
                Connectez-vous
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-4 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4">
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/30 backdrop-blur-xl rounded-full text-xs font-medium text-gray-700">
              🔒 Sécurisé
            </div>
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/30 backdrop-blur-xl rounded-full text-xs font-medium text-gray-700 hidden sm:inline-flex">
              ✨ Sans engagement
            </div>
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/30 backdrop-blur-xl rounded-full text-xs font-medium text-gray-700">
              🚀 Rapide
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
