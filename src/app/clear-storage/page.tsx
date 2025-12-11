/**
 * Page de nettoyage du localStorage/cookies
 * Utile après changement de Supabase project
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearStoragePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'clearing' | 'done'>('clearing');

  useEffect(() => {
    const clearAll = async () => {
      try {
        // 1. Vider localStorage
        localStorage.clear();

        // 2. Vider sessionStorage
        sessionStorage.clear();

        // 3. Supprimer tous les cookies
        document.cookie.split(';').forEach((c) => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
        });

        setStatus('done');

        // 4. Rediriger après 2 secondes
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch {
        // Silently handle error and continue with redirect
        setStatus('done');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };

    clearAll();
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        {status === 'clearing' ? (
          <>
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #9333ea',
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite',
              }}
            />
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>
              Nettoyage en cours...
            </h1>
            <p style={{ color: '#6b7280' }}>Suppression des anciennes données de session</p>
          </>
        ) : (
          <>
            <div
              style={{
                width: '60px',
                height: '60px',
                background: '#10b981',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                color: 'white',
              }}
            >
              ✓
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>
              Nettoyage terminé !
            </h1>
            <p style={{ color: '#6b7280' }}>Redirection vers la page de connexion...</p>
          </>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
