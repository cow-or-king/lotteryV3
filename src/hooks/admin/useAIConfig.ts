import { useState, useEffect } from 'react';
import { api } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { AIService, AIServiceConfig } from '@/components/admin/ai-config';

const DEFAULT_CONFIG: AIServiceConfig[] = [
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
];

export function useAIConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<AIServiceConfig[]>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [testingService, setTestingService] = useState<AIService | null>(null);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [showAdvanced, setShowAdvanced] = useState<{ [key: string]: boolean }>({});
  const [showConfig, setShowConfig] = useState<{ [key: string]: boolean }>({
    openai: false,
    anthropic: false,
  });

  const { data: configs, refetch } = api.admin.listAiConfigs.useQuery(undefined, {
    retry: false,
  });
  const { data: stats } = api.admin.getAiUsageStats.useQuery({});

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
        description: `${data.provider} / ${data.model} • ${data.tokensUsed} tokens utilisés`,
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

  useEffect(() => {
    if (configs && configs.length > 0) {
      const mergedConfig = config.map((defaultService) => {
        const dbConfig = configs.find((c) => c.provider === defaultService.service);
        if (dbConfig) {
          return {
            ...defaultService,
            id: dbConfig.id,
            enabled: dbConfig.isActive,
            apiKey: '',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configs]);

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
    setConfig(DEFAULT_CONFIG);
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

  const getModelOptions = (service: AIService): string[] => {
    if (service === 'openai') {
      return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    }
    return ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'];
  };

  return {
    config,
    stats,
    hasChanges,
    testingService,
    showApiKey,
    showAdvanced,
    showConfig,
    setShowConfig,
    setShowApiKey,
    setShowAdvanced,
    handleToggle,
    handleApiKeyChange,
    handleModelChange,
    handleMaxTokensChange,
    handleTemperatureChange,
    handleSystemPromptChange,
    handleSave,
    handleReset,
    handleTest,
    handleDelete: deleteMutation.mutateAsync,
    getModelOptions,
  };
}
