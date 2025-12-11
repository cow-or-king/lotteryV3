# Admin Router Architecture

## Overview

Le router d'administration est divisé en modules fonctionnels pour améliorer la maintenabilité et la séparation des responsabilités.

## Structure

```
src/server/api/routers/
├── admin.router.ts (31 lignes) - Fichier principal qui compose tous les endpoints
└── admin/
    ├── admin.ai-config.ts (318 lignes) - Configuration et gestion IA
    ├── admin.platform-stats.ts (244 lignes) - Statistiques plateforme et clients
    └── README.md - Cette documentation
```

## Modules

### 1. admin.ai-config.ts

**Responsabilité**: Gestion complète des configurations IA (OpenAI, Anthropic)

**Endpoints**:

- `listAiConfigs` - Liste toutes les configurations IA
- `getAiConfigById` - Récupère une configuration par ID
- `createAiConfig` - Crée une nouvelle configuration
- `updateAiConfig` - Met à jour une configuration
- `activateAiConfig` - Active une configuration (désactive les autres)
- `deactivateAiConfig` - Désactive une configuration
- `deleteAiConfig` - Supprime une configuration
- `testAiConnection` - Teste la connexion avec un provider IA
- `getAiUsageStats` - Récupère les statistiques d'usage IA

**Features**:

- Chiffrement/déchiffrement des API keys via `ApiKeyEncryptionService`
- Masquage des API keys (affiche uniquement les 4 derniers caractères)
- Test de connexion avec OpenAI et Anthropic
- Statistiques d'usage avec agrégation par provider
- Validation Zod stricte pour tous les inputs

### 2. admin.platform-stats.ts

**Responsabilité**: Statistiques globales de la plateforme et gestion des clients

**Endpoints**:

- `getPlatformStats` - Statistiques globales (users, stores, reviews, AI)
- `listClients` - Liste des clients (ADMIN) avec leurs stats
- `getClientDetails` - Détails complets d'un client avec ses commerces et stats

**Features**:

- Statistiques utilisateurs (total, actifs, par rôle)
- Statistiques commerces (total, actifs, avec API Google)
- Statistiques avis (total, avec réponse, note moyenne)
- Statistiques IA (requêtes, tokens, coûts)
- Recherche et pagination des clients
- Calcul automatique des taux (response rate, API configuration rate)

## Pattern d'utilisation

### Fichier principal (admin.router.ts)

Le fichier principal compose tous les sous-routers en maintenant la même API publique:

```typescript
export const adminRouter = createTRPCRouter({
  // AI Config endpoints
  listAiConfigs: adminAIConfigRouter.listAiConfigs,
  createAiConfig: adminAIConfigRouter.createAiConfig,
  // ... autres endpoints AI

  // Platform Stats endpoints
  getPlatformStats: adminPlatformStatsRouter.getPlatformStats,
  listClients: adminPlatformStatsRouter.listClients,
  // ... autres endpoints stats
});
```

### Sécurité

- Tous les endpoints utilisent `superAdminProcedure`
- Validation Zod stricte sur tous les inputs
- Chiffrement des API keys sensibles
- Masquage des données sensibles dans les réponses
- Type-safety complète (ZERO any types)

## Avantages de cette architecture

1. **Séparation des responsabilités**: Chaque module a une responsabilité claire et limitée
2. **Maintenabilité**: Plus facile de naviguer et modifier du code organisé en petits fichiers
3. **Testabilité**: Chaque module peut être testé indépendamment
4. **Évolutivité**: Facile d'ajouter de nouveaux modules sans impacter les existants
5. **Lisibilité**: Code mieux organisé et commenté
6. **API publique préservée**: L'interface externe reste identique (backward compatible)

## Standards du code

- **ZERO any types**: Type-safety stricte partout
- **Architecture Hexagonale**: Séparation infrastructure/domain
- **Validation Zod**: Validation stricte de tous les inputs
- **Gestion d'erreurs**: TRPCError avec codes appropriés
- **Commentaires**: Documentation claire de chaque endpoint
- **Naming**: Conventions cohérentes et descriptives

## Conventions de nommage

- Fichiers modules: `admin.{domain}.ts`
- Routers: `admin{Domain}Router`
- Endpoints: verbes clairs (list, get, create, update, delete, activate, etc.)

## Migration depuis l'ancienne structure

L'ancienne structure monolithique de 604 lignes a été divisée en:

- **admin.router.ts**: 31 lignes (fichier de composition)
- **admin.ai-config.ts**: 318 lignes (gestion IA)
- **admin.platform-stats.ts**: 244 lignes (statistiques)
- **README.md**: Documentation complète

Total: ~593 lignes de code + documentation, avec une bien meilleure organisation.

## Ajout de nouveaux modules

Pour ajouter un nouveau module admin:

1. Créer `admin/admin.{domain}.ts`
2. Exporter un router via `createTRPCRouter()`
3. Importer dans `admin.router.ts`
4. Exposer les endpoints dans le router principal
5. Mettre à jour cette documentation

Exemple:

```typescript
// admin/admin.analytics.ts
export const adminAnalyticsRouter = createTRPCRouter({
  getAnalytics: superAdminProcedure.query(async () => { ... }),
});

// admin.router.ts
import { adminAnalyticsRouter } from './admin/admin.analytics';

export const adminRouter = createTRPCRouter({
  // ... endpoints existants
  getAnalytics: adminAnalyticsRouter.getAnalytics,
});
```
