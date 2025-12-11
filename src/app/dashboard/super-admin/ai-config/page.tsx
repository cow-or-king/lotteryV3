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
import { Cpu, RotateCcw, AlertCircle } from 'lucide-react';
import {
  AIConfigStats,
  AIServiceCard,
  AIService,
  AIServiceConfig,
} from '@/components/admin/ai-config';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/ui/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function AIConfigPage() {
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();
  const { toast } = useToast();

  // Hook de confirmation
  const { ConfirmDialogProps, confirm } = useConfirm();

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
      toast({
        title: 'Configuration créée',
        description: 'La configuration a été créée avec succès',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const updateMutation = api.admin.updateAiConfig.useMutation({
    onSuccess: () => {
      refetch();
      setHasChanges(false);
      toast({
        title: 'Configuration mise à jour',
        description: 'Les modifications ont été enregistrées',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'error',
      });
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
      toast({
        title: 'Configuration supprimée',
        description: 'La configuration a été supprimée avec succès',
        variant: 'success',
      });
    },
  });

  const testMutation = api.admin.testAiConnection.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Connexion réussie',
        description: `${data.provider} / ${data.model} · ${data.tokensUsed} tokens utilisés`,
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Test échoué',
        description: error.message,
        variant: 'error',
      });
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
    // Note: `config` is intentionally excluded from deps to avoid infinite loop
    // This effect should only run when server data (`configs`) changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (serviceConfig.enabled) {
        deactivateMutation.mutate({ id: serviceConfig.id });
      } else {
        activateMutation.mutate({ id: serviceConfig.id });
      }
    } else {
      toast({
        title: 'Configuration non sauvegardée',
        description: "Veuillez d'abord sauvegarder la configuration avant de l'activer",
        variant: 'warning',
      });
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
    if (!serviceConfig) {
      return;
    }

    if (serviceConfig.id) {
      await updateMutation.mutateAsync({
        id: serviceConfig.id,
        apiKey: serviceConfig.apiKey || undefined,
        model: serviceConfig.model,
        maxTokens: serviceConfig.maxTokens,
        temperature: serviceConfig.temperature,
        systemPrompt: serviceConfig.systemPrompt,
      });
    } else {
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
  };

  const handleTest = async (service: AIService) => {
    const serviceConfig = config.find((s) => s.service === service);
    if (!serviceConfig || !serviceConfig.apiKey) {
      toast({
        title: 'API Key manquante',
        description: 'Veuillez saisir une clé API avant de tester la connexion',
        variant: 'warning',
      });
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
    const confirmed = await confirm({
      title: 'Réinitialiser la configuration IA',
      message:
        'Êtes-vous sûr de vouloir réinitialiser la configuration IA ? Cette action est irréversible.',
      confirmText: 'Réinitialiser',
      cancelText: 'Annuler',
      variant: 'warning',
    });

    if (confirmed) {
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
      <AIConfigStats stats={stats} />

      {/* Services IA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {config.map((service) => (
          <AIServiceCard
            key={service.service}
            service={service}
            showConfig={showConfig[service.service] || false}
            showApiKey={showApiKey[service.service] || false}
            showAdvanced={showAdvanced[service.service] || false}
            isTesting={testingService === service.service}
            modelOptions={getModelOptions(service.service)}
            onToggleShow={() =>
              setShowConfig((prev) => ({
                ...prev,
                [service.service]: !prev[service.service],
              }))
            }
            onToggleEnabled={() => handleToggle(service.service)}
            onToggleShowApiKey={() =>
              setShowApiKey((prev) => ({
                ...prev,
                [service.service]: !prev[service.service],
              }))
            }
            onToggleAdvanced={() =>
              setShowAdvanced((prev) => ({
                ...prev,
                [service.service]: !prev[service.service],
              }))
            }
            onApiKeyChange={(value) => handleApiKeyChange(service.service, value)}
            onModelChange={(value) => handleModelChange(service.service, value)}
            onMaxTokensChange={(value) => handleMaxTokensChange(service.service, value)}
            onTemperatureChange={(value) => handleTemperatureChange(service.service, value)}
            onSystemPromptChange={(value) => handleSystemPromptChange(service.service, value)}
            onTest={() => handleTest(service.service)}
            onSave={() => handleSave(service.service)}
            onDelete={() => service.id && handleDelete(service.id)}
          />
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

      {/* Confirm Dialog */}
      <ConfirmDialog {...ConfirmDialogProps} />
    </div>
  );
}
