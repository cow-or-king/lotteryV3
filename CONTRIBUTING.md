# Guide de Contribution - ReviewLottery V3

Merci de votre intérêt pour contribuer à ReviewLottery V3! Ce document contient les guidelines et bonnes pratiques pour contribuer efficacement au projet.

---

## Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Avant de Commencer](#avant-de-commencer)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Standards de Code](#standards-de-code)
- [Architecture et Patterns](#architecture-et-patterns)
- [Workflow Git](#workflow-git)
- [Process de Review](#process-de-review)
- [Tests](#tests)
- [Documentation](#documentation)

---

## Code de Conduite

- Soyez respectueux et professionnel
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est meilleur pour le projet
- Montrez de l'empathie envers les autres contributeurs

---

## Avant de Commencer

### Prérequis Techniques

- Node.js 18+
- Git
- Connaissance de TypeScript
- Familiarité avec Next.js et React
- Compte Supabase (pour le développement)

### Lecture Recommandée

Avant de contribuer, lisez ces documents:

1. **[docs/QUICK-START.md](./docs/QUICK-START.md)** - Démarrage rapide
2. **[docs/development/DEVELOPMENT.md](./docs/development/DEVELOPMENT.md)** - Guide de développement
3. **[docs/guides/CODING_GUIDELINES.md](./docs/guides/CODING_GUIDELINES.md)** - Standards de code
4. **[docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md)** - Architecture du projet

---

## Configuration de l'Environnement

### 1. Fork et Clone

```bash
# Fork le repository sur GitHub
# Puis clone votre fork
git clone git@github.com:VOTRE_USERNAME/reviewLotteryV3.git
cd reviewLotteryV3

# Ajouter le repo upstream
git remote add upstream git@github.com:cow-or-king/lotteryV3.git
```

### 2. Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement
# Voir docs/setup/SUPABASE_SETUP.md
```

### 3. Configuration Database

```bash
# Synchroniser le schema Prisma
npx prisma db push

# Générer le client Prisma
npx prisma generate
```

### 4. Vérification

```bash
# Lancer les tests
npm test

# Vérifier le linting
npm run lint

# Vérifier TypeScript
npm run type-check

# Démarrer le serveur
npm run dev
```

---

## Standards de Code

### Règles Strictes

#### 1. ZERO `any` Types

```typescript
// ❌ INTERDIT
function processData(data: any) {
  return data.value;
}

// ✅ CORRECT
function processData(data: UserData): string {
  return data.value;
}

// ✅ Si vraiment nécessaire
function processData(data: unknown): string {
  if (isUserData(data)) {
    return data.value;
  }
  throw new Error('Invalid data');
}
```

#### 2. Result Pattern (pas d'exceptions)

```typescript
// ❌ INTERDIT dans la logique métier
function createUser(email: string): User {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email');
  }
  return new User(email);
}

// ✅ CORRECT
function createUser(email: string): Result<User, Error> {
  if (!isValidEmail(email)) {
    return err(new Error('Invalid email'));
  }
  return ok(new User(email));
}
```

#### 3. Branded Types pour les IDs

```typescript
// ❌ INTERDIT
function getUser(id: string): User {
  // ...
}

// ✅ CORRECT
type UserId = Brand<string, 'UserId'>;

function getUser(id: UserId): User {
  // ...
}
```

#### 4. Composants Modulaires (max 500 lignes)

```typescript
// ❌ INTERDIT - Composant monolithique
export default function HugePage() {
  // 800 lignes de code...
  return <div>{/* tout dans un seul composant */}</div>;
}

// ✅ CORRECT - Composants modulaires
export default function Page() {
  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}
```

### Conventions de Nommage

- **Fichiers**: PascalCase pour composants (`UserList.tsx`), kebab-case pour utils (`format-date.ts`)
- **Composants**: PascalCase (`function UserCard() {}`)
- **Hooks**: camelCase avec préfixe `use` (`function useAuth() {}`)
- **Types/Interfaces**: PascalCase (`interface UserData {}`)
- **Constants**: UPPER_SNAKE_CASE (`const API_URL = '...'`)

### Imports

Toujours utiliser les alias:

```typescript
// ✅ CORRECT
import { UserCard } from '@/components/users/UserCard';
import { formatDate } from '@/lib/utils/format-date';
import { useAuth } from '@/hooks/auth/useAuth';

// ❌ INTERDIT
import { UserCard } from '../../../components/users/UserCard';
```

### Gestion d'Erreurs & Notifications

```typescript
// ❌ INTERDIT
alert('Success!');
console.error('Error occurred');

// ✅ CORRECT
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: 'Success',
  description: 'Operation completed',
  variant: 'success',
});
```

---

## Architecture et Patterns

### Structure Hexagonale

Le projet suit l'architecture hexagonale stricte:

```
src/
├── core/              # Domain Layer (ZERO dépendances externes)
│   ├── entities/      # Entités métier
│   ├── use-cases/     # Cas d'utilisation
│   └── ports/         # Interfaces (repositories, services)
├── infrastructure/    # Adapters (implémentations)
│   ├── repositories/  # Implémentations Prisma
│   └── services/      # Services externes (APIs, etc.)
├── app/              # Presentation Layer (Next.js)
└── server/           # API Layer (tRPC)
```

### Règles par Couche

#### Domain Layer (`src/core/`)

- **AUCUNE** dépendance externe (pas de Prisma, React, etc.)
- Logique métier pure
- Entités avec validation
- Use cases retournent des `Result<T, E>`

```typescript
// ✅ CORRECT - Pure TypeScript
export class UserEntity {
  private constructor(
    private readonly id: UserId,
    private readonly email: Email,
  ) {}

  static create(email: string): Result<UserEntity, Error> {
    const emailResult = Email.create(email);
    if (emailResult.isErr()) {
      return err(emailResult.error);
    }
    return ok(new UserEntity(generateId(), emailResult.value));
  }
}
```

#### Infrastructure Layer (`src/infrastructure/`)

- Implémentations des ports définis dans le domain
- Dépendances externes autorisées (Prisma, APIs)

```typescript
// ✅ CORRECT
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UserId): Promise<Option<UserEntity>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? some(toDomain(user)) : none;
  }
}
```

#### Presentation Layer (`src/app/`, `src/components/`)

- Composants React
- Utilisation de tRPC pour les appels API
- Hooks pour la logique réutilisable

```typescript
// ✅ CORRECT
export function UserList() {
  const { data: users, isLoading } = api.user.list.useQuery();

  if (isLoading) return <Spinner />;

  return (
    <div>
      {users?.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

---

## Workflow Git

### Branches

```bash
# Feature
git checkout -b feature/user-management

# Bug fix
git checkout -b fix/login-error

# Documentation
git checkout -b docs/update-readme

# Refactoring
git checkout -b refactor/auth-service
```

### Commits

Format: `<type>: <description>`

**Types:**

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `refactor:` Refactoring sans changement de comportement
- `test:` Ajout ou modification de tests
- `docs:` Documentation
- `style:` Formatage, style
- `chore:` Maintenance, dépendances

**Exemples:**

```bash
git commit -m "feat: add user profile page"
git commit -m "fix: resolve login redirect issue"
git commit -m "test: add tests for UserEntity"
git commit -m "docs: update CONTRIBUTING.md"
```

### Pull Requests

1. **Créer une branche** depuis `main`
2. **Développer** la fonctionnalité avec commits atomiques
3. **Tester** (tests passent, linting OK)
4. **Push** la branche sur votre fork
5. **Créer une PR** vers `main` du repo upstream

#### Template de PR

```markdown
## Description

[Description claire de ce que fait la PR]

## Type de changement

- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Checklist

- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Linting & Type-check OK
- [ ] Aucun `any` type
- [ ] Result Pattern respecté
- [ ] Architecture hexagonale respectée

## Screenshots (si applicable)

[Ajouter des screenshots]
```

---

## Process de Review

### En tant qu'Auteur

1. **Self-review** avant de demander une review
2. **Tester** manuellement toutes les fonctionnalités
3. **Vérifier** la checklist de la PR
4. **Répondre** rapidement aux commentaires
5. **Mettre à jour** selon les feedbacks

### En tant que Reviewer

1. **Vérifier** le respect des standards
2. **Tester** localement si nécessaire
3. **Commenter** de manière constructive
4. **Approuver** si tout est OK
5. **Bloquer** si problèmes critiques

### Critères d'Approbation

- [ ] Code respecte les standards
- [ ] Tests présents et passent
- [ ] Aucun `any` type
- [ ] Documentation à jour
- [ ] Architecture respectée
- [ ] Performance acceptable
- [ ] Sécurité vérifiée

---

## Tests

### Niveaux de Tests

#### 1. Tests Unitaires (Use Cases, Entities)

```typescript
import { describe, it, expect } from 'vitest';

describe('UserEntity', () => {
  it('should create a valid user', () => {
    const result = UserEntity.create('test@example.com');
    expect(result.isOk()).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = UserEntity.create('invalid-email');
    expect(result.isErr()).toBe(true);
  });
});
```

#### 2. Tests d'Intégration (Repositories)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

describe('PrismaUserRepository', () => {
  let prisma: PrismaClient;
  let repository: PrismaUserRepository;

  beforeEach(async () => {
    prisma = new PrismaClient();
    repository = new PrismaUserRepository(prisma);
    await prisma.user.deleteMany();
  });

  it('should save and retrieve a user', async () => {
    const user = await repository.save(createTestUser());
    const found = await repository.findById(user.id);
    expect(found.isSome()).toBe(true);
  });
});
```

#### 3. Tests E2E (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Coverage

- **Minimum**: 80% de coverage
- **Objectif**: 90%+
- **Focus**: Domain layer (100% coverage requis)

### Commandes

```bash
# Tests unitaires
npm test

# Mode watch
npm run test:watch

# Coverage
npm run test:coverage

# E2E
npm run test:e2e

# E2E UI mode
npm run test:e2e:ui
```

---

## Documentation

### Quand Documenter?

- **Nouvelle feature**: Créer/mettre à jour `docs/features/[feature]/README.md`
- **Changement d'architecture**: Mettre à jour `docs/architecture/`
- **Nouveau script**: Documenter dans `scripts/README.md`
- **Breaking change**: Mettre à jour migration guide

### Format

- Utiliser Markdown
- Inclure des exemples de code
- Ajouter des diagrammes si nécessaire (Mermaid)
- Liens vers la documentation externe

### Exemple

````markdown
# Feature X

## Vue d'ensemble

[Description de la feature]

## Architecture

[Diagramme ou description]

## Usage

```typescript
// Exemple de code
```
````

## API

### `createX(params)`

- **Params**: `{ name: string }`
- **Returns**: `Result<X, Error>`
- **Example**:

```typescript
const result = createX({ name: 'test' });
```

```

---

## Checklist Avant Commit

Utilisez cette checklist avant chaque commit:

- [ ] Code compilé sans erreurs TypeScript
- [ ] Linting passé (`npm run lint`)
- [ ] Tests passés (`npm test`)
- [ ] Aucun `any` type introduit
- [ ] Result Pattern respecté
- [ ] Architecture hexagonale respectée
- [ ] Documentation mise à jour
- [ ] Composants < 500 lignes
- [ ] Imports utilisent les alias `@/`
- [ ] Aucun `console.log` / `alert()` / `confirm()` natif

---

## Ressources Utiles

### Documentation Interne

- [Development Guide](./docs/development/DEVELOPMENT.md)
- [Coding Guidelines](./docs/guides/CODING_GUIDELINES.md)
- [Testing Guide](./docs/development/TESTING-GUIDE.md)
- [Architecture](./docs/architecture/ARCHITECTURE.md)

### Documentation Externe

- [Next.js](https://nextjs.org/docs)
- [tRPC](https://trpc.io/docs)
- [Prisma](https://www.prisma.io/docs)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

---

## Questions?

Si vous avez des questions:

1. Consultez la documentation dans `docs/`
2. Vérifiez les issues GitHub existantes
3. Créez une nouvelle issue avec le tag `question`
4. Contactez l'équipe de développement

---

## Remerciements

Merci de contribuer à ReviewLottery V3! Votre travail aide à construire une meilleure application pour tous.

---

**Dernière mise à jour**: 2025-12-11
**Version**: 3.0.0
```
