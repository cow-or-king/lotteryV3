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

  const { error } = await supabaseAdmin.storage.from('store-logos').upload(filePath, file, {
    upsert: true,
    cacheControl: '3600',
  });

  if (error) throw error;

  // 3. Récupérer URL publique
  const { data } = supabaseAdmin.storage.from('store-logos').getPublicUrl(filePath);

  return { url: data.publicUrl, path: filePath };
}
```

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

# Reset database
npx prisma migrate reset
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

---

## 📝 Workflow de Review

### Étapes à Suivre

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

## 📞 Support

**En cas de doute:**

1. Lire ce fichier `docs/CONVENTIONS.md`
2. Vérifier `docs/architecture/ARCHITECTURE.md`
3. Consulter le template `docs/reviews/REVIEW_TEMPLATE.md`
4. Demander une review à Claude

**Fichier de référence à mentionner:**

> "Suis les conventions dans `docs/CONVENTIONS.md`"

---

**Dernière mise à jour:** 2025-12-12
**Version:** 1.0
