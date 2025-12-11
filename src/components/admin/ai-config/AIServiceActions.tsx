/**
 * Boutons d'actions pour le service IA (Test, Sauvegarder, Supprimer)
 * ZERO any types
 */

'use client';

import { TestTube, Save, Trash2 } from 'lucide-react';
import { AIServiceConfig } from '@/lib/types/ai-config.types';

interface AIServiceActionsProps {
  service: AIServiceConfig;
  isTesting: boolean;
  onTest: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export function AIServiceActions({
  service,
  isTesting,
  onTest,
  onSave,
  onDelete,
}: AIServiceActionsProps) {
  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {/* Bouton Tester */}
      <button
        onClick={onTest}
        disabled={!service.apiKey || isTesting}
        style={{
          flex: 1,
          minWidth: '120px',
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          background: 'rgba(255, 255, 255, 0.6)',
          color: '#3b82f6',
          fontWeight: '500',
          fontSize: '14px',
          cursor: service.apiKey && !isTesting ? 'pointer' : 'not-allowed',
          opacity: service.apiKey && !isTesting ? 1 : 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s',
        }}
      >
        {isTesting ? (
          <>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid #3b82f6',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Test...
          </>
        ) : (
          <>
            <TestTube size={16} />
            Tester
          </>
        )}
      </button>

      {/* Bouton Sauvegarder */}
      <button
        onClick={onSave}
        style={{
          flex: 1,
          minWidth: '120px',
          padding: '10px 16px',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          fontWeight: '500',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        }}
      >
        <Save size={16} />
        {service.id ? 'Mettre à jour' : 'Sauvegarder'}
      </button>

      {/* Bouton Supprimer (si service existe en DB) */}
      {service.id && (
        <button
          onClick={onDelete}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(255, 255, 255, 0.6)',
            color: '#ef4444',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <Trash2 size={16} />
          Supprimer
        </button>
      )}

      <style>
        {`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        `}
      </style>
    </div>
  );
}
