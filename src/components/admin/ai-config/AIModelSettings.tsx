/**
 * Section pour les paramètres du modèle (model, maxTokens, temperature)
 * ZERO any types
 */

'use client';

interface AIModelSettingsProps {
  model: string;
  maxTokens: number;
  temperature: number;
  modelOptions: string[];
  onModelChange: (_value: string) => void;
  onMaxTokensChange: (_value: number) => void;
  onTemperatureChange: (_value: number) => void;
}

export function AIModelSettings({
  model,
  maxTokens,
  temperature,
  modelOptions,
  onModelChange,
  onMaxTokensChange,
  onTemperatureChange,
}: AIModelSettingsProps) {
  return (
    <>
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
          value={model}
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
          {modelOptions.map((modelOption) => (
            <option key={modelOption} value={modelOption}>
              {modelOption}
            </option>
          ))}
        </select>
      </div>

      {/* Max Tokens */}
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
          Max Tokens: {maxTokens}
        </label>
        <input
          type="range"
          min="100"
          max="4000"
          step="100"
          value={maxTokens}
          onChange={(e) => onMaxTokensChange(parseInt(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#10b981',
          }}
        />
        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
          Recommandé: 500-1000 tokens
        </p>
      </div>

      {/* Temperature */}
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
          Temperature: {temperature}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#10b981',
          }}
        />
      </div>
    </>
  );
}
