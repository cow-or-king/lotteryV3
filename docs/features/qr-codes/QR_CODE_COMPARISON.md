# Comparaison: QR Code Client vs Serveur

## Vue d'ensemble

Le projet utilise maintenant **deux approches différentes** pour générer des QR Codes, chacune adaptée à un cas d'usage spécifique.

## Approche 1: Génération Client (Existante)

### Librairie Utilisée

`qr-code-styling@1.9.2` - Librairie riche en fonctionnalités pour le navigateur

### Fichiers Concernés

- `/src/lib/utils/qr-code-generator.ts`
- `/src/components/qr-codes/*`
- `/src/hooks/qr-codes/*`

### Cas d'Usage

✅ Interface utilisateur de personnalisation de QR Codes
✅ Prévisualisation en temps réel
✅ Export manuel par l'utilisateur (PNG, SVG, PDF)
✅ QR Codes avec logos, animations, styles personnalisés

### Fonctionnalités

- ✨ 5 styles visuels (DOTS, ROUNDED, SQUARE, CLASSY, CIRCULAR)
- ✨ 7 animations (NONE, RIPPLE, PULSE, WAVE, ROTATE3D, GLOW, CIRCULAR_RIPPLE)
- ✨ Personnalisation des couleurs
- ✨ Ajout de logo avec masque
- ✨ Tailles configurables (256-2048px)
- ✨ Niveaux de correction d'erreur (L, M, Q, H)

### Code Exemple

```typescript
import { generateQRCode } from '@/lib/utils/qr-code-generator';

const result = await generateQRCode({
  url: 'https://example.com',
  style: 'DOTS',
  animation: 'RIPPLE',
  foregroundColor: '#5B21B6',
  backgroundColor: '#FFFFFF',
  size: 512,
  logoUrl: '/logo.png',
  logoSize: 80,
  errorCorrectionLevel: 'H',
});

// result contient: { dataUrl, svg, blob }
```

### Environnement

🌐 **Navigateur uniquement** (client-side)

---

## Approche 2: Génération Serveur (Nouvelle)

### Librairie Utilisée

`qrcode@1.5.4` - Librairie légère et rapide pour Node.js

### Fichiers Concernés

- `/src/lib/utils/qr-code-server-generator.ts`
- `/src/server/api/routers/store.router.ts`

### Cas d'Usage

✅ Génération automatique lors de la création d'un Store
✅ QR Codes par défaut (non personnalisés)
✅ Génération en arrière-plan côté serveur
✅ Pas besoin d'interaction utilisateur

### Fonctionnalités

- 📦 Configuration par défaut simple (noir & blanc)
- 📦 Format SVG uniquement
- 📦 Pas de logo (pour l'instant)
- 📦 Pas d'animation
- 📦 Style SQUARE classique
- 📦 Niveau de correction M (15%)

### Code Exemple

```typescript
import { generateAndLinkDefaultQRCode } from '@/lib/utils/qr-code-server-generator';

const result = await generateAndLinkDefaultQRCode({
  storeId: 'store-123',
  storeName: 'Mon Commerce',
  storeSlug: 'mon-commerce-123',
  userId: 'user-456',
});

// result contient: { success, qrCodeId, error? }
// Le QR Code est automatiquement enregistré en base
```

### Environnement

🖥️ **Serveur uniquement** (server-side)

---

## Tableau Comparatif

| Critère                     | Client (qr-code-styling)     | Serveur (qrcode)        |
| --------------------------- | ---------------------------- | ----------------------- |
| **Environnement**           | Navigateur                   | Node.js                 |
| **Cas d'usage**             | UI personnalisation          | Génération automatique  |
| **Performance**             | Peut être lente pour gros QR | Très rapide             |
| **Taille bundle**           | ~100KB                       | 0 (server-side)         |
| **Styles visuels**          | 5 styles                     | 1 style (SQUARE)        |
| **Animations**              | 7 animations                 | Aucune                  |
| **Logo**                    | Oui                          | Non (pour l'instant)    |
| **Couleurs**                | Personnalisables             | Noir & blanc uniquement |
| **Formats export**          | PNG, SVG, PDF                | SVG uniquement          |
| **Base de données**         | Manuel (via mutation)        | Automatique             |
| **Interaction utilisateur** | Requise                      | Aucune                  |

---

## Quand Utiliser Quelle Approche ?

### ✅ Utiliser l'Approche Client

- L'utilisateur veut **personnaliser** le QR Code
- Besoin de **prévisualisation** en temps réel
- QR Code avec **logo** et/ou **animations**
- **Export manuel** vers PNG/PDF
- Interface de **création/édition** de QR Codes

**Exemple:** Page `/dashboard/qr-codes/new`

### ✅ Utiliser l'Approche Serveur

- Génération **automatique** lors de la création d'un Store
- QR Code par **défaut** (non personnalisé)
- Pas d'interaction utilisateur nécessaire
- Performance critique (génération en **arrière-plan**)
- QR Code **simple** (noir & blanc, pas de logo)

**Exemple:** Création automatique lors de `store.create` mutation

---

## Migration Future

### Objectif: Convergence des Deux Approches

1. **Phase 1** (Actuelle)
   - ✅ QR Code par défaut généré automatiquement (serveur)
   - ✅ Personnalisation manuelle disponible (client)

2. **Phase 2** (Future)
   - 🔄 Ajouter le logo du Store dans le QR Code par défaut
   - 🔄 Utiliser les couleurs de la Brand
   - 🔄 Permettre de basculer du QR par défaut vers personnalisé

3. **Phase 3** (Future)
   - 🔄 Régénérer le QR par défaut avec qr-code-styling côté serveur
   - 🔄 Unifier les deux approches
   - 🔄 Support SSR pour la génération avec logo

---

## Structure de Données

### QRCode en Base de Données

```typescript
interface QRCode {
  id: string;
  name: string;
  url: string;

  // Configuration visuelle
  type: 'STATIC' | 'DYNAMIC';
  style: 'DOTS' | 'ROUNDED' | 'SQUARE' | 'CLASSY' | 'CIRCULAR';
  animation: 'NONE' | 'RIPPLE' | 'PULSE' | ... | null;
  foregroundColor: string;
  backgroundColor: string;

  // Logo
  logoUrl: string | null;
  logoStoragePath: string | null;
  logoSize: number | null;

  // Options
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';

  // Relations
  storeId: string | null;
  campaignId: string | null;
  createdBy: string;

  // Statistiques
  scanCount: number;
  lastScannedAt: Date | null;
}
```

### Store avec QR Code par Défaut

```typescript
interface Store {
  id: string;
  name: string;
  slug: string;

  // QR Code par défaut
  defaultQrCodeId: string | null;
  qrCodeCustomized: boolean; // false = par défaut, true = personnalisé
  qrCodeCustomizedAt: Date | null;

  // Relations
  defaultQrCode?: QRCode;
  qrCodes: QRCode[];
}
```

---

## Performance

### Génération Client (qr-code-styling)

- ⏱️ ~200-500ms pour un QR Code avec logo
- 📦 Impact sur le bundle: ~100KB
- 🎨 Rendu dans le navigateur

### Génération Serveur (qrcode)

- ⏱️ ~50-100ms pour un QR Code simple
- 📦 Impact sur le bundle: 0 (server-side)
- ⚡ Génération en arrière-plan

---

## Exemples de Code

### Création d'un Store avec QR Code Automatique

```typescript
// Front-end
const createStore = api.store.create.useMutation();

await createStore.mutateAsync({
  brandId: 'brand-123',
  name: 'Mon Commerce',
  googleBusinessUrl: 'https://...',
});

// En arrière-plan, le serveur:
// 1. Crée le Store
// 2. Upload le logo si fourni
// 3. ✨ Génère automatiquement le QR Code par défaut
// 4. Lie le QR Code au Store
```

### Personnalisation du QR Code

```typescript
// Si l'utilisateur veut personnaliser le QR Code par défaut
const updateStore = api.store.update.useMutation();

// 1. Créer un nouveau QR Code personnalisé avec qr-code-styling
const customQRCode = await api.qrCode.create.mutateAsync({
  name: 'QR Code Personnalisé',
  url: `/s/${store.slug}`,
  style: 'DOTS',
  animation: 'RIPPLE',
  foregroundColor: brand.primaryColor,
  backgroundColor: '#FFFFFF',
  logoUrl: brand.logoUrl,
  storeId: store.id,
});

// 2. Mettre à jour le Store
await updateStore.mutateAsync({
  id: store.id,
  defaultQrCodeId: customQRCode.id,
  qrCodeCustomized: true,
  qrCodeCustomizedAt: new Date(),
});
```

---

## Conclusion

Les deux approches sont **complémentaires** et répondent à des besoins différents:

- **Serveur (qrcode)**: Automatisation, simplicité, performance
- **Client (qr-code-styling)**: Personnalisation, expérience utilisateur, flexibilité

L'architecture actuelle permet de bénéficier des avantages des deux mondes.
