# AI Config Components

Composants React réutilisables pour la configuration des services d'intelligence artificielle.

## Structure

```
ai-config/
├── types.ts                    # Types TypeScript partagés
├── index.ts                    # Exports centralisés
├── AIConfigStats.tsx           # Cartes de statistiques
├── AIServiceHeader.tsx         # Header du service
├── AIApiKeySection.tsx         # Section API Key
├── AIModelSettings.tsx         # Paramètres du modèle
├── AIAdvancedSettings.tsx      # Paramètres avancés
├── AIServiceActions.tsx        # Boutons d'actions
└── AIServiceCard.tsx           # Carte principale
```

## Installation

Ces composants sont déjà intégrés dans le projet. Pour les utiliser :

```typescript
import {
  AIConfigStats,
  AIServiceCard,
  AIService,
  AIServiceConfig,
} from '@/components/admin/ai-config';
```

## Composants

### 1. AIConfigStats

Affiche les statistiques d'utilisation de l'IA.

**Props:**

```typescript
interface AIConfigStatsProps {
  stats: AIUsageStats | undefined;
}
```

**Exemple:**

```tsx
<AIConfigStats stats={stats} />
```

### 2. AIServiceHeader

Header du service avec toggle activer/désactiver.

**Props:**

```typescript
interface AIServiceHeaderProps {
  service: AIServiceConfig;
  showConfig: boolean;
  onToggleShow: () => void;
  onToggleEnabled: () => void;
}
```

### 3. AIApiKeySection

Section pour l'input de la clé API.

**Props:**

```typescript
interface AIApiKeySectionProps {
  service: AIServiceConfig;
  apiKey: string;
  showApiKey: boolean;
  onApiKeyChange: (value: string) => void;
  onToggleShowApiKey: () => void;
}
```

### 4. AIModelSettings

Paramètres du modèle (model, maxTokens, temperature).

**Props:**

```typescript
interface AIModelSettingsProps {
  service: AIServiceConfig;
  model: string;
  maxTokens: number;
  temperature: number;
  modelOptions: string[];
  onModelChange: (value: string) => void;
  onMaxTokensChange: (value: number) => void;
  onTemperatureChange: (value: number) => void;
}
```

### 5. AIAdvancedSettings

Accordion pour les paramètres avancés.

**Props:**

```typescript
interface AIAdvancedSettingsProps {
  service: AIServiceConfig;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  modelOptions: string[];
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  onModelChange: (value: string) => void;
  onMaxTokensChange: (value: number) => void;
  onTemperatureChange: (value: number) => void;
  onSystemPromptChange: (value: string) => void;
}
```

### 6. AIServiceActions

Boutons d'actions (Tester, Sauvegarder, Supprimer).

**Props:**

```typescript
interface AIServiceActionsProps {
  service: AIServiceConfig;
  isTesting: boolean;
  onTest: () => void;
  onSave: () => void;
  onDelete: () => void;
}
```

### 7. AIServiceCard

Composant principal qui assemble tous les sous-composants.

**Props:**

```typescript
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
  onApiKeyChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onMaxTokensChange: (value: number) => void;
  onTemperatureChange: (value: number) => void;
  onSystemPromptChange: (value: string) => void;
  onTest: () => void;
  onSave: () => void;
  onDelete: () => void;
}
```

**Exemple complet:**

```tsx
<AIServiceCard
  service={service}
  showConfig={showConfig[service.service] || false}
  showApiKey={showApiKey[service.service] || false}
  showAdvanced={showAdvanced[service.service] || false}
  isTesting={testingService === service.service}
  modelOptions={getModelOptions(service.service)}
  onToggleShow={() =>
    setShowConfig((prev) => ({ ...prev, [service.service]: !prev[service.service] }))
  }
  onToggleEnabled={() => handleToggle(service.service)}
  onToggleShowApiKey={() =>
    setShowApiKey((prev) => ({ ...prev, [service.service]: !prev[service.service] }))
  }
  onToggleAdvanced={() =>
    setShowAdvanced((prev) => ({ ...prev, [service.service]: !prev[service.service] }))
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
```

## Types

### AIService

```typescript
type AIService = 'openai' | 'anthropic';
```

### AIServiceConfig

```typescript
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
```

### AIUsageStats

```typescript
interface AIUsageStats {
  totalRequests: number;
  usedRequests: number;
  totalTokens: number;
  totalCostUsd: number;
}
```

## Styling

Tous les composants utilisent des inline styles avec un design glassmorphism :

- `background: rgba(255, 255, 255, 0.6)`
- `backdropFilter: blur(20px)`
- Bordures conditionnelles (green si actif, purple sinon)

## Icons

Les composants utilisent `lucide-react` pour les icons :

- `Cpu` - Icon du service
- `BarChart3` - Statistiques
- `CheckCircle2` - Status actif
- `Sparkles` - Tokens
- `Eye/EyeOff` - Toggle API Key
- `ChevronDown/Up` - Accordion
- `TestTube` - Tester
- `Save` - Sauvegarder
- `Trash2` - Supprimer

## Notes

- **ZERO any types** : Tous les types sont explicitement définis
- **'use client'** : Chaque composant qui utilise des hooks/events
- **Pas de Tailwind** : Utilisation d'inline styles uniquement
- **Réutilisable** : Tous les composants sont génériques et modulaires
