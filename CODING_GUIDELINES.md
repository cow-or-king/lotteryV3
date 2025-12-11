# Bonnes Pratiques de Développement - ReviewLottery V3

## 🎯 Principes Fondamentaux

### TypeScript Ultra-Strict

- **ZERO `any` types** - Toujours typer explicitement
- Utiliser les types de `@/lib/types/` pour les types partagés
- Branded Types pour les IDs (ex: `UserId`, `StoreId`)
- Result Pattern pour la gestion d'erreurs

### Architecture

- **Architecture Hexagonale** avec Domain-Driven Design
- Séparation claire : Domain / Application / Infrastructure / Presentation
- Chaque module a sa propre structure de dossiers

## 📁 Organisation des Fichiers

### Structure Recommandée

```
src/
├── app/                    # Pages Next.js
├── components/            # Composants UI réutilisables
│   ├── ui/               # Composants de base (Button, Input, etc.)
│   └── [feature]/        # Composants par fonctionnalité
├── hooks/                # Custom hooks React
│   └── [feature]/        # Hooks par fonctionnalité
├── lib/                  # Logique métier & utilitaires
│   ├── types/           # Types TypeScript partagés
│   ├── trpc/            # Configuration tRPC
│   └── utils/           # Fonctions utilitaires
└── server/              # Code backend (tRPC routers)
```

### Règles de Fichiers

1. **Un composant = Un fichier** (sauf composants très petits)
2. **Types partagés** → `src/lib/types/`
3. **Composants > 300 lignes** → Découper en sous-composants
4. **Logique complexe** → Extraire dans un custom hook

## 🧩 Composants React

### Découpage en Composants Réutilisables

**❌ MAUVAIS - Composant monolithique :**

```tsx
export default function MaPage() {
  // 800 lignes de code...
  return (
    <div>
      <div>Header complexe avec logique...</div>
      <div>Formulaire énorme...</div>
      <div>Liste avec logique...</div>
    </div>
  );
}
```

**✅ BON - Composants modulaires :**

```tsx
// MaPage.tsx
export default function MaPage() {
  return (
    <div>
      <PageHeader />
      <ComplexForm />
      <DataList />
    </div>
  );
}

// components/ma-feature/PageHeader.tsx
export function PageHeader() { ... }

// components/ma-feature/ComplexForm.tsx
export function ComplexForm() { ... }

// components/ma-feature/DataList.tsx
export function DataList() { ... }
```

### Conventions de Nommage

- **Composants UI génériques** : PascalCase (ex: `GlassButton.tsx`)
- **Composants de feature** : PascalCase descriptif (ex: `ReviewListItem.tsx`)
- **Index files** : Regrouper les exports (`index.ts`)

## 🪝 Custom Hooks

### Extraire la Logique Complexe

**❌ MAUVAIS - Logique dans le composant :**

```tsx
export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 50 lignes de logique de fetch...
  }, []);

  const handleSync = () => {
    // 30 lignes de logique...
  };

  return <div>...</div>;
}
```

**✅ BON - Logique dans un hook :**

```tsx
// hooks/reviews/useReviews.ts
export function useReviews({ storeId }: { storeId: string | null }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Toute la logique de fetch et sync ici

  return { reviews, loading, handleSync };
}

// pages/reviews/page.tsx
export default function ReviewsPage() {
  const { reviews, loading, handleSync } = useReviews({ storeId });

  return <div>...</div>;
}
```

### Conventions de Hooks

- Préfixer avec `use` (ex: `useReviews`, `useGoogleApiConfig`)
- Grouper par feature dans `hooks/[feature]/`
- Exporter via `index.ts` pour import propre

## 🎨 Gestion des Erreurs & Notifications

### JAMAIS d'Alertes Natives

**❌ INTERDIT :**

```tsx
alert('Opération réussie');
confirm('Êtes-vous sûr ?');
console.error('Erreur');
```

**✅ OBLIGATOIRE - Toast System :**

```tsx
import { useToast } from '@/hooks/use-toast';

export function MonComposant() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: 'Succès',
      description: 'Opération réussie',
      variant: 'success',
    });
  };

  const handleError = (error: Error) => {
    toast({
      title: 'Erreur',
      description: error.message,
      variant: 'error',
    });
  };
}
```

### Confirmation Window

**✅ Pour les confirmations :**

```tsx
// eslint-disable-next-line no-undef
if (window.confirm('Êtes-vous sûr de vouloir supprimer ?')) {
  // Action de suppression
}
```

### Variables Non Utilisées

**✅ Préfixer avec underscore :**

```tsx
// ❌ MAUVAIS
try {
  // ...
} catch (err) {
  // err non utilisé → erreur ESLint
  setError('Erreur générique');
}

// ✅ BON
try {
  // ...
} catch (_err) {
  // Indique explicitement que l'erreur n'est pas utilisée
  setError('Erreur générique');
}

// Interface avec paramètres non utilisés
interface Props {
  onChange: (_value: string) => void; // Underscore si non utilisé dans l'implémentation
}
```

## 🎨 Style & UI

### Glassmorphism Design System

Utiliser les composants de base :

- `<GlassCard>` : Cartes avec effet de verre
- `<GlassButton>` : Boutons stylisés
- `<GlassInput>` : Champs de saisie
- `<AnimatedBackground>` : Fond animé gradient

### Inline Styles vs Tailwind

- **Tailwind CSS** privilégié pour les composants simples
- **Inline styles** uniquement pour les effets dynamiques (hover, focus, etc.)
- Éviter les styles mixtes dans un même composant

## 🔧 tRPC & API

### Mutations avec Gestion d'Erreurs

**✅ Pattern recommandé :**

```tsx
const mutation = api.feature.action.useMutation({
  onSuccess: (data) => {
    toast({
      title: 'Succès',
      description: `${data.count} éléments traités`,
      variant: 'success',
    });
  },
  onError: (error) => {
    toast({
      title: 'Erreur',
      description: error.message,
      variant: 'error',
    });
  },
});

const handleSubmit = () => {
  mutation.mutate({ id, data });
};
```

## 🚫 Anti-Patterns à Éviter

### 1. Fichiers Monolithiques

- **Maximum 500 lignes par fichier**
- Si dépassement → découper en sous-composants

### 2. Logique Métier dans les Composants

- Extraire dans des hooks ou des fonctions utilitaires

### 3. Types Dupliqués

- Centraliser dans `src/lib/types/[feature].types.ts`

### 4. Imports Absolus Désorganisés

- Utiliser les alias (`@/components`, `@/lib`, `@/hooks`)
- Grouper les imports par catégorie

### 5. ESLint Warnings Ignorés

- **Corriger** tous les warnings
- Si vraiment nécessaire : `eslint-disable-next-line` avec commentaire

## 📝 Exemple Complet : Feature "Reviews"

```
src/
├── app/dashboard/reviews/
│   └── page.tsx                     # Page principale (< 300 lignes)
├── components/reviews/
│   ├── index.ts                     # Exports centralisés
│   ├── ReviewList.tsx              # Composant liste
│   ├── ReviewListItem.tsx          # Composant item
│   ├── ReviewFilters.tsx           # Filtres
│   ├── ReviewStatsCards.tsx        # Statistiques
│   ├── ResponseModal.tsx           # Modal de réponse
│   └── GoogleApiConfigModal.tsx    # Modal configuration
├── hooks/reviews/
│   ├── index.ts                     # Exports centralisés
│   ├── useReviews.ts               # Hook principal
│   ├── useGoogleApiConfig.ts       # Hook configuration
│   └── useReviewResponse.ts        # Hook réponses
├── lib/types/
│   └── review.types.ts             # Types partagés
└── server/routers/
    └── review.router.ts            # Routes tRPC
```

## ✅ Checklist Avant Commit

- [ ] Aucun `any` type dans le code
- [ ] Aucun `alert()`, `confirm()` natif (utiliser toast ou `window.confirm`)
- [ ] Aucun `console.error()` dans le code client
- [ ] Composants < 500 lignes
- [ ] Logique extraite dans des hooks si complexe
- [ ] Types partagés dans `lib/types/`
- [ ] Tous les imports utilisent les alias `@/`
- [ ] ESLint : 0 erreur, 0 warning
- [ ] TypeScript : 0 erreur
- [ ] Tests passent (si applicable)

## 🚀 Outils de Qualité

### Linting & Formatting

```bash
npm run lint        # Vérifier ESLint
npm run type-check  # Vérifier TypeScript
npm run format      # Formater avec Prettier
```

### Pre-commit Hooks

- Husky configuré pour vérifier le code avant chaque commit
- ESLint + Prettier s'exécutent automatiquement

---

**Rappel : La qualité du code est une priorité absolue.**
**Un code propre, bien organisé et sans erreurs = Application maintenable et évolutive.**
