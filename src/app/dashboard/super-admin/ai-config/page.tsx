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
import {
  Cpu,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Sparkles,
  TestTube,
  Trash2,
} from 'lucide-react';

type AIService = 'openai' | 'anthropic';

interface AIServiceConfig {
  id?: string;
  service: AIService;
  label: string;
  enabled: boolean;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  isActive?: boolean;
  totalRequestsCount?: number;
  totalTokensUsed?: number;
}

export default function AIConfigPage() {
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();

  // Queries
  const { data: configs, refetch } = api.admin.listAiConfigs.useQuery(undefined, {
    retry: false,
  });
  const { data: stats } = api.admin.getAiUsageStats.useQuery({});

  // Mutations
  const createMutation = api.admin.createAiConfig.useMutation({
    onSuccess: () => {
      refetch();
      setHasChanges(false);
      alert('✅ Configuration créée avec succès');
    },
    onError: (error) => {
      alert('❌ Erreur: ' + error.message);
    },
  });

  const updateMutation = api.admin.updateAiConfig.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      setHasChanges(false);
      alert('✅ Configuration mise à jour');
    },
    onError: (error) => {
      alert('❌ Erreur: ' + error.message);
    },
  });

  const activateMutation = api.admin.activateAiConfig.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deactivateMutation = api.admin.deactivateAiConfig.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = api.admin.deleteAiConfig.useMutation({
    onSuccess: () => {
      refetch();
      alert('Configuration supprimée');
    },
  });

  const testMutation = api.admin.testAiConnection.useMutation({
    onSuccess: (data) => {
      alert(`✅ Connexion réussie\n${data.provider} / ${data.model} · ${data.tokensUsed} tokens`);
    },
    onError: (error) => {
      alert('❌ Test échoué: ' + error.message);
    },
  });

  const [config, setConfig] = useState<AIServiceConfig[]>([
    {
      service: 'openai',
      label: 'OpenAI (GPT-4)',
      enabled: true,
      apiKey: '',
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.7,
      systemPrompt: '',
    },
    {
      service: 'anthropic',
      label: 'Anthropic (Claude)',
      enabled: false,
      apiKey: '',
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1000,
      temperature: 0.7,
      systemPrompt: '',
    },
  ]);

  const [hasChanges, setHasChanges] = useState(false);
  const [testingService, setTestingService] = useState<AIService | null>(null);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [showAdvanced, setShowAdvanced] = useState<{ [key: string]: boolean }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<{ [key: string]: boolean }>({
    openai: false,
    anthropic: false,
  });

  // Rediriger si pas SUPER_ADMIN
  useEffect(() => {
    if (!isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [isSuperAdmin, router]);

  // Charger la configuration actuelle depuis le serveur
  useEffect(() => {
    if (configs && configs.length > 0) {
      const mergedConfig = config.map((defaultService) => {
        const dbConfig = configs.find((c) => c.provider === defaultService.service);
        if (dbConfig) {
          return {
            ...defaultService,
            id: dbConfig.id,
            enabled: dbConfig.isActive,
            apiKey: '', // Ne pas afficher la vraie clé
            model: dbConfig.model,
            maxTokens: dbConfig.maxTokens,
            temperature: dbConfig.temperature,
            systemPrompt: dbConfig.systemPrompt || '',
            isActive: dbConfig.isActive,
            totalRequestsCount: dbConfig.totalRequestsCount,
            totalTokensUsed: dbConfig.totalTokensUsed,
          };
        }
        return defaultService;
      });
      setConfig(mergedConfig);
    }
  }, [configs]);

  if (!isSuperAdmin()) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  const handleToggle = (service: AIService) => {
    const serviceConfig = config.find((s) => s.service === service);
    if (serviceConfig?.id) {
      // Si déjà en DB, activer/désactiver via mutation
      if (serviceConfig.enabled) {
        deactivateMutation.mutate({ id: serviceConfig.id });
      } else {
        // Activer ce service (l'API désactivera automatiquement l'autre)
        activateMutation.mutate({ id: serviceConfig.id });
      }
    } else {
      // Service pas encore sauvegardé en DB
      alert("⚠️ Veuillez d'abord sauvegarder la configuration avant de l'activer.");
    }
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

  const handleMaxTokensChange = (service: AIService, maxTokens: number) => {
    setConfig((prev) =>
      prev.map((item) => (item.service === service ? { ...item, maxTokens } : item)),
    );
    setHasChanges(true);
  };

  const handleTemperatureChange = (service: AIService, temperature: number) => {
    setConfig((prev) =>
      prev.map((item) => (item.service === service ? { ...item, temperature } : item)),
    );
    setHasChanges(true);
  };

  const handleSystemPromptChange = (service: AIService, systemPrompt: string) => {
    setConfig((prev) =>
      prev.map((item) => (item.service === service ? { ...item, systemPrompt } : item)),
    );
    setHasChanges(true);
  };

  const handleSave = async (service: AIService) => {
    const serviceConfig = config.find((s) => s.service === service);
    if (!serviceConfig) return;

    if (serviceConfig.id) {
      // Update existant
      await updateMutation.mutateAsync({
        id: serviceConfig.id,
        provider: serviceConfig.service,
        apiKey: serviceConfig.apiKey || undefined,
        model: serviceConfig.model,
        maxTokens: serviceConfig.maxTokens,
        temperature: serviceConfig.temperature,
        systemPrompt: serviceConfig.systemPrompt,
      });
    } else {
      // Créer nouveau
      await createMutation.mutateAsync({
        provider: serviceConfig.service,
        apiKey: serviceConfig.apiKey,
        model: serviceConfig.model,
        maxTokens: serviceConfig.maxTokens,
        temperature: serviceConfig.temperature,
        systemPrompt: serviceConfig.systemPrompt,
      });
    }
  };

  const handleReset = () => {
    setConfig([
      {
        service: 'openai',
        label: 'OpenAI (GPT-4)',
        enabled: true,
        apiKey: '',
        model: 'gpt-4o-mini',
        maxTokens: 1000,
        temperature: 0.7,
        systemPrompt: '',
      },
      {
        service: 'anthropic',
        label: 'Anthropic (Claude)',
        enabled: false,
        apiKey: '',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 1000,
        temperature: 0.7,
        systemPrompt: '',
      },
    ]);
    setHasChanges(false);
    setEditingId(null);
  };

  const handleTest = async (service: AIService) => {
    const serviceConfig = config.find((s) => s.service === service);
    if (!serviceConfig || !serviceConfig.apiKey) {
      alert('API Key manquante');
      return;
    }

    setTestingService(service);
    await testMutation.mutateAsync({
      provider: service,
      apiKey: serviceConfig.apiKey,
      model: serviceConfig.model,
    });
    setTestingService(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette configuration ?')) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const getModelOptions = (service: AIService): string[] => {
    if (service === 'openai') {
      return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    }
    return ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'];
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
              Gérer les services d&apos;intelligence artificielle
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
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              border: '1px solid rgba(147, 51, 234, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarChart3 size={32} color="#9333ea" />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Requêtes totales</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  {stats.totalRequests}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={32} color="#10b981" />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Utilisées</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  {stats.usedRequests}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles size={32} color="#3b82f6" />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Tokens</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  {stats.totalTokens.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              border: '1px solid rgba(234, 179, 8, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>💰</span>
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Coût estimé</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  ${stats.totalCostUsd.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  onClick={() =>
                    setShowConfig((prev) => ({
                      ...prev,
                      [service.service]: !prev[service.service],
                    }))
                  }
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
                  {showConfig[service.service] ? '▲ Masquer' : '▼ Configurer'}
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
                    onClick={() => handleToggle(service.service)}
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

            {/* Configuration */}
            {showConfig[service.service] && (
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
                      type={showApiKey[service.service] ? 'text' : 'password'}
                      value={service.apiKey}
                      onChange={(e) => handleApiKeyChange(service.service, e.target.value)}
                      placeholder={
                        service.id ? 'Nouvelle clé (optionnel)' : 'sk-proj-... ou sk-ant-...'
                      }
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
                      onClick={() =>
                        setShowApiKey((prev) => ({
                          ...prev,
                          [service.service]: !prev[service.service],
                        }))
                      }
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
                      {showApiKey[service.service] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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
                  <select
                    value={service.model}
                    onChange={(e) => handleModelChange(service.service, e.target.value)}
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
                    {getModelOptions(service.service).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Advanced Settings - Accordéon */}
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
                    onClick={() =>
                      setShowAdvanced((prev) => ({
                        ...prev,
                        [service.service]: !prev[service.service],
                      }))
                    }
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
                    {showAdvanced[service.service] ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>

                  {showAdvanced[service.service] && (
                    <div
                      style={{
                        marginTop: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                      }}
                    >
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
                          Max Tokens: {service.maxTokens}
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="4000"
                          step="100"
                          value={service.maxTokens}
                          onChange={(e) =>
                            handleMaxTokensChange(service.service, parseInt(e.target.value))
                          }
                          style={{
                            width: '100%',
                            accentColor: '#10b981',
                          }}
                        />
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
                          Temperature: {service.temperature}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={service.temperature}
                          onChange={(e) =>
                            handleTemperatureChange(service.service, parseFloat(e.target.value))
                          }
                          style={{
                            width: '100%',
                            accentColor: '#10b981',
                          }}
                        />
                      </div>

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
                          value={service.systemPrompt}
                          onChange={(e) =>
                            handleSystemPromptChange(service.service, e.target.value)
                          }
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

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleTest(service.service)}
                    disabled={!service.apiKey || testingService === service.service}
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
                      cursor:
                        service.apiKey && testingService !== service.service
                          ? 'pointer'
                          : 'not-allowed',
                      opacity: service.apiKey && testingService !== service.service ? 1 : 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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

                  <button
                    onClick={() => handleSave(service.service)}
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

                  {service.id && (
                    <button
                      onClick={() => handleDelete(service.id!)}
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
                </div>
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
            d&apos;être stockées dans la base de données. Ne partagez jamais vos clés API.
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
