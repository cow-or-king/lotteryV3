# 📋 Conventions & Standards ReviewLottery v3

> **FICHIER DE RÉFÉRENCE CENTRAL**
> Ce fichier doit être suivi systématiquement pour tous les développements

---

## 🎯 Règles Fondamentales

### 1. TypeScript Ultra-Strict

```typescript
// ✅ BON
interface UserEntity {
  id: string;
  email: string;
  name: string | null;
}

// ❌ INTERDIT
const data: any = {};
const user: Record<string, any> = {};
```

**RÈGLE:** ZERO `any` types - Tous les types doivent être explicites

---

## 🏗️ Architecture Hexagonale

### Structure des Dossiers

```
src/
├── core/                    # ⭐ Logique métier PURE
│   ├── entities/           # Entities (pas de dépendances)
│   ├── ports/              # Interfaces (repositories)
│   └── use-cases/          # Business logic
│
├── infrastructure/          # 🔌 Adapters
│   ├── database/           # Prisma client
│   ├── repositories/       # Implémentation des ports
│   └── encryption/         # Services externes
│
├── server/                  # 🌐 API Layer
│   └── api/
│       └── routers/        # tRPC routers
│
├── app/                     # 📱 Presentation (Next.js)
├── components/              # 🎨 UI Components
├── hooks/                   # 🪝 Custom React Hooks
└── lib/                     # 🛠️ Utilities
    ├── types/
    ├── utils/
    └── constants/
```

### Flux de Données

```
UI → tRPC Router → Use Case → Repository → Prisma
   ←              ←          ←            ←
```

**INTERDICTIONS:**

- ❌ `core/` ne doit JAMAIS importer `infrastructure/`
- ❌ `core/` ne doit JAMAIS importer `server/`
- ❌ `use-cases/` ne doit JAMAIS importer Prisma directement

---

## 🛡️ Result Pattern

### Toujours Utiliser Result<T, Error>

```typescript
// ✅ BON - Use Case
export class CreateStoreUseCase {
  async execute(data: CreateStoreDTO): Promise<Result<StoreEntity>> {
    // Validation
    if (!data.name) {
      return Result.fail(new Error('Nom requis'));
    }

    // Business logic
    const store = await this.repository.create(data);

    if (!store) {
      return Result.fail(new Error('Création échouée'));
    }

    return Result.ok(store);
  }
}

// ✅ BON - Router
const result = await createStoreUseCase.execute(input);

if (!result.success) {
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: result.error.message,
  });
}

return result.data;
```

**RÈGLE:** Pas de `throw` dans les Use Cases - Uniquement dans les Routers

---

## 🔐 Validation (Zod)

### Double Validation Client + Serveur

```typescript
// 1️⃣ CLIENT - hooks/stores/utils/storeValidation.ts
export function validateStoreForm(data: StoreFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères';
  }

  if (data.googleBusinessUrl && !isValidUrl(data.googleBusinessUrl)) {
    errors.googleBusinessUrl = 'URL invalide';
  }

  return errors;
}

// 2️⃣ SERVEUR - server/api/routers/store.router.ts
create: protectedProcedure
  .input(
    z.object({
      name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
      googleBusinessUrl: z.string().url('URL invalide'),
      logoUrl: z.string().optional().refine(
        (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
        'URL du logo invalide'
      ),
    })
  )
  .mutation(async ({ ctx, input }) => { ... })
```

**RÈGLE:** Toujours valider côté client ET serveur

---

## 🗄️ Supabase - Bonnes Pratiques

### 1. Client vs Admin

```typescript
// ✅ BON - Client côté navigateur
import { createBrowserClient } from '@/lib/supabase/client';
const supabase = createBrowserClient();

// ✅ BON - Admin côté serveur
import { createServerClient } from '@/lib/supabase/server';
const supabaseAdmin = createServerClient(true); // isAdmin = true
```

### 2. Storage - Upload de Fichiers

```typescript
// ✅ BON - lib/utils/supabase-storage.ts
export async function uploadStoreLogoServer(
  brandId: string,
  file: File,
): Promise<{ url: string; path: string }> {
  // 1. Validation
  if (file.size > MAX_LOGO_FILE_SIZE) {
    throw new Error('Fichier trop volumineux (max 2MB)');
  }

  if (!ACCEPTED_LOGO_FORMATS.includes(file.type)) {
    throw new Error('Format non supporté');
  }

  // 2. Upload vers Storage
  const fileName = `logo.${file.type.split('/')[1]}`;
  const filePath = `${brandId}/${fileName}`;

  const { error } = await supabaseAdmin.storage.from('brand-logos').upload(filePath, file, {
    upsert: true,
    cacheControl: '3600',
  });

  if (error) throw error;

  // 3. Récupérer URL publique
  const { data } = supabaseAdmin.storage.from('brand-logos').getPublicUrl(filePath);

  return { url: data.publicUrl, path: filePath };
}
```

**Buckets Supabase Storage:**

- `brand-logos` - Logos des enseignes (Brands)
  - Public: ✅
  - MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`
  - Taille max: 2MB
  - Structure: `{brandId}/logo.{ext}`

**Configuration RLS (Row Level Security):**

```sql
-- Storage policies pour brand-logos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'brand-logos' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'brand-logos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING ( auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING ( auth.uid()::text = (storage.foldername(name))[1] );
```

**Validation complète:**

```typescript
// ✅ Validation côté client ET serveur
const ACCEPTED_LOGO_FORMATS = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_LOGO_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Client-side validation (hooks)
function validateLogoFile(file: File): string | null {
  if (!ACCEPTED_LOGO_FORMATS.includes(file.type)) {
    return 'Format non supporté. Utilisez PNG, JPEG, WEBP ou SVG.';
  }
  if (file.size > MAX_LOGO_FILE_SIZE) {
    return 'Fichier trop volumineux (max 2MB).';
  }
  return null;
}

// Server-side validation (router)
.input(
  z.object({
    logoFile: z.instanceof(File)
      .refine((file) => ACCEPTED_LOGO_FORMATS.includes(file.type), 'Format non supporté')
      .refine((file) => file.size <= MAX_LOGO_FILE_SIZE, 'Fichier trop volumineux'),
  })
)
```

**Guide complet:** `docs/setup/SUPABASE_STORAGE_SETUP.md`

### 3. Requêtes Database

```typescript
// ✅ BON - Éviter N+1 queries
const uniqueBrandIds = [...new Set(stores.map((s) => s.brandId))];

const brands = await prisma.brand.findMany({
  where: { id: { in: uniqueBrandIds } },
  select: { id: true, name: true, logoUrl: true },
});

const brandsMap = new Map(brands.map((b) => [b.id, b]));

// ❌ MAUVAIS - N+1 queries
for (const store of stores) {
  const brand = await prisma.brand.findUnique({
    where: { id: store.brandId },
  });
}
```

---

## 🎨 UI/UX Standards

### 1. Design System Glassmorphism

```tsx
// ✅ BON - StoreCard
<div className="
  bg-white/50
  backdrop-blur-xl
  border border-purple-600/20
  rounded-2xl
  p-6
  hover:bg-white/60
  hover:border-purple-600/30
  transition-all duration-300
  hover:scale-[1.02]
">
```

**Palette de Couleurs:**

- Primary: `purple-600` (#5B21B6)
- Secondary: `pink-500` (#EC4899)
- Accent: `yellow-400` (#FACC15)
- Glass: `white/50` + `backdrop-blur-xl`
- Borders: `purple-600/20`

### 2. États Visuels

```tsx
// ✅ BON - Tous les états gérés
{
  isLoading && <Spinner />;
}
{
  error && <ErrorMessage message={error.message} />;
}
{
  !data.length && <EmptyState />;
}
{
  data.map((item) => <ItemCard key={item.id} {...item} />);
}
```

### 3. Couleurs de Texte dans les Inputs

```tsx
// ✅ BON - Contraste suffisant
<input
  className="
    text-gray-900           // ✅ Texte foncé sur fond clair
    placeholder:text-gray-500
    focus:text-gray-900
    disabled:text-gray-400
  "
/>

// ❌ MAUVAIS - Texte trop clair
<input className="text-gray-300" />  // ❌ Pas assez de contraste
```

**RÈGLE:** Toujours utiliser `text-gray-900` ou `text-gray-800` pour les inputs

### 4. Gradients - Utiliser bg-linear-to-\*

```tsx
// ✅ BON - Utiliser bg-linear-to-*
<div className="bg-linear-to-r from-purple-600 to-pink-500">

// ❌ MAUVAIS - Ne pas utiliser bg-gradient-to-*
<div className="bg-gradient-to-r from-purple-600 to-pink-500">
```

**RÈGLE:** Toujours utiliser `bg-linear-to-*` au lieu de `bg-gradient-to-*`

### 5. Toast Notifications

```tsx
// ✅ BON - Utiliser toast pour les feedbacks utilisateur
import { toast } from 'sonner';

// Succès
toast.success('Commerce créé avec succès');

// Erreur
toast.error('Impossible de créer le commerce');

// Info
toast.info('Synchronisation en cours...');

// Warning
toast.warning('Cette action est irréversible');

// Promise (opérations asynchrones)
toast.promise(createStore.mutateAsync(data), {
  loading: 'Création en cours...',
  success: 'Commerce créé avec succès',
  error: 'Erreur lors de la création',
});
```

**RÈGLES Toast:**

- ✅ Utiliser pour toutes les actions utilisateur (CRUD)
- ✅ Messages courts et clairs (max 60 caractères)
- ✅ Succès en vert, erreurs en rouge, info en bleu
- ✅ toast.promise pour les opérations async
- ❌ Ne pas abuser - 1 toast par action
- ❌ Pas de toast pour les validations de formulaire (afficher inline)

### 6. ConfirmDialog - Remplacer window.confirm

```tsx
// ❌ INTERDIT - window.confirm
const confirmed = window.confirm('Êtes-vous sûr ?');
if (confirmed) deleteStore();

// ✅ BON - Utiliser ConfirmDialog
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// Dans le composant
const [confirmOpen, setConfirmOpen] = useState(false);

<ConfirmDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="Supprimer le commerce"
  description="Êtes-vous sûr de vouloir supprimer ce commerce ? Cette action est irréversible."
  confirmLabel="Supprimer"
  cancelLabel="Annuler"
  variant="danger"
  onConfirm={() => {
    deleteStore.mutate(storeId);
  }}
/>

// Trigger du dialog
<Button onClick={() => setConfirmOpen(true)}>Supprimer</Button>
```

**RÈGLES ConfirmDialog:**

- ✅ Toujours utiliser pour actions destructives (DELETE)
- ✅ Variantes : `danger` (rouge), `warning` (orange), `default` (bleu)
- ✅ Description claire et explicite
- ✅ Labels de boutons personnalisés
- ❌ JAMAIS utiliser `window.confirm()` ou `window.alert()`
- ❌ JAMAIS utiliser `confirm()` natif du navigateur

**Guide complet:** `docs/guides/components/CONFIRM_DIALOG_USAGE.md`

### 7. Convention Variables Unused

```typescript
// ✅ BON - Underscore pour variables non utilisées
const { error: _error, isLoading: _isLoading } = useQuery();
const [_count, setCount] = useState(0);

// Dans les fonctions
function processData(_unusedParam: string, data: Data) {
  return data.process();
}

// Dans les callbacks
array.map((_item, index) => index);

// ❌ MAUVAIS - Pas de underscore
const { error, isLoading } = useQuery(); // ESLint va se plaindre si non utilisées
```

**RÈGLE:** Préfixer avec `_` toutes les variables intentionnellement non utilisées

---

## 🧪 Tests

### Structure des Tests

```typescript
// ✅ BON - create-store.use-case.test.ts
describe('CreateStoreUseCase', () => {
  let useCase: CreateStoreUseCase;
  let mockStoreRepo: MockStoreRepository;
  let mockBrandRepo: MockBrandRepository;

  beforeEach(() => {
    mockStoreRepo = new MockStoreRepository();
    mockBrandRepo = new MockBrandRepository();
    useCase = new CreateStoreUseCase(mockStoreRepo, mockBrandRepo);
  });

  describe('execute()', () => {
    it('should create store with new brand', async () => {
      // Arrange
      const input = {
        brandName: 'Test Brand',
        name: 'Test Store',
        googleBusinessUrl: 'https://...',
      };

      // Act
      const result = await useCase.execute(input, 'user-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockBrandRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Brand' }),
      );
    });

    it('should fail if brandName missing', async () => {
      // Arrange
      const input = {
        name: 'Test Store',
        googleBusinessUrl: 'https://...',
      };

      // Act
      const result = await useCase.execute(input, 'user-123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.message).toContain('brandName');
    });
  });
});
```

**RÈGLE:** Arrange-Act-Assert pattern obligatoire

---

## 🛠️ Commandes Utiles

### Development

```bash
# Démarrer le serveur
npm run dev

# Vider le cache Next.js
rm -rf .next && npm run dev

# Vider cache + node_modules
rm -rf .next node_modules/.cache && npm run dev
```

### Testing

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch
npm run test:watch

# Lancer les tests avec coverage
npm run test:coverage

# Lancer uniquement les tests unitaires
npm run test:unit

# Lancer uniquement les tests d'intégration
npm run test:integration

# Lancer les tests E2E (Playwright)
npm run test:e2e

# Lancer E2E en mode UI (debug)
npm run test:e2e:ui

# Lancer E2E avec rapport
npm run test:e2e:report
```

### Type Checking & Linting

```bash
# Type-check TypeScript
npm run type-check
# ou
npx tsc --noEmit

# Linter (ESLint)
npm run lint

# Linter avec auto-fix
npm run lint:fix

# Format avec Prettier
npm run format

# Vérifier le formatting
npm run format:check
```

### Database (Prisma)

```bash
# Générer le client Prisma
npx prisma generate

# Créer une migration
npx prisma migrate dev --name description-migration

# Push schema sans migration
npx prisma db push

# Studio (GUI database)
npx prisma studio

# Studio sur port spécifique
npx prisma studio --port 5555

# Reset database
npx prisma migrate reset

# Seed la database
npx prisma db seed
```

### Supabase

```bash
# Upload fichier vers Storage (via script)
node scripts/upload-to-storage.js

# Vérifier connexion
curl https://dhedkewujbazelsdihtr.supabase.co/rest/v1/

# Tester Storage bucket public
curl https://dhedkewujbazelsdihtr.supabase.co/storage/v1/object/public/store-logos/test.png
```

### Git

```bash
# Commit avec message formaté
git add -A
git commit -m "✨ feat: description"

# Push vers origin
git push origin main

# Voir les changements
git diff
git status
```

### Scripts de Diagnostic

```bash
# Diagnostic complet du projet
npm run diagnostic
# Vérifie: routes, modèles, imports, Next.js config, etc.

# Analyser les routes
node scripts/diagnostic/analyze-routes.js

# Lister les modèles Prisma
node scripts/diagnostic/list-prisma-models.js

# Vérifier les imports
node scripts/diagnostic/check-imports.js

# Vérifier la config Next.js
node scripts/diagnostic/check-nextjs-config.js
```

### Scripts Base de Données

```bash
# Créer un super admin
npx tsx scripts/database/create-super-admin.ts

# Seed la database
npx tsx scripts/database/seed.ts

# Lister les utilisateurs
npx tsx scripts/database/list-users.ts
```

---

## 📝 Workflow de Review Automatisé

### Déclencheurs Automatiques

Le workflow automatique se déclenche pour:

**✅ Nouvelles Routes/Pages**

```
"Créer une page /dashboard/analytics"
"Ajouter une route pour les rapports"
```

**✅ Nouveaux Modèles de Données**

```
"Ajouter un modèle Prize dans Prisma"
"Créer une entité Participant"
```

**✅ Nouvelles Features**

```
"Implémenter le système de notifications"
"Ajouter l'export PDF des rapports"
```

**✅ Refactoring Majeur**

```
"Refactorer le auth system pour utiliser des ports"
"Optimiser les requêtes de la page dashboard"
```

### Workflow Complet (Opus ↔ Sonnet)

**Référence archive:** `docs/archive/AUTOMATED_WORKFLOW.md` et `docs/archive/WORKFLOW_GUIDE.md`

#### Phase 1: Planification (Opus)

- Analyse de la demande
- Design architectural
- Plan d'implémentation détaillé
- Validation utilisateur

#### Phase 2: Implémentation (Sonnet)

- Setup initial (structure, tests)
- Implémentation TDD (Red → Green → Refactor)
- Ordre: Entities → Use Cases → Repositories → tRPC → UI
- Standards obligatoires (ZERO any, Result Pattern, etc.)

#### Phase 3: Review Automatique (Opus)

- Review multi-niveaux :
  1. Architecture (hexagonale, séparation couches)
  2. Code Quality (ZERO any, Branded types, Result Pattern)
  3. Tests (coverage > 80%, pas de flaky)
  4. Performance (N+1 queries, index)
  5. Sécurité (validation, permissions, secrets)
  6. UI/UX (design system, responsive, a11y)
- Décision : APPROVED / NEEDS CHANGES / REJECTED

#### Phase 4: Corrections ou Commit

- Si REJECTED/NEEDS CHANGES → Retour Phase 2
- Si APPROVED → Commit automatique avec message standardisé

### Étapes Manuelles de Review

```bash
# 1. Lancer les tests
npm test

# 2. Vérifier le lint
npm run lint

# 3. Vérifier le type-check
npm run type-check

# 4. Créer la review
# Utiliser le template: docs/reviews/REVIEW_TEMPLATE.md

# 5. Sauvegarder la review
docs/reviews/REVIEW_FEATURE_NAME_DATE.md

# 6. Commit
git add -A
git commit -m "📝 docs: Review [FEATURE_NAME]"
```

### Structure Review

```markdown
# Code Review - [Feature Name]

## 📊 Review Summary

**Date:** YYYY-MM-DD
**Reviewer:** [Nom]
**Feature:** [Description]
**Status:** ✅ APPROVED / ⚠️ NEEDS CHANGES / ❌ REJECTED

## 🏗️ Architecture Review

- [x] ✅ Architecture Hexagonale respectée
- [x] ✅ ZERO any types

## 💻 Code Quality

- [x] ✅ Result Pattern utilisé
- [x] ✅ Validation Zod complète

## 🧪 Tests

- [ ] ❌ Tests manquants

## 🐛 Issues Détectées

### 🔴 Critical

1. [Description]

### 🟠 Major

1. [Description]

## ✨ Points Positifs

- Architecture propre
- TypeScript strict

## 🎯 Décision Finale

**Status:** ✅ APPROVED
```

---

## 📂 Organisation des Fichiers Documentation

### Structure Obligatoire

```
docs/
├── CONVENTIONS.md           ⭐ CE FICHIER (référence centrale)
├── README.md                # Vue d'ensemble projet
│
├── architecture/            # Architecture & design
│   ├── ARCHITECTURE.md
│   └── ARCHITECTURE-MODULAIRE.md
│
├── development/             # Guides développement
│   ├── DEVELOPMENT.md
│   └── TESTING-GUIDE.md
│
├── guides/                  # Guides spécifiques
│   └── CODING_GUIDELINES.md
│
├── planning/                # Planning & roadmap
│   ├── PROJECT-STATUS.md
│   ├── ROADMAP.md
│   └── PRD_ReviewLottery_v3.md
│
├── reviews/                 # Code reviews
│   ├── REVIEW_TEMPLATE.md   # Template à utiliser
│   └── REVIEW_*.md          # Reviews datées
│
├── setup/                   # Setup & configuration
│   ├── SUPABASE_SETUP.md
│   └── SUPABASE_STORAGE_SETUP.md
│
└── features/                # Documentation features
    ├── qr-codes/
    └── reviews/
```

**RÈGLES:**

- ❌ PAS de fichiers `.md` à la racine (sauf README.md)
- ❌ PAS de duplication de contenu
- ✅ Toujours suivre la structure ci-dessus

---

## 🚫 Anti-Patterns à Éviter

### 1. Duplication de Logique

```typescript
// ❌ MAUVAIS - Duplication
// Dans useStores.ts
if (!formData.logoFile && !formData.logoUrl.trim()) {
  errors.logoUrl = 'Logo requis';
}

// Dans store.router.ts
if (!input.logoFile && !input.logoUrl) {
  throw new Error('Logo requis');
}

// ✅ BON - Centraliser dans un Use Case
const result = await validateStoreLogo(input);
if (!result.success) {
  return Result.fail(result.error);
}
```

### 2. Fichiers Temporaires Non Supprimés

```typescript
// ❌ MAUVAIS - Route temporaire qui reste
migrateLogos: protectedProcedure.mutation(async () => {
  // Migration temporaire
});

// ✅ BON - Supprimer après utilisation
// Créer un script one-off dans scripts/
// Supprimer après exécution
```

### 3. Documentation Obsolète

```markdown
<!-- ❌ MAUVAIS - Doc non mise à jour -->

## QR Code

Les QR codes utilisent le slug du Store: /s/{slug}

<!-- ✅ BON - Doc à jour -->

## QR Code

Les QR codes utilisent l'ID du Store: /s/{id}
Mis à jour: 2025-12-12
```

---

## 🎯 Checklist Avant Commit

```bash
# ✅ Tests
npm test

# ✅ Lint
npm run lint

# ✅ Type Check
npx tsc --noEmit

# ✅ Vérifier structure fichiers
ls -la docs/  # Pas de fichiers à la racine

# ✅ Vérifier pas de duplication
grep -r "TODO" src/  # Nettoyer les TODOs

# ✅ Vérifier messages de commit
git log --oneline -5

# ✅ Review perso
# - Architecture hexagonale respectée ?
# - ZERO any types ?
# - Result Pattern utilisé ?
# - Tests ajoutés ?
```

---

## 🤖 Agents Disponibles

### 1. Architecture Planner

**Rôle:** Aide à concevoir l'architecture pour features complexes

**Quand l'utiliser:**

- Features nécessitant plusieurs entités
- Refactoring architectural majeur
- Nouveau domaine métier

**Comment:**

```
"Utilise l'agent Architecture Planner pour designer le système de notifications"
```

### 2. Code Reviewer

**Rôle:** Review exhaustive multi-niveaux du code

**Quand l'utiliser:**

- Après chaque implémentation de feature
- Avant chaque commit majeur
- Après refactoring

**Critères de review:**

- ✅ Architecture hexagonale respectée
- ✅ ZERO any types
- ✅ Result Pattern utilisé
- ✅ Tests coverage > 80%
- ✅ Performance optimisée
- ✅ Sécurité validée
- ✅ UI/UX cohérente

### 3. Test Generator

**Rôle:** Génère tests supplémentaires si coverage insuffisant

**Quand l'utiliser:**

- Coverage < 80%
- Tests manquants identifiés
- Besoin de tests d'intégration

### 4. Documentation Writer

**Rôle:** Génère JSDoc, README, CHANGELOG

**Quand l'utiliser:**

- Avant commit de feature majeure
- Nouvelle API publique
- Mise à jour architecture

---

## 💡 Bonnes Pratiques & Do's/Don'ts

### ✅ Do's

**Sois clair dans tes demandes**

```
✅ BON: "Créer une page de gestion des utilisateurs avec CRUD complet"
❌ VAGUE: "Ajoute un truc pour les users"
```

**Fais confiance au process**

```
✅ Laisse Opus planifier
✅ Laisse Sonnet implémenter
✅ Laisse Opus reviewer
❌ N'interviens pas pendant l'implémentation
```

**Valide les plans**

```
✅ Lis le plan proposé
✅ Demande des clarifications si besoin
✅ Valide ou demande des ajustements
```

**Teste avant de commit**

```
✅ npm test (tous les tests passent)
✅ npm run lint (0 erreurs)
✅ npx tsc --noEmit (0 erreurs TypeScript)
✅ Tester manuellement les flows critiques
```

### ❌ Don'ts

**N'interromps pas le workflow**

```
❌ Pas de "fait juste ça vite" pendant l'implémentation
❌ Pas de shortcuts qui cassent le process
```

**Ne skip pas la review**

```
❌ Même si ça a l'air bon
❌ Même pour de petits changements
```

**Ne modifie pas les standards**

```
❌ Ne baisse pas minCoverage < 80%
❌ Ne désactive pas zeroAnyTypes
❌ Ne skip pas les validations Zod
```

**Ne commit pas de code cassé**

```
❌ Tests failing
❌ TypeScript errors
❌ ESLint errors
❌ Build errors
```

---

## 🔐 Sécurité & APIs Externes

### 1. Variables d'Environnement

```bash
# .env.local (JAMAIS commiter)
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.xxx:yyy@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:yyy@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

# OpenAI
OPENAI_API_KEY=sk-...

# Google My Business (optional)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# NextAuth (si utilisé)
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
```

**RÈGLES:**

- ✅ `.env.local` pour développement local
- ✅ `.env.example` pour template (sans valeurs sensibles)
- ✅ Variables de production dans Vercel/Railway dashboard
- ❌ JAMAIS commiter `.env.local` ou `.env`
- ❌ JAMAIS hardcoder des clés API dans le code

### 2. Encryption des Données Sensibles

```typescript
// ✅ BON - Encryption des tokens Google
import { encrypt, decrypt } from '@/lib/encryption';

// Avant stockage en DB
const encryptedAccessToken = encrypt(googleTokens.access_token);
const encryptedRefreshToken = encrypt(googleTokens.refresh_token);

await prisma.store.update({
  where: { id: storeId },
  data: {
    googleAccessToken: encryptedAccessToken,
    googleRefreshToken: encryptedRefreshToken,
  },
});

// Avant utilisation
const decryptedAccessToken = decrypt(store.googleAccessToken);
```

**Données à encrypter:**

- ✅ Google OAuth tokens (access_token, refresh_token)
- ✅ API keys tierces
- ✅ Données personnelles sensibles (RGPD)
- ❌ Emails (indexation requise)
- ❌ IDs publics
- ❌ Slugs

### 3. Configuration APIs Externes

**OpenAI (GPT-4o-mini)**

- Usage: Génération de réponses aux avis
- Modèle: `gpt-4o-mini`
- Max tokens: 500
- Temperature: 0.7

**Google My Business API**

- Usage: Récupération des avis Google
- Scope: `https://www.googleapis.com/auth/business.manage`
- OAuth 2.0: Authorization Code Flow
- Refresh token: Stocké encrypté en DB

**Supabase Auth**

- Provider: Email/Password (pas de Magic Link pour l'instant)
- Session: HTTP-only cookies
- JWT: Signature avec secret Supabase

**Guide complet:** `docs/api/CURRENT-APIS.md`

---

## 🐛 Bugs Connus & Solutions

> **IMPORTANT:** Cette section doit être mise à jour à chaque fois qu'un bug est rencontré ET résolu, pour éviter de le rencontrer à nouveau.

### 1. Logo Upload - Validation côté serveur manquante

**Bug rencontré:** 2025-12-12
**Symptôme:** Fichiers non-images acceptés côté serveur
**Cause:** Validation uniquement côté client
**Solution:**

```typescript
// ✅ SOLUTION: Double validation client + serveur
// Serveur (store.router.ts)
.input(
  z.object({
    logoFile: z.instanceof(File).refine(
      (file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
      'Format non supporté'
    ).refine(
      (file) => file.size <= 2 * 1024 * 1024,
      'Fichier trop volumineux (max 2MB)'
    ).optional(),
  })
)
```

### 2. QR Code URL - Utilisation de slug au lieu de ID

**Bug rencontré:** 2025-12-11
**Symptôme:** QR codes cassés après modification du nom du Store
**Cause:** URL basée sur slug modifiable
**Solution:**

```typescript
// ❌ ANCIEN: URL avec slug
const qrUrl = `/s/${store.slug}`;

// ✅ NOUVEAU: URL avec ID (permanent)
const qrUrl = `/s/${store.id}`;
```

### 3. Cache Next.js - Changements non reflétés

**Bug récurrent:** Fréquent
**Symptôme:** Modifications de code non visibles dans le navigateur
**Solution:**

```bash
# Vider le cache Next.js
rm -rf .next && npm run dev

# Si persiste, vider aussi node_modules cache
rm -rf .next node_modules/.cache && npm run dev
```

### 4. Prisma Client - Types non à jour

**Bug récurrent:** Après migration Prisma
**Symptôme:** TypeScript errors sur types Prisma
**Solution:**

```bash
# Régénérer le client Prisma
npx prisma generate

# Si persiste, relancer le dev server
rm -rf .next && npm run dev
```

### 5. Supabase Storage - Upload échoue en silence

**Bug rencontré:** 2025-12-10
**Symptôme:** Upload semble réussir mais fichier absent
**Cause:** Permissions bucket incorrectes ou chemin invalide
**Solution:**

```typescript
// ✅ Vérifier les permissions du bucket dans Supabase Dashboard
// ✅ Utiliser le bon chemin (brandId/filename)
const filePath = `${brandId}/${fileName}`;

// ✅ Toujours vérifier l'erreur
const { error } = await supabase.storage.from('brand-logos').upload(filePath, file);
if (error) {
  console.error('Upload error:', error);
  throw new Error(`Upload failed: ${error.message}`);
}
```

### 6. tRPC - Input validation bypass

**Bug potentiel:** Risque sécurité
**Prévention:**

```typescript
// ❌ DANGEREUX: Pas de validation
.input(z.object({ data: z.any() }))

// ✅ SÉCURISÉ: Validation stricte
.input(
  z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    age: z.number().int().min(0).max(150),
  })
)
```

### 7. React Hook - Infinite loop

**Bug récurrent:** useEffect sans dépendances correctes
**Solution:**

```typescript
// ❌ MAUVAIS: Infinite loop
useEffect(() => {
  fetchData();
}, []); // fetchData manquant dans deps

// ✅ BON: Dépendances correctes
useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ MEILLEUR: useCallback pour stabiliser la fonction
const fetchData = useCallback(
  async () => {
    // ...
  },
  [
    /* deps */
  ],
);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 8. Branded Types - Type assertion incorrecte

**Bug rencontré:** 2025-12-09
**Symptôme:** Runtime errors sur IDs invalides
**Solution:**

```typescript
// ❌ DANGEREUX: Assertion sans validation
const userId = input.userId as UserId;

// ✅ SÉCURISÉ: Validation avant assertion
import { isUserId } from '@/lib/types/branded';

if (!isUserId(input.userId)) {
  return Result.fail(new Error('Invalid user ID'));
}
const userId = input.userId; // Type inféré automatiquement
```

### Template pour ajouter un nouveau bug

````markdown
### X. [Titre du Bug]

**Bug rencontré:** YYYY-MM-DD
**Symptôme:** [Description du problème visible]
**Cause:** [Cause racine identifiée]
**Solution:**

```typescript
// ❌ ANCIEN CODE / CODE PROBLÉMATIQUE
// ✅ NOUVEAU CODE / SOLUTION
[code][code];
```
````

**Prévention:** [Comment éviter ce bug à l'avenir]

```

---

## 🎯 Suivi du Développement

**FICHIER DE SUIVI PRINCIPAL**: [`docs/planning/DEVELOPMENT-TRACKER.md`](./planning/DEVELOPMENT-TRACKER.md)

⚠️ **IMPORTANT**: Ce fichier doit être mis à jour **À CHAQUE COMMIT** avec:
- Tâches complétées (cocher [x])
- Nouvelles tâches découvertes
- Fonctionnalités implémentées
- Bugs/issues rencontrés
- Estimation d'avancement

**Workflow obligatoire**:
1. Avant de développer → Lire DEVELOPMENT-TRACKER.md
2. Pendant le dev → Ajouter nouvelles tâches au tracker
3. Après le dev → Mettre à jour le tracker avec progression
4. Commit → Inclure "Updated: docs/planning/DEVELOPMENT-TRACKER.md" dans le message

---

## 📞 Support

**En cas de doute:**

1. Lire ce fichier `docs/CONVENTIONS.md`
2. Vérifier `docs/planning/DEVELOPMENT-TRACKER.md` pour l'état du projet
3. Consulter `docs/architecture/ARCHITECTURE.md`
4. Consulter le template `docs/reviews/REVIEW_TEMPLATE.md`
5. Demander une review à Claude

**Fichiers de référence à mentionner:**

> "Suis les conventions dans `docs/CONVENTIONS.md`"
> "Vérifie l'état du projet dans `docs/planning/DEVELOPMENT-TRACKER.md`"

---

## 📚 Références Documentation Complémentaire

### Guides de Développement

Pour des guides plus détaillés, consulter également :

- **[docs/development/DEVELOPMENT.md](./development/DEVELOPMENT.md)** - Guide complet de développement avec workflows détaillés
- **[docs/development/TESTING-GUIDE.md](./development/TESTING-GUIDE.md)** - Guide approfondi des tests (unit, integration, e2e)
- **[docs/development/CODE-REVIEW.md](./development/CODE-REVIEW.md)** - Process de code review détaillé
- **[docs/development/CODE_REVIEW_SUMMARY.md](./development/CODE_REVIEW_SUMMARY.md)** - Résumés des reviews passées
- **[docs/development/CRITICAL_FIXES_SUMMARY.md](./development/CRITICAL_FIXES_SUMMARY.md)** - Historique des correctifs critiques

**Note:** Ces fichiers complètent les conventions de base. En cas de conflit, `CONVENTIONS.md` fait autorité.

---

**Dernière mise à jour:** 2025-12-12
**Version:** 3.0 - Version Ultra-Complète avec Toutes les Bonnes Pratiques du Projet

**Changelog v3.0:**
- ✅ Ajout section "Commandes Testing" complètes (unit, integration, e2e, coverage)
- ✅ Ajout "Type Checking & Linting" (type-check, lint, format)
- ✅ Ajout "Scripts de Diagnostic" (analyze-routes, list-models, check-imports)
- ✅ Ajout "Scripts Base de Données" (create-super-admin, seed, list-users)
- ✅ Ajout convention "Variables Unused" (underscore pattern)
- ✅ Ajout pattern "ConfirmDialog" pour remplacer window.confirm
- ✅ Enrichissement section "Supabase Storage" (buckets, RLS policies, validation complète)
- ✅ Ajout section "Sécurité & APIs Externes" (env vars, encryption, APIs config)
- ✅ Documentation OpenAI, Google My Business, Supabase Auth

**Changelog v2.0:**
- ✅ Ajout section "Agents Disponibles" (Architecture Planner, Code Reviewer, Test Generator, Documentation Writer)
- ✅ Ajout section "Bonnes Pratiques & Do's/Don'ts" complète
- ✅ Ajout section "Bugs Connus & Solutions" avec 8 bugs documentés + template
- ✅ Ajout "Déclencheurs Automatiques" pour le workflow
- ✅ Enrichissement workflow review avec références archives
- ✅ Mise à jour guidelines Toast et Gradients
```
