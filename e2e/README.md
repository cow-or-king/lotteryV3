# Tests E2E avec Playwright

Tests end-to-end pour ReviewLottery V3 avec Playwright.

## 🚀 Quick Start

```bash
# Lancer tous les tests E2E
npm run test:e2e

# Lancer les tests en mode UI interactif
npm run test:e2e:ui

# Lancer les tests en mode headed (voir le navigateur)
npm run test:e2e:headed

# Débugger un test spécifique
npm run test:e2e:debug

# Voir le rapport des tests
npm run test:e2e:report
```

## 📁 Structure

```
e2e/
├── auth/                   # Tests d'authentification
│   ├── login.spec.ts       # Tests de connexion
│   └── logout.spec.ts      # Tests de déconnexion
├── dashboard/              # Tests du dashboard
│   ├── navigation.spec.ts  # Tests de navigation
│   ├── prizes-templates.spec.ts  # Tests des modèles de gains
│   └── prizes-sets.spec.ts       # Tests des lots de gains
├── fixtures/               # Données de test
│   └── users.ts           # Utilisateurs de test
└── utils/                 # Utilitaires
    └── auth.ts            # Helpers d'authentification
```

## 📝 Suites de Tests

### Authentication (`auth/`)

- ✅ Login avec credentials valides/invalides
- ✅ Validation des champs
- ✅ Redirection après login
- ✅ Logout
- ✅ Protection des routes

### Dashboard Navigation (`dashboard/navigation.spec.ts`)

- ✅ Affichage du menu
- ✅ Navigation entre les pages
- ✅ Menu utilisateur
- ✅ Responsive mobile

### Prize Templates (`dashboard/prizes-templates.spec.ts`)

- ✅ Listing des modèles de gains
- ✅ Création d'un modèle
- ✅ Édition d'un modèle
- ✅ Suppression d'un modèle
- ✅ Validation des champs
- ✅ Filtrage par enseigne
- ✅ Gestion des gains communs (brandId null)

### Prize Sets (`dashboard/prizes-sets.spec.ts`)

- ✅ Listing des lots
- ✅ Création d'un lot
- ✅ Édition d'un lot
- ✅ Suppression d'un lot
- ✅ Ajout de gains à un lot
- ✅ Validation des probabilités
- ✅ Statistiques des lots
- ✅ Gestion du statut actif/inactif

## 🔧 Configuration

La configuration Playwright se trouve dans `playwright.config.ts`:

- **Navigateurs testés**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:3000` (configurable via `NEXT_PUBLIC_APP_URL`)
- **Screenshots**: Uniquement en cas d'échec
- **Traces**: Uniquement lors du premier retry
- **Retries**: 2 en CI, 0 en local

## 📊 Fixtures

### Utilisateurs de test

Les utilisateurs de test sont définis dans `fixtures/users.ts`:

```typescript
{
  admin: {
    email: 'admin@test.com',
    password: 'Test123456!',
  },
  user: {
    email: 'user@test.com',
    password: 'Test123456!',
  }
}
```

**IMPORTANT**: Ces utilisateurs doivent exister dans votre base de données de test.

## 🛠️ Utilitaires

### Auth Helpers (`utils/auth.ts`)

```typescript
// Login
await login(page, testUsers.admin);

// Logout
await logout(page);

// Vérifier si authentifié
const isAuth = await isAuthenticated(page);
```

## 🧪 Écrire un nouveau test

```typescript
import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';
import { login } from '../utils/auth';

test.describe('Ma Feature', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin);
    await page.goto('/ma-page');
  });

  test('devrait faire quelque chose', async ({ page }) => {
    // Arrange
    const button = page.locator('button');

    // Act
    await button.click();

    // Assert
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

## 📋 Best Practices

1. **Utiliser des data-testid**: Pour les éléments critiques, ajouter `data-testid` aux composants
2. **Tests isolés**: Chaque test doit être indépendant
3. **Descriptive names**: Noms de tests en français, descriptifs
4. **Arrange-Act-Assert**: Structure claire des tests
5. **Attendre les éléments**: Toujours utiliser `await expect()` pour la synchronisation
6. **Clean up**: Utiliser `beforeEach` et `afterEach` pour setup/cleanup

## 🐛 Debugging

### Mode Debug

```bash
npm run test:e2e:debug
```

### Mode UI

```bash
npm run test:e2e:ui
```

### Voir les traces

Les traces sont sauvegardées en cas d'échec et peuvent être visualisées avec:

```bash
npx playwright show-trace trace.zip
```

## 📈 CI/CD

En environnement CI:

- Les tests s'exécutent en mode headless
- 2 retries automatiques en cas d'échec
- 1 worker (séquentiel) pour éviter les conflits

## 🔒 Variables d'environnement

Les tests utilisent les variables d'environnement de `.env.local`:

- `NEXT_PUBLIC_APP_URL`: URL de l'application
- `NEXT_PUBLIC_SUPABASE_URL`: URL Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clé anonyme Supabase

## 📚 Ressources

- [Documentation Playwright](https://playwright.dev)
- [Best Practices Playwright](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
