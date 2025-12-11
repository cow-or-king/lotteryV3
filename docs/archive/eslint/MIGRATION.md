# Plan de Migration ESLint - Règles Strictes TypeScript

## Statut : Documentation des Erreurs

Date : 2025-12-11
Règles activées : TypeScript strict + Quality Rules

---

## 📊 Vue d'ensemble des erreurs détectées

### Statistiques globales

- **Total d'erreurs/warnings** : 3 829 problèmes
  - **Erreurs** : 3 128
  - **Warnings** : 701
- **Fichiers impactés** : 150+ fichiers
- **Fichiers ignorés** : Fichiers générés (Prisma), config, node_modules

---

## 🎯 Règles Strictes Ajoutées

### 1. TypeScript Safety Rules (nouvelles)

```json
{
  "@typescript-eslint/no-unsafe-assignment": "warn",
  "@typescript-eslint/no-unsafe-member-access": "warn",
  "@typescript-eslint/no-unsafe-call": "warn"
}
```

**Impact** :

- `no-unsafe-assignment` : 95 warnings
- `no-unsafe-member-access` : 187 warnings
- `no-unsafe-call` : 66 warnings
- **Total** : 348 warnings de type safety

### 2. React Hooks (renforcée)

```json
{
  "react-hooks/exhaustive-deps": "error" // était "warn"
}
```

**Impact** :

- 1 erreur détectée (très peu, bonne pratique déjà en place)

### 3. Code Quality Rules (nouvelles)

```json
{
  "max-lines": ["warn", { "max": 400, "skipBlankLines": true, "skipComments": true }],
  "complexity": ["warn", 15]
}
```

**Impact** :

- `max-lines` : 8 fichiers dépassent 400 lignes
- `complexity` : 30 fonctions trop complexes (≥15)

---

## 📋 Analyse Détaillée par Type d'Erreur

### Erreur Type 1 : `@typescript-eslint/no-explicit-any` (196 erreurs)

**Description** : Utilisation du type `any` interdit.

**Localisation principale** :

- Fichiers générés Prisma : 905 occurrences (à ignorer)
- Fichiers de test : ~50 occurrences
- Code applicatif : ~50 occurrences

**Exemples de correction** :

```typescript
// ❌ AVANT
function processData(data: any) {
  return data.value;
}

// ✅ APRÈS
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data structure');
}

// ✅ ALTERNATIVE avec type guard
type DataWithValue = { value: string };
function isDataWithValue(data: unknown): data is DataWithValue {
  return typeof data === 'object' && data !== null && 'value' in data;
}

function processData(data: unknown) {
  if (isDataWithValue(data)) {
    return data.value; // Type-safe!
  }
}
```

---

### Erreur Type 2 : `@typescript-eslint/no-unsafe-member-access` (187 warnings)

**Description** : Accès à une propriété d'un objet de type `any` ou `unknown`.

**Localisation** :

- Prisma runtime : ~140 occurrences
- Tests : ~30 occurrences
- Code applicatif : ~17 occurrences

**Exemples de correction** :

```typescript
// ❌ AVANT
function handleError(error: any) {
  console.error(error.message);
  return error.code;
}

// ✅ APRÈS avec type guard
type ErrorWithMessage = { message: string; code?: number };

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

function handleError(error: unknown) {
  if (isErrorWithMessage(error)) {
    console.error(error.message);
    return error.code ?? 500;
  }
  console.error('Unknown error');
  return 500;
}

// ✅ ALTERNATIVE avec zod
import { z } from 'zod';

const ErrorSchema = z.object({
  message: z.string(),
  code: z.number().optional(),
});

function handleError(error: unknown) {
  const parsed = ErrorSchema.safeParse(error);
  if (parsed.success) {
    console.error(parsed.data.message);
    return parsed.data.code ?? 500;
  }
  console.error('Unknown error');
  return 500;
}
```

---

### Erreur Type 3 : `@typescript-eslint/no-unsafe-assignment` (95 warnings)

**Description** : Assignation d'une valeur de type `any` à une variable.

**Exemples de correction** :

```typescript
// ❌ AVANT
const data: any = fetchData();
const userId = data.user.id; // unsafe!

// ✅ APRÈS
type UserData = { user: { id: string } };

function isUserData(data: unknown): data is UserData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'user' in data &&
    typeof (data as { user: unknown }).user === 'object' &&
    (data as { user: unknown }).user !== null &&
    'id' in (data as { user: { id: unknown } }).user
  );
}

const data = fetchData();
if (isUserData(data)) {
  const userId = data.user.id; // Type-safe!
}
```

---

### Erreur Type 4 : `@typescript-eslint/no-unsafe-call` (66 warnings)

**Description** : Appel d'une fonction de type `any`.

**Exemples de correction** :

```typescript
// ❌ AVANT
function processCallback(callback: any) {
  return callback();
}

// ✅ APRÈS
function processCallback(callback: () => void) {
  return callback();
}

// ✅ Si le type de retour varie
function processCallback<T>(callback: () => T): T {
  return callback();
}
```

---

### Erreur Type 5 : `no-undef` (896 erreurs)

**Description** : Variables globales non définies (`process`, `console`, `require`, etc.)

**Localisation** :

- Scripts Node.js : 200+ occurrences
- Fichiers Prisma générés : 600+ occurrences
- Config files : 50+ occurrences

**Solution** : Ajouter les types Node.js et exclure les scripts de l'analyse :

```javascript
// eslint.config.js
export default [
  {
    ignores: [
      'scripts/**', // ← AJOUTER
      'prisma/**', // ← AJOUTER
      '.next/**',
      'node_modules/**',
      // ...
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        // Ajouter les globaux Node.js
        process: 'readonly',
        console: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        Buffer: 'readonly',
      },
    },
  },
];
```

---

### Erreur Type 6 : `@typescript-eslint/no-unused-vars` (176 warnings)

**Description** : Variables déclarées mais non utilisées.

**Exemples de correction** :

```typescript
// ❌ AVANT
const unused = 'value';
function test(a: string, b: number) {
  return a;
}

// ✅ APRÈS
// Supprimer la variable ou la préfixer avec _
const _unused = 'value'; // intentionnellement non utilisé
function test(a: string, _b: number) {
  return a;
}
```

---

### Erreur Type 7 : `complexity` (30 warnings)

**Description** : Fonctions avec complexité cyclomatique ≥ 15.

**Fichiers concernés** :

1. `/scripts/check-user-status.ts:21` - `main()` : complexité 19
2. Autres fichiers à identifier

**Exemples de correction** :

```typescript
// ❌ AVANT - Complexité 19
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: ...');
    process.exit(1);
  }

  // 10+ if/else imbriqués...
  if (user) {
    if (user.emailVerified) {
      if (user.role === 'SUPER_ADMIN') {
        // ...
      } else if (user.role === 'ADMIN') {
        // ...
      } else {
        // ...
      }
    } else {
      // ...
    }
  } else {
    // ...
  }
}

// ✅ APRÈS - Décomposer en fonctions
async function main() {
  const email = getEmailFromArgs();
  const user = await findUser(email);

  if (!user) {
    return handleUserNotFound(email);
  }

  if (!user.emailVerified) {
    return handleUnverifiedUser(user);
  }

  return handleVerifiedUser(user);
}

function handleVerifiedUser(user: User) {
  switch (user.role) {
    case 'SUPER_ADMIN':
      return handleSuperAdmin(user);
    case 'ADMIN':
      return handleAdmin(user);
    default:
      return handleRegularUser(user);
  }
}
```

---

### Erreur Type 8 : `max-lines` (8 warnings)

**Description** : Fichiers dépassant 400 lignes (sans blancs/commentaires).

**Fichiers concernés** :

- Fichiers à identifier avec `npm run lint`

**Solution** :

1. Découper en modules plus petits
2. Extraire les utilitaires dans des fichiers séparés
3. Séparer la logique métier de la présentation

---

### Erreur Type 9 : `no-console` (121 warnings)

**Description** : Usage de `console.log()` interdit (seuls `warn` et `error` autorisés).

**Exemples de correction** :

```typescript
// ❌ AVANT
console.log('User logged in:', userId);
console.log('Processing data...');

// ✅ APRÈS
// Dans les scripts, utiliser console.warn ou console.error
console.warn('User logged in:', userId);

// Ou créer un logger
import { logger } from '@/lib/logger';
logger.info('User logged in:', userId);

// Dans les tests, utiliser console.log est autorisé (règle désactivée)
```

---

## 🗂️ Catégorisation des Fichiers à Corriger

### Catégorie A : HAUTE PRIORITÉ (Code Applicatif)

**Critères** : Code métier, utilisé en production

**Fichiers** (17 fichiers avec 10+ erreurs chacun) :

1. `/src/app/dashboard/qr-codes/[id]/stats/page.tsx` (36 erreurs)
2. `/src/infrastructure/repositories/prisma/subscription.repository.prisma.ts` (35 erreurs)
3. `/src/server/api/routers/admin.router.ts` (33 erreurs)
4. `/src/infrastructure/services/google-my-business-production.service.ts` (32 erreurs)
5. `/src/server/api/routers/review.router.ts` (estimé 30+ erreurs)
6. `/src/server/api/trpc.ts` (estimé 25+ erreurs)
7. _...autres fichiers à lister après analyse complète_

**Effort estimé** : 2-3 jours
**Impact** : Amélioration de la type safety en production

---

### Catégorie B : MOYENNE PRIORITÉ (Tests)

**Critères** : Fichiers de test

**Fichiers** (estimé 30 fichiers) :

1. `/src/test/unit/infrastructure/auth/session.service.test.ts` (128 erreurs)
2. `/src/test/unit/infrastructure/auth/supabase-auth.service.test.ts` (estimé 50+ erreurs)
3. `/src/test/integration/api/auth.router.test.ts` (estimé 40+ erreurs)
4. _...autres tests_

**Effort estimé** : 1-2 jours
**Impact** : Amélioration de la qualité des tests

---

### Catégorie C : BASSE PRIORITÉ (Scripts)

**Critères** : Scripts d'administration, migrations

**Fichiers** (13 fichiers) :

1. `/scripts/check-user-status.ts` (80 erreurs)
2. `/scripts/test-google-api.ts` (48 erreurs)
3. `/scripts/test-db-connection.ts` (32 erreurs)
4. `/scripts/confirm-email.ts` (30 erreurs)
5. `/scripts/fix-stores-schema.ts` (25 erreurs)
6. `/scripts/promote-super-admin.ts` (20 erreurs)
7. _...autres scripts_

**Solution recommandée** : Exclure du linting ou correction rapide avec globals Node.js

**Effort estimé** : 2 heures (exclusion) ou 1 jour (correction)

---

### Catégorie D : À IGNORER

**Critères** : Fichiers générés automatiquement

**Fichiers** :

1. `/src/generated/prisma/**` (1 800+ erreurs)
2. Tous les fichiers dans `node_modules/`
3. Fichiers de configuration (`.config.js`, `.config.mjs`)

**Action** : Déjà exclus dans `eslint.config.js` (section `ignores`)

---

## 📅 Plan de Migration Progressive

### Phase 1 : Configuration (1 heure) ✅ FAIT

- [x] Ajouter les règles strictes dans `eslint.config.js`
- [x] Lancer `npm run lint` pour audit complet
- [x] Créer ce document de migration

### Phase 2 : Quick Wins (2 heures)

**Objectif** : Réduire les erreurs de 30% rapidement

1. **Exclure les scripts du linting**

   ```javascript
   ignores: [
     'scripts/**',
     'prisma/**',
     // ...
   ];
   ```

   Impact : -500 erreurs

2. **Ajouter les globaux Node.js pour les fichiers nécessaires**

   ```javascript
   {
     files: ['scripts/**/*.ts', 'prisma/**/*.ts'],
     languageOptions: {
       globals: {
         process: 'readonly',
         console: 'readonly',
         // ...
       }
     },
     rules: {
       'no-console': 'off',
     }
   }
   ```

3. **Remplacer tous les `console.log` en `console.warn`** (scripts uniquement)
   ```bash
   find scripts -name "*.ts" -exec sed -i '' 's/console\.log/console.warn/g' {} +
   ```

### Phase 3 : Corrections Prioritaires (2-3 jours)

**Jour 1** : Corrections des fichiers de routeurs (6 fichiers)

- `/src/server/api/routers/admin.router.ts`
- `/src/server/api/routers/review.router.ts`
- `/src/server/api/routers/auth.router.ts`
- `/src/server/api/routers/store.router.ts`
- `/src/server/api/routers/qr-code/*.ts`

**Jour 2** : Corrections des repositories (5 fichiers)

- `/src/infrastructure/repositories/prisma/*.ts`

**Jour 3** : Corrections des services (5 fichiers)

- `/src/infrastructure/services/*.ts`

### Phase 4 : Corrections Secondaires (1-2 jours)

**Jour 4-5** : Tests

- Corriger les 30 fichiers de test
- Priorité : tests d'intégration > tests unitaires

### Phase 5 : Corrections Finales (1 jour)

**Jour 6** : Pages et composants

- Corriger les pages du dashboard
- Corriger les composants UI si nécessaire

### Phase 6 : Optimisation (1 jour)

**Jour 7** :

- Refactoring des fonctions complexes (complexity)
- Split des fichiers trop longs (max-lines)
- Review final et ajustement des règles si nécessaire

---

## 🔧 Outils et Utilitaires

### Script de Migration Automatique (à créer)

```bash
# scripts/eslint-fix-batch.sh
#!/bin/bash

# Corriger automatiquement ce qui peut l'être
npm run lint -- --fix

# Générer un rapport détaillé
npm run lint -- --output-file eslint-report.txt
```

### Type Guards Réutilisables (à créer)

```typescript
// src/lib/utils/type-guards.ts

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function hasProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

// Exemple d'utilisation
function processData(data: unknown) {
  if (hasProperty(data, 'user') && hasProperty(data.user, 'id')) {
    const userId = data.user.id; // Type-safe!
  }
}
```

### Wrapper pour Erreurs (à créer)

```typescript
// src/lib/utils/error-handler.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500, error);
  }

  return new AppError('Unknown error', 500, error);
}

// Utilisation
try {
  // ...
} catch (error: unknown) {
  const appError = toAppError(error);
  console.error(appError.message);
  return appError.code;
}
```

---

## 📈 Métriques de Succès

### Objectifs à atteindre

| Métrique              | Avant | Objectif Phase 1 | Objectif Final |
| --------------------- | ----- | ---------------- | -------------- |
| Erreurs totales       | 3 128 | < 1 500          | < 100          |
| Warnings totales      | 701   | < 400            | < 50           |
| Fichiers avec erreurs | 150+  | < 80             | < 20           |
| `no-explicit-any`     | 196   | < 100            | 0              |
| `no-unsafe-*`         | 348   | < 150            | < 20           |
| Fonctions complexes   | 30    | < 20             | < 10           |
| Fichiers > 400 lignes | 8     | < 5              | 0              |

### Suivi de la progression

Créer un dashboard de suivi :

```bash
# scripts/eslint-progress.sh
#!/bin/bash

echo "📊 ESLint Migration Progress"
echo "=============================="

TOTAL=$(npm run lint 2>&1 | grep -E "(error|warning)" | wc -l)
ERRORS=$(npm run lint 2>&1 | grep "error" | wc -l)
WARNINGS=$(npm run lint 2>&1 | grep "warning" | wc -l)

echo "Total: $TOTAL"
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""
echo "Progress: $(echo "scale=2; 100 - ($TOTAL / 38.29)" | bc)% complete"
```

---

## 🚨 Règles à Éviter de Modifier

### NE PAS faire :

1. ❌ Désactiver `@typescript-eslint/no-explicit-any` globalement
2. ❌ Ajouter des `// eslint-disable-next-line` partout
3. ❌ Augmenter les seuils de `complexity` ou `max-lines`
4. ❌ Downgrade des erreurs en warnings sans justification

### Exceptions autorisées :

1. ✅ Désactiver `no-explicit-any` dans les fichiers de test (déjà fait)
2. ✅ Exclure les fichiers générés (Prisma)
3. ✅ Exclure les scripts d'administration (si justifié)

---

## 📚 Ressources

### Documentation

- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [Type Guards in TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Zod for Runtime Validation](https://zod.dev/)

### Patterns de Migration

Voir les exemples dans ce document (sections "Erreur Type X").

---

## ✅ Checklist de Migration

### Configuration

- [x] Règles strictes ajoutées
- [ ] Scripts exclus du linting
- [ ] Globaux Node.js configurés
- [ ] Type guards réutilisables créés

### Corrections

- [ ] Catégorie A : Code applicatif (17 fichiers)
- [ ] Catégorie B : Tests (30 fichiers)
- [ ] Catégorie C : Scripts (13 fichiers ou exclusion)

### Validation

- [ ] Tests passent : `npm run test`
- [ ] Build réussit : `npm run build`
- [ ] Linter < 100 erreurs
- [ ] Review code par l'équipe

### Documentation

- [ ] Ce document mis à jour avec la progression
- [ ] Patterns de migration documentés
- [ ] Guide de contribution mis à jour

---

## 🎯 Prochaines Étapes Recommandées

1. **Immédiat** : Exclure les scripts et Prisma du linting (Phase 2)
2. **Cette semaine** : Corriger les routeurs et repositories (Phase 3)
3. **Semaine prochaine** : Corriger les tests (Phase 4)
4. **Dans 2 semaines** : Corrections finales et optimisation (Phases 5-6)

---

**Date de création** : 2025-12-11
**Dernière mise à jour** : 2025-12-11
**Responsable** : Équipe Dev
**Statut** : En cours - Phase 1 terminée
