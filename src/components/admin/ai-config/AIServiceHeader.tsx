/**
 * Header du service IA avec statut, stats, et boutons
 * ZERO any types
 */

'use client';

import { Cpu } from 'lucide-react';
import { AIServiceConfig } from '@/lib/types/ai-config.types';

interface AIServiceHeaderProps {
  service: AIServiceConfig;
  showConfig: boolean;
  onToggleShow: () => void;
  onToggleEnabled: () => void;
}

export function AIServiceHeader({
  service,
  showConfig,
  onToggleShow,
  onToggleEnabled,
}: AIServiceHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: service.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(147, 51, 234, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: service.enabled ? '#10b981' : '#9333ea',
          }}
        >
          <Cpu size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            {service.label}
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            {service.enabled ? '✅ Actif' : '⚪ Inactif'}
            {service.totalRequestsCount !== undefined &&
              ` · ${service.totalRequestsCount} requêtes · ${service.totalTokensUsed?.toLocaleString()} tokens`}
          </p>
        </div>
      </div>

      {/* Actions - Boutons Afficher/Toggle */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Bouton Afficher/Masquer Config */}
        <button
          onClick={onToggleShow}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            background: 'rgba(255, 255, 255, 0.6)',
            color: '#6b7280',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {showConfig ? '▲ Masquer' : '▼ Configurer'}
        </button>

        {/* Toggle Activer/Désactiver */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: service.id ? 'pointer' : 'not-allowed',
            userSelect: 'none',
            opacity: service.id ? 1 : 0.5,
          }}
          title={service.id ? '' : "Sauvegardez d'abord la configuration"}
        >
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Activer</span>
          <div
            onClick={onToggleEnabled}
            style={{
              width: '48px',
              height: '28px',
              borderRadius: '14px',
              background: service.enabled
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'rgba(147, 51, 234, 0.2)',
              position: 'relative',
              cursor: service.id ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '10px',
                background: 'white',
                position: 'absolute',
                top: '4px',
                left: service.enabled ? '24px' : '4px',
                transition: 'all 0.3s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            />
          </div>
        </label>
      </div>
    </div>
  );
}
