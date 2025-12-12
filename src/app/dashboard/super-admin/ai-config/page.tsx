/**
 * Page de configuration des services IA
 * Permet au Super-Admin de gérer les services IA (OpenAI, Anthropic, etc.)
 * IMPORTANT: ZERO any types
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePermissions } from '@/lib/rbac/usePermissions';
import { AIConfigStats, AIServiceCard } from '@/components/admin/ai-config';
import { AIConfigHeader } from '@/components/admin/ai-config-page/AIConfigHeader';
import { AIConfigSecurityNote } from '@/components/admin/ai-config-page/AIConfigSecurityNote';
import { useConfirm } from '@/hooks/ui/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAIConfig } from '@/hooks/admin/useAIConfig';

export default function AIConfigPage() {
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();
  const { ConfirmDialogProps, confirm } = useConfirm();

  const {
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
    handleDelete,
    getModelOptions,
  } = useAIConfig();

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.push('/dashboard');
    }
  }, [isSuperAdmin, router]);

  if (!isSuperAdmin()) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  const onDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Réinitialiser la configuration IA',
      message:
        'Êtes-vous sûr de vouloir réinitialiser la configuration IA ? Cette action est irréversible.',
      confirmText: 'Réinitialiser',
      cancelText: 'Annuler',
      variant: 'warning',
    });

    if (confirmed) {
      await handleDelete({ id });
    }
  };

  return (
    <div>
      <AIConfigHeader hasChanges={hasChanges} onReset={handleReset} />

      <AIConfigStats stats={stats} />

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
            onDelete={() => service.id && onDelete(service.id)}
          />
        ))}
      </div>

      <AIConfigSecurityNote />

      <ConfirmDialog {...ConfirmDialogProps} />
    </div>
  );
}
