/**
 * Header de la page de configuration des menus
 * IMPORTANT: ZERO any types
 */

'use client';

import { Settings, Save, RotateCcw } from 'lucide-react';

interface MenuConfigHeaderProps {
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function MenuConfigHeader({ hasChanges, onSave, onReset }: MenuConfigHeaderProps) {
  return (
    <div
      style={{
        marginBottom: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
          }}
        >
          <Settings size={24} color="white" />
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(20px, 4vw, 28px)',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Gestion des Menus
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Configurer la visibilité des menus par rôle
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onReset}
          disabled={!hasChanges}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            color: '#9333ea',
            fontWeight: '500',
            fontSize: '14px',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            opacity: hasChanges ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <RotateCcw size={16} />
          Réinitialiser
        </button>
        <button
          onClick={onSave}
          disabled={!hasChanges}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            background: hasChanges
              ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'
              : 'rgba(147, 51, 234, 0.3)',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: hasChanges ? '0 4px 12px rgba(147, 51, 234, 0.3)' : 'none',
          }}
        >
          <Save size={16} />
          Sauvegarder
        </button>
      </div>
    </div>
  );
}
