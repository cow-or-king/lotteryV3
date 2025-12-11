# QR Code Router - Architecture Modulaire

Ce dossier contient la logique du router QR Code refactorisée en modules pour améliorer la maintenabilité.

## Structure des fichiers

```
qr-code/
├── qr-code.queries.ts      (~320 lignes) - Toutes les queries (lecture seule)
├── qr-code.mutations.ts    (~400 lignes) - Toutes les mutations CRUD
└── qr-code.storage.ts      (~90 lignes)  - Gestion du storage Supabase
```

Le fichier principal `qr-code.router.ts` (32 lignes) importe et compose tous ces modules.

## Modules

### 1. qr-code.queries.ts

**Responsabilité** : Toutes les opérations de lecture (queries)

**Endpoints** :

- `list` - Liste tous les QR codes de l'utilisateur connecté
- `getById` - Récupère un QR code par son ID avec vérification d'ownership
- `getStats` - Statistiques détaillées (scans par jour, par heure, périodes)
- `scan` - Enregistre un scan de QR code (PUBLIC, pas d'auth requise)

**Note** : `scan` est une mutation mais placée ici car elle est publique et liée aux stats.

### 2. qr-code.mutations.ts

**Responsabilité** : Toutes les mutations CRUD

**Endpoints** :

- `create` - Crée un nouveau QR code avec génération de shortCode pour DYNAMIC
- `createBatch` - Crée plusieurs QR codes à la fois (max 50)
- `update` - Met à jour un QR code existant
- `delete` - Supprime un QR code et son logo du storage

**Logique métier importante** :

- Vérification d'ownership du store si storeId fourni
- Génération unique de shortCode pour les QR codes dynamiques
- Filtrage des blob URLs (URLs temporaires client-side)
- Transaction Prisma pour le batch create

### 3. qr-code.storage.ts

**Responsabilité** : Gestion du storage Supabase

**Endpoints** :

- `uploadLogo` - Upload un logo en base64 vers Supabase Storage
- `deleteLogo` - Supprime un logo du storage

**Logique** :

- Conversion base64 → Buffer
- Génération de noms de fichiers uniques
- Organisation par userId dans le bucket 'qr-logos'

## Router principal (qr-code.router.ts)

Le router principal compose tous les endpoints en important les sous-routers :

```typescript
export const qrCodeRouter = createTRPCRouter({
  // Queries
  list: qrCodeQueriesRouter.list,
  getById: qrCodeQueriesRouter.getById,
  getStats: qrCodeQueriesRouter.getStats,
  scan: qrCodeQueriesRouter.scan,

  // Mutations
  create: qrCodeMutationsRouter.create,
  createBatch: qrCodeMutationsRouter.createBatch,
  update: qrCodeMutationsRouter.update,
  delete: qrCodeMutationsRouter.delete,

  // Storage
  uploadLogo: qrCodeStorageRouter.uploadLogo,
  deleteLogo: qrCodeStorageRouter.deleteLogo,
});
```

## Principes de design

1. **Zero any types** - Tout est typé avec TypeScript strict
2. **Séparation des responsabilités** - Chaque fichier a une responsabilité claire
3. **Conservation de l'API publique** - Les endpoints restent identiques pour les clients
4. **Réutilisation** - Les Zod enums et validations sont définis dans chaque module
5. **Ownership checks** - Vérification systématique de l'ownership (user, store)

## Imports communs

Chaque module importe :

- `z` from 'zod' - Pour les validations
- `createTRPCRouter, protectedProcedure, publicProcedure` from '../trpc'
- `TRPCError` from '@trpc/server' - Pour les erreurs
- `prisma` from '@/infrastructure/database/prisma-client'
- Types from '@/lib/types/qr-code.types'

## Migration

L'ancien fichier `qr-code.router.ts` monolithique (779 lignes) a été divisé en :

- **32 lignes** - Router principal (composition)
- **320 lignes** - Queries
- **400 lignes** - Mutations
- **90 lignes** - Storage
- **Total : ~842 lignes** (légère augmentation due aux imports séparés)

## Maintenance

Pour ajouter un nouvel endpoint :

1. Identifiez sa catégorie (query/mutation/storage)
2. Ajoutez-le dans le fichier approprié
3. Exportez-le dans le router principal
4. Testez que l'API publique fonctionne

## Tests

Les tests existants continuent de fonctionner car l'API publique est inchangée.
Vous pouvez tester individuellement chaque module si nécessaire.
