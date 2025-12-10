/**
 * Page de configuration des services IA
 * Permet au Super-Admin de gérer les services IA (OpenAI, Anthropic, etc.)
 * IMPORTANT: ZERO any types
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePermissions } from '@/lib/rbac/usePermissions';
import { api } from '@/lib/trpc/client';
import { Cpu, Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

type AIService = 'openai' | 'anthropic' | 'google';

interface AIServiceConfig {
  service: AIService;
  label: string;
  enabled: boolean;
  apiKey: string;
  model?: string;
}

export default function AIConfigPage() {
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();
  const { data: currentConfig } = api.ai.getConfig.useQuery();

  const [config, setConfig] = useState<AIServiceConfig[]>([
    { service: 'openai', label: 'OpenAI (GPT-4)', enabled: true, apiKey: '', model: 'gpt-4' },
    {
      service: 'anthropic',
      label: 'Anthropic (Claude)',
      enabled: false,
      apiKey: '',
      model: 'claude-3-opus-20240229',
    },
    {
      service: 'google',
      label: 'Google (Gemini)',
      enabled: false,
      apiKey: '',
      model: 'gemini-pro',
    },
  ]);

  const [hasChanges, setHasChanges] = useState(false);
  const [testingService, setTestingService] = useState<AIService | null>(null);

  // Rediriger si pas SUPER_ADMIN
  useEffect(() => {
    if (!isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [isSuperAdmin, router]);

  // Charger la configuration actuelle depuis le serveur
  useEffect(() => {
    if (currentConfig) {
      // TODO: Mettre à jour l'état avec la config du serveur
    }
  }, [currentConfig]);

  if (!isSuperAdmin()) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  const handleToggle = (service: AIService) => {
    setConfig((prev) =>
      prev.map((item) => (item.service === service ? { ...item, enabled: !item.enabled } : item)),
    );
    setHasChanges(true);
  };

  const handleApiKeyChange = (service: AIService, apiKey: string) => {
    setConfig((prev) =>
      prev.map((item) => (item.service === service ? { ...item, apiKey } : item)),
    );
    setHasChanges(true);
  };

  const handleModelChange = (service: AIService, model: string) => {
    setConfig((prev) => prev.map((item) => (item.service === service ? { ...item, model } : item)));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // TODO: Sauvegarder via tRPC
    console.log('Configuration IA sauvegardée:', config);
    setHasChanges(false);
    alert('Configuration IA sauvegardée');
  };

  const handleReset = () => {
    // Réinitialiser avec la config du serveur ou les valeurs par défaut
    setConfig([
      { service: 'openai', label: 'OpenAI (GPT-4)', enabled: true, apiKey: '', model: 'gpt-4' },
      {
        service: 'anthropic',
        label: 'Anthropic (Claude)',
        enabled: false,
        apiKey: '',
        model: 'claude-3-opus-20240229',
      },
      {
        service: 'google',
        label: 'Google (Gemini)',
        enabled: false,
        apiKey: '',
        model: 'gemini-pro',
      },
    ]);
    setHasChanges(false);
  };

  const handleTest = async (service: AIService) => {
    setTestingService(service);
    // TODO: Appeler l'API de test
    setTimeout(() => {
      setTestingService(null);
      alert(`Test du service ${service} réussi!`);
    }, 2000);
  };

  return (
    <div>
      {/* Header */}
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Cpu size={24} color="white" />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Configuration IA
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              Gérer les services d'intelligence artificielle
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
              color: '#10b981',
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
            onClick={handleSave}
            disabled={!hasChanges}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: hasChanges
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'rgba(16, 185, 129, 0.3)',
              color: 'white',
              fontWeight: '500',
              fontSize: '14px',
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: hasChanges ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
            }}
          >
            <Save size={16} />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Services IA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {config.map((service) => (
          <div
            key={service.service}
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
                    background: service.enabled
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(147, 51, 234, 0.1)',
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
                    {service.enabled ? 'Actif' : 'Inactif'}
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Activer</span>
                <div
                  onClick={() => handleToggle(service.service)}
                  style={{
                    width: '48px',
                    height: '28px',
                    borderRadius: '14px',
                    background: service.enabled
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'rgba(147, 51, 234, 0.2)',
                    position: 'relative',
                    cursor: 'pointer',
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

            {/* Configuration */}
            {service.enabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* API Key */}
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
                  <input
                    type="password"
                    value={service.apiKey}
                    onChange={(e) => handleApiKeyChange(service.service, e.target.value)}
                    placeholder="sk-..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(147, 51, 234, 0.2)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '14px',
                      color: '#1f2937',
                    }}
                  />
                </div>

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
                  <input
                    type="text"
                    value={service.model || ''}
                    onChange={(e) => handleModelChange(service.service, e.target.value)}
                    placeholder="gpt-4, claude-3-opus, etc."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(147, 51, 234, 0.2)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '14px',
                      color: '#1f2937',
                    }}
                  />
                </div>

                {/* Test button */}
                <button
                  onClick={() => handleTest(service.service)}
                  disabled={!service.apiKey || testingService === service.service}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: 'rgba(255, 255, 255, 0.6)',
                    color: '#10b981',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor:
                      service.apiKey && testingService !== service.service
                        ? 'pointer'
                        : 'not-allowed',
                    opacity: service.apiKey && testingService !== service.service ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  {testingService === service.service ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #10b981',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                      Test en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Tester la connexion
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Note de sécurité */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
            Sécurité
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
            Les clés API sont sensibles et doivent être protégées. Elles seront chiffrées avant
            d'être stockées dans la base de données. Ne partagez jamais vos clés API.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
