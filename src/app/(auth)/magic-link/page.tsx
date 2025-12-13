/**
 * Magic Link Login Page
 * Connexion sans mot de passe via email
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function MagicLinkPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (magicLinkError) {
        setError(magicLinkError.message);
      } else {
        setEmailSent(true);
      }
    } catch (_err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 to-purple-700 p-5">
        <div className="bg-white rounded-2xl p-10 max-w-lg w-full shadow-2xl text-center">
          <div className="text-6xl mb-5">📧</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Email envoyé !</h1>
          <p className="text-gray-600 text-base mb-6 leading-relaxed">
            Nous avons envoyé un lien de connexion à <strong>{email}</strong>
          </p>
          <div className="bg-green-50 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-900 text-sm m-0 leading-normal">
              ✅ Cliquez sur le lien dans l'email pour vous connecter automatiquement.
              <br />
              ⏱️ Le lien expire dans 1 heure.
            </p>
          </div>
          <button
            onClick={() => {
              setEmailSent(false);
              setEmail('');
            }}
            className="bg-transparent text-purple-600 border border-purple-600 px-6 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-purple-600 hover:text-white"
          >
            Renvoyer l'email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 to-purple-700 p-5">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Magic Link</h1>
          <p className="text-gray-600 text-sm">Connectez-vous sans mot de passe</p>
        </div>

        {/* Avantages */}
        <div className="bg-green-50 border border-green-500 rounded-lg p-4 mb-6">
          <p className="text-green-900 text-xs font-semibold mb-2">✨ Pourquoi Magic Link ?</p>
          <ul className="m-0 pl-5 text-green-800 text-xs leading-relaxed">
            <li>Aucun mot de passe à retenir</li>
            <li>Connexion ultra-rapide (1 clic)</li>
            <li>Sécurité maximale</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleMagicLink}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-500 rounded-lg p-3 mb-5">
              <p className="text-red-900 text-xs m-0">⚠️ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-br from-purple-600 to-pink-600 text-white border-0 px-4 py-3.5 rounded-lg text-base font-semibold cursor-pointer transition-all shadow-lg shadow-purple-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '📧 Envoi en cours...' : '🚀 Envoyer le Magic Link'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 text-center relative">
          <div className="border-t border-gray-200"></div>
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-3 text-xs text-gray-600">
            ou
          </span>
        </div>

        {/* Links */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-purple-600 text-sm no-underline font-medium hover:text-purple-700"
          >
            Se connecter avec un mot de passe
          </Link>
        </div>
      </div>
    </div>
  );
}
