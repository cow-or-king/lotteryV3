# 🏗️ Architecture Modulaire - Guide de Développement

## 📊 État Actuel du Refactoring

### ✅ Réduction Massive du Code

```
AVANT:  4745 lignes (pages monolithiques)
APRÈS:   827 lignes (pages refactorisées)
GAIN:   -82.6% (3918 lignes économisées)
```

### 📁 Structure Actuelle

```
src/
├── app/dashboard/                    # Pages Next.js (courtes et composées)
│   ├── layout.tsx           (192 lignes)  ← -80%
│   ├── stores/page.tsx      (176 lignes)  ← -88%
│   ├── prizes/page.tsx      (282 lignes)  ← -80%
│   └── reviews/page.tsx     (177 lignes)  ← -79%
│
├── components/                       # Composants UI réutilisables
│   ├── dashboard/           (4 composants)
│   ├── stores/              (9 composants)
│   ├── prizes/              (4 composants)
│   ├── reviews/             (8 composants)
│   └── ui/                  (composants génériques)
│
├── hooks/                            # Logique métier extraite
│   ├── dashboard/           (2 hooks)
│   ├── stores/              (3 hooks)
│   ├── prizes/              (2 hooks)
│   └── reviews/             (3 hooks)
│
└── lib/types/                        # Types partagés
    ├── branded.type.ts
    └── result.type.ts
```

---

## 🎯 Principes Fondamentaux

### 1. **Single Responsibility Principle (SRP)**

Chaque composant/hook a UNE et UNE SEULE responsabilité.

**❌ MAUVAIS (Ancien code)**

```tsx
// 1492 lignes dans un seul fichier
export default function StoresPage() {
  // Gestion des stores
  // Gestion des brands
  // Gestion des modals
  // Gestion des forms
  // Validation
  // API calls
  // État UI
  // ...tout mélangé
}
```

**✅ BON (Nouveau code)**

```tsx
// page.tsx (176 lignes) - COMPOSITION UNIQUEMENT
export default function StoresPage() {
  const storesHook = useStores(); // Logique stores
  const brandsHook = useBrands(); // Logique brands
  const limitsHook = useStoreLimits(); // Logique limits

  return (
    <>
      <BrandSection {...props} /> {/* UI brands */}
      <StoreModal {...props} /> {/* UI modal */}
    </>
  );
}

// hooks/stores/useStores.ts (260 lignes) - LOGIQUE PURE
// components/stores/StoreModal.tsx (423 lignes) - UI PURE
```

### 2. **Séparation UI / Logique**

```
┌──────────────┐
│   PAGE       │  → Composition (import hooks + composants)
└──────────────┘
       │
   ┌───┴───┐
   ▼       ▼
┌─────┐ ┌──────┐
│HOOKS│ │COMPOS│  → Hooks = Logique | Composants = UI
└─────┘ └──────┘
```

**Hooks = Logique Métier**

- État (useState, useReducer)
- Effets de bord (useEffect)
- API calls (tRPC mutations/queries)
- Calculs dérivés (useMemo)
- Handlers métier

**Composants = Interface Visuelle**

- JSX/TSX uniquement
- Props bien typées
- Pas de logique complexe
- Réutilisable

### 3. **Composition over Inheritance**

Au lieu de créer des composants géants, composer des petits composants.

```tsx
// ❌ MAUVAIS - God Component
<StorePageWithEverything />

// ✅ BON - Composition
<>
  <Header>
    <Title />
    <CreateButton />
  </Header>
  <BrandList>
    {brands.map(brand => (
      <BrandSection key={brand.id}>
        <BrandHeader />
        <StoreList />
      </BrandSection>
    ))}
  </BrandList>
  <StoreModal />
</>
```

---

## 📏 Règles de Taille

### Composants

- ✅ **< 200 lignes** : Idéal
- ⚠️ **200-400 lignes** : À surveiller
- 🔴 **> 400 lignes** : REFACTORER !

### Hooks

- ✅ **< 150 lignes** : Idéal
- ⚠️ **150-250 lignes** : À surveiller
- 🔴 **> 250 lignes** : REFACTORER !

### Pages

- ✅ **< 200 lignes** : Idéal (composition pure)
- ⚠️ **200-300 lignes** : Acceptable si beaucoup de composition
- 🔴 **> 300 lignes** : REFACTORER !

---

## 🛠️ Comment Continuer à Coder

### Processus de Développement

#### 1️⃣ **Créer une Nouvelle Feature**

```bash
# Exemple: Ajouter une page "Campaigns"
```

**Étape 1: Créer la page (composition)**

```tsx
// src/app/dashboard/campaigns/page.tsx
'use client';

import { useCampaigns } from '@/hooks/campaigns';
import { CampaignList, CampaignModal } from '@/components/campaigns';

export default function CampaignsPage() {
  const { campaigns, createCampaign, deleteCampaign } = useCampaigns();

  return (
    <>
      <CampaignList campaigns={campaigns} onDelete={deleteCampaign} />
      <CampaignModal onSubmit={createCampaign} />
    </>
  );
}
```

**Étape 2: Créer le hook (logique)**

```tsx
// src/hooks/campaigns/useCampaigns.ts
'use client';

import { api } from '@/lib/trpc/client';
import { useState } from 'react';

export function useCampaigns() {
  const { data: campaigns } = api.campaign.list.useQuery();
  const createMutation = api.campaign.create.useMutation();
  const deleteMutation = api.campaign.delete.useMutation();

  const createCampaign = (data: CampaignInput) => {
    createMutation.mutate(data);
  };

  const deleteCampaign = (id: string) => {
    if (confirm('Supprimer ?')) {
      deleteMutation.mutate({ id });
    }
  };

  return { campaigns, createCampaign, deleteCampaign };
}
```

**Étape 3: Créer les composants (UI)**

```tsx
// src/components/campaigns/CampaignList.tsx
interface CampaignListProps {
  campaigns: Campaign[];
  onDelete: (id: string) => void;
}

export function CampaignList({ campaigns, onDelete }: CampaignListProps) {
  return (
    <div className="grid gap-4">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onDelete={() => onDelete(campaign.id)}
        />
      ))}
    </div>
  );
}
```

#### 2️⃣ **Refactorer un Composant Existant**

**Si un composant > 400 lignes, le découper :**

```tsx
// AVANT: StoreModal.tsx (423 lignes)
export function StoreModal() {
  // Logique form
  // Logique validation
  // Logique API
  // UI formulaire complet
  // UI modals d'aide
}

// APRÈS: Découper en sous-composants
src/components/stores/
├── StoreModal.tsx              (100 lignes) - Structure principale
├── StoreForm.tsx               (150 lignes) - Formulaire
├── StoreFormBrandSection.tsx  (80 lignes)  - Section brand
└── StoreFormPlaceIdHelp.tsx   (93 lignes)  - Aide Place ID
```

#### 3️⃣ **Refactorer un Hook Existant**

**Si un hook > 250 lignes, le découper :**

```tsx
// AVANT: usePrizeSets.ts (278 lignes)
export function usePrizeSets() {
  // CRUD operations
  // Item management
  // Probability calculations
  // Form state
  // Validation
}

// APRÈS: Découper en plusieurs hooks
src/hooks/prizes/
├── usePrizeSets.ts          (100 lignes) - CRUD principal
├── usePrizeSetItems.ts      (80 lignes)  - Gestion items
├── usePrizeSetValidation.ts (60 lignes)  - Validation
└── useProbabilityCalc.ts    (38 lignes)  - Calculs
```

---

## 🎨 Patterns à Suivre

### Pattern 1: Custom Hook pour Logique Complexe

```tsx
// ✅ Extraire la logique dans un hook
function useFormWithValidation(initialData) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const validate = () => {
    // Logique de validation
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Submit
    }
  };

  return { formData, setFormData, errors, handleSubmit };
}

// Utilisation
function MyForm() {
  const { formData, setFormData, errors, handleSubmit } = useFormWithValidation({});

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Pattern 2: Compound Components

```tsx
// Composants qui travaillent ensemble
<Modal>
  <Modal.Header>
    <Modal.Title>Mon titre</Modal.Title>
  </Modal.Header>
  <Modal.Body>Contenu</Modal.Body>
  <Modal.Footer>
    <Button>OK</Button>
  </Modal.Footer>
</Modal>
```

### Pattern 3: Render Props (si nécessaire)

```tsx
<DataFetcher url="/api/data">
  {({ data, loading, error }) => {
    if (loading) return <Spinner />;
    if (error) return <Error />;
    return <DataDisplay data={data} />;
  }}
</DataFetcher>
```

---

## ⚡ Optimisations

### 1. Mémoïsation Intelligente

```tsx
// ❌ MAUVAIS - Re-render à chaque fois
function MyList({ items, onDelete }) {
  return items.map((item) => <Item key={item.id} onDelete={() => onDelete(item.id)} />);
}

// ✅ BON - Mémoïser les callbacks
function MyList({ items, onDelete }) {
  return items.map((item) => <MemoizedItem key={item.id} item={item} onDelete={onDelete} />);
}

const MemoizedItem = memo(({ item, onDelete }) => <div onClick={() => onDelete(item.id)}>...</div>);
```

### 2. Code Splitting

```tsx
// Lazy load des composants lourds
const HeavyModal = lazy(() => import('./HeavyModal'));

function MyPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyModal />
    </Suspense>
  );
}
```

---

## 📦 Organisation des Fichiers

### Structure d'un Module Complet

```
src/features/campaigns/           # Feature complète
├── components/                   # Composants UI
│   ├── CampaignCard.tsx
│   ├── CampaignList.tsx
│   ├── CampaignModal.tsx
│   └── index.ts                  # Export centralisé
├── hooks/                        # Logique métier
│   ├── useCampaigns.ts
│   ├── useCampaignForm.ts
│   └── index.ts
└── types/                        # Types spécifiques
    └── campaign.types.ts
```

### Exports Centralisés

```tsx
// components/campaigns/index.ts
export { CampaignCard } from './CampaignCard';
export { CampaignList } from './CampaignList';
export { CampaignModal } from './CampaignModal';

// hooks/campaigns/index.ts
export { useCampaigns } from './useCampaigns';
export { useCampaignForm } from './useCampaignForm';

// Utilisation
import { CampaignCard, CampaignList } from '@/components/campaigns';
import { useCampaigns } from '@/hooks/campaigns';
```

---

## 🚨 Anti-Patterns à Éviter

### ❌ 1. God Components

```tsx
// NE PAS FAIRE
function SuperComponent() {
  // 1000 lignes de code
  // 50 states
  // 30 useEffect
  // Tout mélangé
}
```

### ❌ 2. Prop Drilling

```tsx
// NE PAS FAIRE
<A>
  <B prop={x}>
    <C prop={x}>
      <D prop={x}>
        <E prop={x} /> {/* Trop de niveaux */}
      </D>
    </C>
  </B>
</A>;

// FAIRE - Context ou State Management
const Context = createContext();
<Context.Provider value={x}>
  <A>
    <B>
      <C>
        <D>
          <E />
        </D>
      </C>
    </B>
  </A>
</Context.Provider>;
```

### ❌ 3. Logique dans les Composants

```tsx
// NE PAS FAIRE
function MyComponent() {
  const data = api.getData.useQuery();
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    // Logique complexe de filtrage
    const result = data.filter(/* 50 lignes */);
    setFiltered(result);
  }, [data]);

  return <div>...</div>;
}

// FAIRE - Extraire dans un hook
function MyComponent() {
  const { filteredData } = useFilteredData();
  return <div>...</div>;
}
```

---

## ✅ Checklist Avant Commit

- [ ] Aucun composant > 400 lignes
- [ ] Aucun hook > 250 lignes
- [ ] ZERO `any` types
- [ ] Tous les composants ont des props typées
- [ ] Logique extraite dans des hooks
- [ ] UI pure dans les composants
- [ ] Exports centralisés (index.ts)
- [ ] Nommage cohérent
- [ ] Pas de duplication de code

---

## 📚 Ressources

- [React Patterns](https://reactpatterns.com/)
- [Clean Code React](https://github.com/ryanmcdermott/clean-code-javascript)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)

---

**Dernière mise à jour:** 9 Décembre 2024
**Version:** 3.0 Post-Refactoring
