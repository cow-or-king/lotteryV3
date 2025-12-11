# ESLint - Guide de Correction Rapide

Ce guide fournit des patterns de correction rapide pour les erreurs ESLint les plus fréquentes.

---

## 🚀 Corrections Rapides par Type d'Erreur

### 1. `@typescript-eslint/no-explicit-any` → Remplacer `any` par `unknown`

```typescript
// ❌ AVANT
function handle(data: any) {
  return data;
}

// ✅ APRÈS - Option 1 : unknown avec type guard
function handle(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  throw new Error('Invalid data');
}

// ✅ APRÈS - Option 2 : Generic
function handle<T>(data: T): T {
  return data;
}
```

---

### 2. `@typescript-eslint/no-unsafe-member-access` → Type Guards

```typescript
// ❌ AVANT
function getErrorMessage(error: any) {
  return error.message;
}

// ✅ APRÈS - Type guard personnalisé
type ErrorWithMessage = { message: string };

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  return 'Unknown error';
}

// ✅ ALTERNATIVE - Avec zod
import { z } from 'zod';

const ErrorSchema = z.object({
  message: z.string(),
});

function getErrorMessage(error: unknown): string {
  const result = ErrorSchema.safeParse(error);
  return result.success ? result.data.message : 'Unknown error';
}
```

---

### 3. `@typescript-eslint/no-unsafe-assignment` → Validation avant assignation

```typescript
// ❌ AVANT
const user: any = await fetchUser();
const name = user.name;

// ✅ APRÈS - Avec validation
type User = { name: string; email: string };

function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'name' in data && 'email' in data;
}

const data = await fetchUser();
if (!isUser(data)) {
  throw new Error('Invalid user data');
}
const name = data.name; // Type-safe!
```

---

### 4. `@typescript-eslint/no-unsafe-call` → Typage des callbacks

```typescript
// ❌ AVANT
function runCallback(callback: any) {
  return callback();
}

// ✅ APRÈS - Callback typé
function runCallback(callback: () => void) {
  return callback();
}

// ✅ ALTERNATIVE - Callback générique
function runCallback<T>(callback: () => T): T {
  return callback();
}
```

---

### 5. `no-console` → Utiliser console.warn ou console.error

```typescript
// ❌ AVANT
console.log('User logged in');

// ✅ APRÈS
console.warn('User logged in'); // Pour debug/info

// ✅ OU créer un logger
// src/lib/logger.ts
export const logger = {
  info: (msg: string) => console.warn(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
};

// Usage
logger.info('User logged in');
```

---

### 6. `@typescript-eslint/no-unused-vars` → Préfixer avec `_`

```typescript
// ❌ AVANT
function process(data: string, unused: number) {
  return data;
}

// ✅ APRÈS - Préfixer avec _
function process(data: string, _unused: number) {
  return data;
}

// ✅ OU supprimer si vraiment inutile
function process(data: string) {
  return data;
}
```

---

### 7. `complexity` → Décomposer en fonctions

```typescript
// ❌ AVANT - Complexité 20
function processUser(user: User) {
  if (user.role === 'admin') {
    if (user.emailVerified) {
      if (user.hasPermission('write')) {
        // ...
      } else {
        // ...
      }
    } else {
      // ...
    }
  } else if (user.role === 'user') {
    // ...
  } else {
    // ...
  }
}

// ✅ APRÈS - Décomposé
function processUser(user: User) {
  switch (user.role) {
    case 'admin':
      return processAdmin(user);
    case 'user':
      return processRegularUser(user);
    default:
      return processGuest(user);
  }
}

function processAdmin(user: User) {
  if (!user.emailVerified) {
    return handleUnverifiedAdmin(user);
  }

  if (user.hasPermission('write')) {
    return handleAdminWithWrite(user);
  }

  return handleAdminReadOnly(user);
}
```

---

### 8. `max-lines` → Découper en modules

```typescript
// ❌ AVANT - Fichier de 600 lignes avec tout mélangé

// ✅ APRÈS - Découper en fichiers
// user.types.ts
export type User = { ... };
export type UserRole = 'admin' | 'user';

// user.validators.ts
export function isUser(data: unknown): data is User { ... }

// user.utils.ts
export function formatUserName(user: User): string { ... }

// user.service.ts
import { User } from './user.types';
import { isUser } from './user.validators';
import { formatUserName } from './user.utils';

export class UserService { ... }
```

---

### 9. `react-hooks/exhaustive-deps` → Ajouter les dépendances manquantes

```typescript
// ❌ AVANT
useEffect(() => {
  fetchData(userId);
}, []); // userId manquant

// ✅ APRÈS - Ajouter la dépendance
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ✅ ALTERNATIVE - Si intentionnel, utiliser un commentaire
useEffect(() => {
  fetchData(userId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Volontairement vide - on veut exécuter une seule fois
```

---

## 🛠️ Utilitaires Réutilisables

### Type Guards Génériques

```typescript
// src/lib/utils/type-guards.ts

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isArray<T>(value: unknown, itemGuard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(itemGuard);
}

// Usage
if (hasProperty(data, 'user') && hasProperty(data.user, 'id')) {
  const userId = data.user.id; // Type-safe!
}
```

---

### Wrapper pour Erreurs

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

  if (isObject(error) && hasProperty(error, 'message') && isString(error.message)) {
    return new AppError(error.message, 500, error);
  }

  return new AppError('Unknown error', 500, error);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Usage dans un catch
try {
  await riskyOperation();
} catch (error: unknown) {
  const appError = toAppError(error);
  console.error(`[${appError.code}] ${appError.message}`);
  throw appError;
}
```

---

### Logger Type-Safe

```typescript
// src/lib/logger.ts

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // En production, ne logger que warn et error
    if (process.env.NODE_ENV === 'production') {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  info(message: string, data?: unknown) {
    if (this.shouldLog('info')) {
      console.warn(`[INFO] ${message}`, data);
    }
  }

  warn(message: string, data?: unknown) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  error(message: string, error?: unknown) {
    if (this.shouldLog('error')) {
      const appError = error ? toAppError(error) : null;
      console.error(`[ERROR] ${message}`, appError);
    }
  }

  debug(message: string, data?: unknown) {
    if (this.shouldLog('debug')) {
      console.warn(`[DEBUG] ${message}`, data);
    }
  }
}

export const logger = new Logger();

// Usage
logger.info('User logged in', { userId: '123' });
logger.error('Failed to fetch user', error);
```

---

## 📋 Checklist de Correction

Avant de soumettre une PR avec des corrections ESLint :

- [ ] Tous les `any` sont remplacés par `unknown` ou un type spécifique
- [ ] Tous les accès à des propriétés sont protégés par des type guards
- [ ] Les callbacks sont typés
- [ ] Les `console.log` sont remplacés par `console.warn/error` ou un logger
- [ ] Les variables inutilisées sont supprimées ou préfixées avec `_`
- [ ] Les fonctions complexes sont décomposées (complexité < 15)
- [ ] Les fichiers de plus de 400 lignes sont découpés
- [ ] Les dépendances React Hooks sont complètes
- [ ] `npm run lint` passe sans erreur
- [ ] `npm run test` passe sans erreur
- [ ] `npm run build` réussit

---

## 🎯 Ordre de Priorité des Corrections

1. **Haute Priorité** : Erreurs dans le code applicatif
   - Routeurs API
   - Repositories
   - Services métier
2. **Moyenne Priorité** : Erreurs dans les tests
   - Tests d'intégration
   - Tests unitaires
3. **Basse Priorité** : Warnings et optimisations
   - Complexité des fonctions
   - Taille des fichiers
   - Variables inutilisées

---

**Date de création** : 2025-12-11
**Dernière mise à jour** : 2025-12-11
