/**
 * Section pour l'input de la clé API avec indicateur de clé enregistrée
 * ZERO any types
 */

'use client';

import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { AIServiceConfig } from '@/lib/types/ai-config.types';

interface AIApiKeySectionProps {
  service: AIServiceConfig;
  apiKey: string;
  showApiKey: boolean;
  onApiKeyChange: (_value: string) => void;
  onToggleShowApiKey: () => void;
}

export function AIApiKeySection({
  service,
  apiKey,
  showApiKey,
  onApiKeyChange,
  onToggleShowApiKey,
}: AIApiKeySectionProps) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#1f2937',
        }}
      >
        API Key
      </label>

      {/* Si clé existante en DB, afficher un indicateur */}
      {service.id && (
        <div
          style={{
            marginBottom: '8px',
            padding: '8px 12px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="#10b981" />
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: '600',
                color: '#10b981',
              }}
            >
              ✅ Clé API enregistrée
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#059669' }}>
              Laissez vide ci-dessous pour conserver la clé actuelle
            </p>
          </div>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <input
          type={showApiKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder={service.id ? 'Nouvelle clé (optionnel)' : 'sk-proj-... ou sk-ant-...'}
          style={{
            width: '100%',
            padding: '10px 12px',
            paddingRight: '40px',
            borderRadius: '8px',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            background: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            color: '#1f2937',
          }}
        />
        <button
          type="button"
          onClick={onToggleShowApiKey}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
          }}
        >
          {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
