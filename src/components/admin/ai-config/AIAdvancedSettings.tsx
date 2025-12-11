/**
 * Accordion pour les paramètres avancés (model settings + system prompt)
 * ZERO any types
 */

'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { AIModelSettings } from './AIModelSettings';

interface AIAdvancedSettingsProps {
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  modelOptions: string[];
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  onModelChange: (_value: string) => void;
  onMaxTokensChange: (_value: number) => void;
  onTemperatureChange: (_value: number) => void;
  onSystemPromptChange: (_value: string) => void;
}

export function AIAdvancedSettings({
  model,
  maxTokens,
  temperature,
  systemPrompt,
  modelOptions,
  showAdvanced,
  onToggleAdvanced,
  onModelChange,
  onMaxTokensChange,
  onTemperatureChange,
  onSystemPromptChange,
}: AIAdvancedSettingsProps) {
  return (
    <div
      style={{
        background: 'rgba(147, 51, 234, 0.05)',
        borderRadius: '12px',
        padding: '12px',
        border: '1px solid rgba(147, 51, 234, 0.1)',
      }}
    >
      <button
        type="button"
        onClick={onToggleAdvanced}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#1f2937',
        }}
      >
        <span>⚙️ Paramètres avancés</span>
        {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {showAdvanced && (
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <AIModelSettings
            model={model}
            maxTokens={maxTokens}
            temperature={temperature}
            modelOptions={modelOptions}
            onModelChange={onModelChange}
            onMaxTokensChange={onMaxTokensChange}
            onTemperatureChange={onTemperatureChange}
          />

          {/* System Prompt */}
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
              System Prompt (optionnel)
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => onSystemPromptChange(e.target.value)}
              rows={4}
              placeholder="Prompt personnalisé (optionnel)"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                background: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                color: '#1f2937',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
