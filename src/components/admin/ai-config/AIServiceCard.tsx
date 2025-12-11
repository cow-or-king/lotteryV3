/**
 * Composant principal qui assemble tous les éléments du service IA
 * ZERO any types
 */

'use client';

import { AIServiceConfig } from '@/lib/types/ai-config.types';
import { AIServiceHeader } from './AIServiceHeader';
import { AIApiKeySection } from './AIApiKeySection';
import { AIAdvancedSettings } from './AIAdvancedSettings';
import { AIServiceActions } from './AIServiceActions';

interface AIServiceCardProps {
  service: AIServiceConfig;
  showConfig: boolean;
  showApiKey: boolean;
  showAdvanced: boolean;
  isTesting: boolean;
  modelOptions: string[];
  onToggleShow: () => void;
  onToggleEnabled: () => void;
  onToggleShowApiKey: () => void;
  onToggleAdvanced: () => void;
  onApiKeyChange: (_value: string) => void;
  onModelChange: (_value: string) => void;
  onMaxTokensChange: (_value: number) => void;
  onTemperatureChange: (_value: number) => void;
  onSystemPromptChange: (_value: string) => void;
  onTest: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export function AIServiceCard({
  service,
  showConfig,
  showApiKey,
  showAdvanced,
  isTesting,
  modelOptions,
  onToggleShow,
  onToggleEnabled,
  onToggleShowApiKey,
  onToggleAdvanced,
  onApiKeyChange,
  onModelChange,
  onMaxTokensChange,
  onTemperatureChange,
  onSystemPromptChange,
  onTest,
  onSave,
  onDelete,
}: AIServiceCardProps) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: service.enabled
          ? '2px solid rgba(16, 185, 129, 0.3)'
          : '1px solid rgba(147, 51, 234, 0.2)',
        padding: '24px',
      }}
    >
      {/* Header du service */}
      <AIServiceHeader
        service={service}
        showConfig={showConfig}
        onToggleShow={onToggleShow}
        onToggleEnabled={onToggleEnabled}
      />

      {/* Configuration */}
      {showConfig && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* API Key */}
          <AIApiKeySection
            service={service}
            apiKey={service.apiKey}
            showApiKey={showApiKey}
            onApiKeyChange={onApiKeyChange}
            onToggleShowApiKey={onToggleShowApiKey}
          />

          {/* Model */}
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
              Modèle
            </label>
            <select
              value={service.model}
              onChange={(e) => onModelChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                background: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                color: '#1f2937',
              }}
            >
              {modelOptions.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Settings */}
          <AIAdvancedSettings
            model={service.model}
            maxTokens={service.maxTokens}
            temperature={service.temperature}
            systemPrompt={service.systemPrompt}
            modelOptions={modelOptions}
            showAdvanced={showAdvanced}
            onToggleAdvanced={onToggleAdvanced}
            onModelChange={onModelChange}
            onMaxTokensChange={onMaxTokensChange}
            onTemperatureChange={onTemperatureChange}
            onSystemPromptChange={onSystemPromptChange}
          />

          {/* Buttons */}
          <AIServiceActions
            service={service}
            isTesting={isTesting}
            onTest={onTest}
            onSave={onSave}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
}
