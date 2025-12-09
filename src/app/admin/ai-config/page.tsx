/**
 * Page Admin - Configuration IA
 * Interface super-admin pour configurer les services IA (OpenAI/Anthropic)
 * IMPORTANT: ZERO any types, Protected route, Mobile-first
 */

'use client';

import { api } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Plus,
  Trash2,
  Power,
  TestTube,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  XCircle,
  BarChart3,
} from 'lucide-react';

type Provider = 'openai' | 'anthropic';

interface ConfigFormData {
  provider: Provider;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

export default function AiConfigPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [showForm, setShowForm] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ConfigFormData>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: '',
  });

  // Queries
  const { data: configs, refetch } = api.admin.listAiConfigs.useQuery(undefined, {
    retry: false,
    onError: (error) => {
      if (error.data?.code === 'FORBIDDEN') {
        toast({
          title: 'Accès refusé',
          description: 'Vous devez être super-administrateur.',
          variant: 'error',
        });
        router.push('/dashboard');
      }
    },
  });

  const { data: stats } = api.admin.getAiUsageStats.useQuery({});

  // Mutations
  const createMutation = api.admin.createAiConfig.useMutation({
    onSuccess: () => {
      toast({ title: 'Configuration créée', description: 'Service IA configuré avec succès.' });
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const updateMutation = api.admin.updateAiConfig.useMutation({
    onSuccess: () => {
      toast({ title: 'Configuration mise à jour', description: 'Modifications enregistrées.' });
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const activateMutation = api.admin.activateAiConfig.useMutation({
    onSuccess: () => {
      toast({ title: 'Configuration activée', description: 'Service IA maintenant actif.' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const deactivateMutation = api.admin.deactivateAiConfig.useMutation({
    onSuccess: () => {
      toast({ title: 'Configuration désactivée', description: 'Service IA désactivé.' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const deleteMutation = api.admin.deleteAiConfig.useMutation({
    onSuccess: () => {
      toast({ title: 'Configuration supprimée', description: 'Configuration IA retirée.' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'error' });
    },
  });

  const testMutation = api.admin.testAiConnection.useMutation({
    onSuccess: (data) => {
      toast({
        title: '✅ Connexion réussie',
        description: `${data.provider} / ${data.model} · ${data.tokensUsed} tokens`,
      });
    },
    onError: (error) => {
      toast({ title: '❌ Test échoué', description: error.message, variant: 'error' });
    },
  });

  // Handlers
  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.7,
      systemPrompt: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
        apiKey: formData.apiKey || undefined,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleTest = () => {
    if (!formData.apiKey || !formData.model) {
      toast({
        title: 'Champs manquants',
        description: 'API Key et Model requis pour tester.',
        variant: 'error',
      });
      return;
    }

    testMutation.mutate({
      provider: formData.provider,
      apiKey: formData.apiKey,
      model: formData.model,
    });
  };

  const handleActivate = (id: string) => {
    activateMutation.mutate({ id });
  };

  const handleDeactivate = (id: string) => {
    deactivateMutation.mutate({ id });
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette configuration ?')) {
      deleteMutation.mutate({ id });
    }
  };

  const getModelOptions = (provider: Provider): string[] => {
    if (provider === 'openai') {
      return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    }
    return ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'];
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              Configuration IA
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Gérer les services d&apos;intelligence artificielle (OpenAI / Anthropic)
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle configuration
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white/60 backdrop-blur-lg rounded-xl border border-purple-200 shadow-sm">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">Requêtes totales</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-lg rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Utilisées</p>
                  <p className="text-xl font-bold text-gray-900">{stats.usedRequests}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-lg rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Tokens</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalTokens.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-lg rounded-xl border border-yellow-200 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-xs text-gray-600">Coût estimé</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${stats.totalCostUsd.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-purple-200 shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Modifier' : 'Créer'} une configuration
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Provider */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Provider IA
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        provider: 'openai',
                        model: 'gpt-4o-mini',
                      });
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.provider === 'openai'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold">OpenAI</div>
                    <div className="text-xs text-gray-600">GPT-4, GPT-3.5</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        provider: 'anthropic',
                        model: 'claude-3-5-sonnet-20241022',
                      });
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.provider === 'anthropic'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold">Anthropic</div>
                    <div className="text-xs text-gray-600">Claude 3.5</div>
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  API Key {editingId && "(laisser vide pour garder l'actuelle)"}
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder={editingId ? '(optionnel)' : 'sk-...'}
                    required={!editingId}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Modèle</label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                >
                  {getModelOptions(formData.provider).map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Advanced settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={formData.maxTokens}
                    onChange={(e) =>
                      setFormData({ ...formData, maxTokens: parseInt(e.target.value) })
                    }
                    min="100"
                    max="4000"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Temperature
                  </label>
                  <input
                    type="number"
                    value={formData.temperature}
                    onChange={(e) =>
                      setFormData({ ...formData, temperature: parseFloat(e.target.value) })
                    }
                    min="0"
                    max="2"
                    step="0.1"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  System Prompt (optionnel)
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                  placeholder="Prompt personnalisé (optionnel, par défaut le système utilise un prompt optimisé)"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testMutation.isPending}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <TestTube className="w-5 h-5" />
                  {testMutation.isPending ? 'Test...' : 'Tester la connexion'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Enregistrement...'
                    : editingId
                      ? 'Mettre à jour'
                      : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Configurations List */}
        <div className="space-y-4">
          {configs?.map((config) => (
            <div
              key={config.id}
              className={`p-4 sm:p-6 bg-white/60 backdrop-blur-lg rounded-2xl border-2 shadow-lg transition-all ${
                config.isActive ? 'border-green-400 bg-green-50/30' : 'border-purple-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900 capitalize">
                      {config.provider}
                    </h3>
                    {config.isActive ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Actif
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Inactif
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Modèle: <span className="font-medium">{config.model}</span> · API:{' '}
                    <span className="font-mono text-xs">{config.apiKey}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {config.totalRequestsCount} requêtes · {config.totalTokensUsed.toLocaleString()}{' '}
                    tokens
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {config.isActive ? (
                    <button
                      onClick={() => handleDeactivate(config.id)}
                      disabled={deactivateMutation.isPending}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-all text-sm flex items-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      Désactiver
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(config.id)}
                      disabled={activateMutation.isPending}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-all text-sm flex items-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      Activer
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(config.id)}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-all text-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}

          {configs?.length === 0 && (
            <div className="text-center py-12 bg-white/60 backdrop-blur-lg rounded-2xl border border-purple-200">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune configuration IA pour le moment.</p>
              <p className="text-sm text-gray-500 mt-1">
                Créez une configuration pour activer les suggestions IA.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
