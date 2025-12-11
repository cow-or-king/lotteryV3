# ConfirmDialog Component - Guide d'utilisation

## Description

Le composant `ConfirmDialog` remplace les `window.confirm()` natifs par un modal moderne avec le design glassmorphism du projet.

## Fichiers créés

- `/src/components/ui/ConfirmDialog.tsx` - Le composant modal
- `/src/hooks/ui/useConfirm.ts` - Le hook pour faciliter l'utilisation

## Interface

```typescript
interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string; // Défaut: "Confirmer"
  cancelText?: string; // Défaut: "Annuler"
  variant?: 'danger' | 'warning' | 'info'; // Défaut: 'warning'
}
```

## Utilisation avec le hook `useConfirm`

### Exemple 1 : Suppression dans un hook custom (useStores.ts)

```typescript
import { useConfirm } from '@/hooks/ui/useConfirm';

export function useStores() {
  // 1. Initialiser le hook
  const { ConfirmDialogProps, confirm } = useConfirm();

  // 2. Utiliser la fonction confirm dans un handler
  const handleDeleteStore = async (storeId: string, storeName: string) => {
    const confirmed = await confirm({
      title: 'Supprimer le commerce',
      message: `Êtes-vous sûr de vouloir supprimer le commerce "${storeName}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'danger',
    });

    if (confirmed) {
      deleteStore.mutate({ id: storeId });
    }
  };

  // 3. Retourner ConfirmDialogProps pour le passer au composant
  return {
    // ... autres exports
    handleDeleteStore,
    ConfirmDialogProps, // À passer au ConfirmDialog dans la page
  };
}
```

Dans la page qui utilise le hook :

```tsx
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useStores } from '@/hooks/stores';

export default function StoresPage() {
  const storesHook = useStores();

  return (
    <div>
      {/* Votre contenu */}

      {/* Ajouter le ConfirmDialog à la fin */}
      <ConfirmDialog {...storesHook.ConfirmDialogProps} />
    </div>
  );
}
```

### Exemple 2 : Utilisation directe dans un composant

```tsx
'use client';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirm } from '@/hooks/ui/useConfirm';

export function MyComponent() {
  const { ConfirmDialogProps, confirm } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Supprimer',
      message: 'Êtes-vous sûr ?',
      variant: 'danger',
    });

    if (confirmed) {
      console.log('Suppression confirmée');
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Supprimer</button>
      <ConfirmDialog {...ConfirmDialogProps} />
    </div>
  );
}
```

## Variantes disponibles

### danger (rouge)

Pour les actions destructives (suppressions, etc.)

```typescript
variant: 'danger';
```

### warning (orange)

Pour les actions importantes nécessitant une confirmation (défaut)

```typescript
variant: 'warning';
```

### info (bleu)

Pour les confirmations informatives

```typescript
variant: 'info';
```

## Fonctionnalités

- Design glassmorphism cohérent avec le reste de l'application
- Animation d'entrée/sortie fluide (fade + scale)
- Backdrop avec effet blur
- Focus automatique sur le bouton de confirmation
- Fermeture avec la touche ESC
- Focus trap pour l'accessibilité
- ARIA labels pour les lecteurs d'écran
- Responsive (mobile-friendly)
- Boutons stylisés selon la variante

## Occurrences de window.confirm à remplacer

Le projet contient actuellement 6 utilisations de `window.confirm` :

1. ✅ `/src/hooks/stores/useStores.ts:72` - **REMPLACÉ**
2. ⏳ `/src/hooks/stores/useBrands.ts:78`
3. ⏳ `/src/hooks/prizes/usePrizes.ts:122`
4. ⏳ `/src/hooks/prizes/usePrizeSets.ts:105`
5. ⏳ `/src/app/dashboard/super-admin/ai-config/page.tsx:313`
6. ⏳ `/src/app/dashboard/qr-codes/page.tsx:48`

Le premier remplacement dans `useStores.ts` sert de modèle pour les autres.

## Migration depuis window.confirm

### Avant :

```typescript
const handleDelete = (id: string, name: string) => {
  if (window.confirm(`Supprimer "${name}" ?`)) {
    deleteMutation.mutate({ id });
  }
};
```

### Après :

```typescript
const { ConfirmDialogProps, confirm } = useConfirm();

const handleDelete = async (id: string, name: string) => {
  const confirmed = await confirm({
    title: 'Supprimer',
    message: `Êtes-vous sûr de vouloir supprimer "${name}" ?`,
    variant: 'danger',
  });

  if (confirmed) {
    deleteMutation.mutate({ id });
  }
};

// Dans le JSX :
// <ConfirmDialog {...ConfirmDialogProps} />
```

## Notes importantes

1. Le handler doit être `async` car `confirm()` retourne une Promise
2. Toujours inclure `<ConfirmDialog {...ConfirmDialogProps} />` dans le JSX
3. Un seul `ConfirmDialog` peut gérer plusieurs confirmations dans le même composant
4. Le dialog gère automatiquement son état d'ouverture/fermeture
