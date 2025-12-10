/**
 * Magic Link Login Page
 * Connexion sans mot de passe via email
 * IMPORTANT: ZERO any types
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function MagicLinkPage() {
  const router = useRouter();

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
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📧</div>
          <h1
            style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}
          >
            Email envoyé !
          </h1>
          <p
            style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px', lineHeight: '1.6' }}
          >
            Nous avons envoyé un lien de connexion à <strong>{email}</strong>
          </p>
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <p style={{ color: '#065f46', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
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
            style={{
              background: 'transparent',
              color: '#9333ea',
              border: '1px solid #9333ea',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#9333ea';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#9333ea';
            }}
          >
            Renvoyer l'email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h1
            style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}
          >
            Magic Link
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Connectez-vous sans mot de passe</p>
        </div>

        {/* Avantages */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <p style={{ color: '#065f46', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
            ✨ Pourquoi Magic Link ?
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              color: '#047857',
              fontSize: '12px',
              lineHeight: '1.6',
            }}
          >
            <li>Aucun mot de passe à retenir</li>
            <li>Connexion ultra-rapide (1 clic)</li>
            <li>Sécurité maximale</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleMagicLink}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#9333ea';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
              }}
            >
              <p style={{ color: '#991b1b', fontSize: '13px', margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(147, 51, 234, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(147, 51, 234, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.4)';
            }}
          >
            {loading ? '📧 Envoi en cours...' : '🚀 Envoyer le Magic Link'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ margin: '24px 0', textAlign: 'center', position: 'relative' }}>
          <div style={{ borderTop: '1px solid #e5e7eb' }}></div>
          <span
            style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              padding: '0 12px',
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            ou
          </span>
        </div>

        {/* Links */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/login"
            style={{
              color: '#9333ea',
              fontSize: '14px',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            Se connecter avec un mot de passe
          </Link>
        </div>
      </div>
    </div>
  );
}
