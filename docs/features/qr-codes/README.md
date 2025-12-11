# 📱 Système de QR Codes - ReviewLottery V3

Documentation complète du système de génération et gestion de QR Codes personnalisés.

---

## 📋 Table des Matières

- [Vue d'Ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Utilisation](#utilisation)
- [API & Endpoints](#api--endpoints)
- [Personnalisation](#personnalisation)
- [Guide de Développement](#guide-de-développement)
- [Documentation Connexe](#documentation-connexe)

---

## 🎯 Vue d'Ensemble

Le système de QR Codes permet aux utilisateurs de créer des QR codes entièrement personnalisés pour leurs commerces, avec:

- **5 styles visuels** différents (DOTS, ROUNDED, SQUARE, CLASSY, CIRCULAR)
- **6 types d'animations** au survol (RIPPLE, PULSE, GLOW, ROTATE3D, WAVE, CIRCULAR_RIPPLE)
- **Personnalisation complète** des couleurs (QR code, fond, animation)
- **Upload de logos** personnalisés
- **Templates préconfigurés** par industrie
- **Export multi-formats** (PNG, SVG, PDF)
- **Tracking des scans** et analytics

### Cas d'Usage

1. **QR Code Statique** - Pour impressions physiques (menus, affiches, PLV)
2. **QR Code Dynamique** - Pour campagnes digitales ponctuelles
3. **QR Code Branded** - Avec logo et couleurs de la marque
4. **QR Code Tracking** - Pour mesurer l'engagement

---

## ✅ Fonctionnalités

### Fonctionnalités Implémentées

#### Création & Personnalisation

- ✅ Interface de création intuitive avec preview en temps réel
- ✅ 5 styles visuels (DOTS, ROUNDED, SQUARE, CLASSY, CIRCULAR)
- ✅ 6 animations interactives au hover
- ✅ 3 color pickers (QR code, fond, animation)
- ✅ Upload de logo via Supabase Storage
- ✅ Ajustement de la taille du logo (40-400px)
- ✅ Templates préconfigurés par industrie (Restaurant, E-commerce, etc.)

#### Gestion & Liste

- ✅ Liste complète avec cards glassmorphism
- ✅ Preview du QR code sur chaque card
- ✅ Actions rapides (Edit, Delete, Download, Stats)
- ✅ Filtrage et recherche
- ✅ Empty state élégant

#### Export & Partage

- ✅ Export PNG haute résolution
- ✅ Export SVG vectoriel (pour print)
- ✅ Export PDF prêt à imprimer
- ✅ Téléchargement direct depuis la liste

#### Backend & Infrastructure

- ✅ CRUD complet via tRPC
- ✅ Stockage des logos sur Supabase Storage
- ✅ Validation Zod stricte
- ✅ Gestion des erreurs robuste
- ✅ Cleanup automatique des ressources

### Fonctionnalités En Réserve

- ⏸️ Création batch (plusieurs QR codes simultanés)
- ⏸️ Compression automatique des logos
- ⏸️ Cache des QR codes générés
- ⏸️ Duplication de QR code
- ⏸️ Archivage/Désactivation

---

## 🏗️ Architecture

### Structure des Fichiers

```
src/
├── app/dashboard/qr-codes/
│   ├── page.tsx                    # Liste des QR codes
│   ├── new/page.tsx                # Création
│   ├── [id]/edit/page.tsx          # Édition
│   ├── [id]/stats/page.tsx         # Statistiques
│   └── batch/page.tsx              # Création batch (réserve)
│
├── components/qr-codes/
│   ├── QRCodePreview.tsx           # Preview avec animations
│   ├── QRCodeColorPicker.tsx       # Sélecteur de couleurs
│   ├── QRCodeAnimationSelector.tsx # Sélecteur d'animations
│   ├── QRCodeStyleSelector.tsx     # Sélecteur de styles
│   ├── QRCodeLogoUpload.tsx        # Upload de logo
│   ├── QRCodeTemplateSelector.tsx  # Templates préconfigurés
│   ├── QRCodeStoreSelector.tsx     # Sélection du magasin
│   ├── QRCodeExportOptions.tsx     # Options d'export
│   └── QRCodeListItem.tsx          # Card pour la liste
│
├── hooks/qr-codes/
│   ├── useQRCodeGenerator.ts       # Génération du QR code
│   └── useQRCodeExport.ts          # Export multi-formats
│
├── lib/
│   ├── types/qr-code.types.ts      # Types TypeScript
│   └── utils/qr-code-generator.ts  # Utilitaires de génération
│
└── server/api/routers/
    └── qr-code.router.ts           # Router tRPC
```

### Technologies Utilisées

- **qr-code-styling**: Génération de QR codes personnalisés
- **Supabase Storage**: Stockage des logos (bucket `qr-logos`)
- **tRPC**: API type-safe
- **Prisma**: ORM pour PostgreSQL
- **Zod**: Validation des schémas
- **Tailwind CSS**: Styles (glassmorphism design)
- **Framer Motion**: Animations fluides

### Schéma de Base de Données

```prisma
model QRCode {
  id                    String      @id @default(cuid())

  // Informations de base
  name                  String
  url                   String
  type                  QRCodeType  @default(STATIC)

  // Style & Apparence
  style                 QRCodeStyle @default(DOTS)
  foregroundColor       String      @default("#000000")
  backgroundColor       String      @default("#FFFFFF")
  animationColor        String      @default("#667eea")
  animation             QRCodeAnimation @default(RIPPLE)

  // Logo (optionnel)
  logoUrl               String?
  logoSize              Int?        @default(80)

  // Qualité
  size                  Int         @default(512)
  errorCorrectionLevel  String      @default("M")

  // Relations
  storeId               String?
  store                 Store?      @relation(...)

  // Analytics
  scanCount             Int         @default(0)
  lastScannedAt         DateTime?
  expiresAt             DateTime?

  // Métadonnées
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  createdBy             String
  user                  User        @relation(...)

  @@index([storeId])
  @@index([createdBy])
  @@map("qr_codes")
}

enum QRCodeType {
  STATIC      // Pour print, ne change jamais
  DYNAMIC     // Pour campagnes, peut être réassigné
}

enum QRCodeStyle {
  DOTS        // Points arrondis
  ROUNDED     // Coins arrondis
  SQUARE      // Carré classique
  CLASSY      // Style élégant
  CIRCULAR    // Forme ronde
}

enum QRCodeAnimation {
  NONE
  RIPPLE
  PULSE
  WAVE
  ROTATE3D
  GLOW
  CIRCULAR_RIPPLE
}
```

---

## 💻 Utilisation

### Créer un QR Code

1. Naviguer vers `/dashboard/qr-codes`
2. Cliquer sur "Créer un QR Code"
3. Remplir les informations de base:
   - Nom du QR code
   - URL de destination
   - Magasin associé
4. Personnaliser le style:
   - Choisir un style visuel (DOTS, ROUNDED, etc.)
   - Sélectionner une animation
   - Personnaliser les couleurs
5. (Optionnel) Ajouter un logo
6. Prévisualiser en temps réel
7. Enregistrer

### Modifier un QR Code

1. Depuis la liste, cliquer sur "Éditer" (✏️)
2. Modifier les paramètres souhaités
3. Sauvegarder les modifications

### Exporter un QR Code

**Depuis la page de création/édition:**

1. Cliquer sur un des boutons d'export:
   - "Télécharger PNG" (haute résolution)
   - "Télécharger SVG" (vectoriel, pour print)
   - "Télécharger PDF" (prêt à imprimer)

**Depuis la liste:**

1. Cliquer sur l'icône de téléchargement (💾)
2. Le QR code est téléchargé en PNG

### Voir les Statistiques

1. Depuis la liste, cliquer sur "Statistiques" (📊)
2. Consulter:
   - Nombre de scans
   - Dernière date de scan
   - Graphiques d'évolution (à venir)

---

## 🔌 API & Endpoints

### Routes tRPC

Le router `qr-code` expose les endpoints suivants:

#### `qrCode.list`

**Type**: Query
**Auth**: Protected
**Description**: Liste tous les QR codes de l'utilisateur

```typescript
const qrCodes = await api.qrCode.list.useQuery();
```

**Retour**:

```typescript
{
  id: string;
  name: string;
  url: string;
  type: "STATIC" | "DYNAMIC";
  style: QRCodeStyle;
  scanCount: number;
  store?: { id: string; name: string };
  createdAt: Date;
}[]
```

---

#### `qrCode.getById`

**Type**: Query
**Auth**: Protected
**Description**: Récupère un QR code par ID

```typescript
const qrCode = await api.qrCode.getById.useQuery({ id: '...' });
```

**Input**:

```typescript
{
  id: string;
}
```

**Retour**: QR code complet avec toutes les métadonnées

---

#### `qrCode.create`

**Type**: Mutation
**Auth**: Protected
**Description**: Crée un nouveau QR code

```typescript
const newQRCode = await api.qrCode.create.mutate({
  name: 'Mon QR Code',
  url: 'https://example.com',
  storeId: '...',
  style: 'DOTS',
  animation: 'RIPPLE',
  // ...autres paramètres
});
```

**Input**:

```typescript
{
  name: string;
  url: string;
  storeId?: string;
  type: "STATIC" | "DYNAMIC";
  style: QRCodeStyle;
  animation: QRCodeAnimation;
  foregroundColor: string;
  backgroundColor: string;
  animationColor: string;
  logoUrl?: string;
  logoSize?: number;
  size: number;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
}
```

---

#### `qrCode.update`

**Type**: Mutation
**Auth**: Protected
**Description**: Met à jour un QR code existant

```typescript
await api.qrCode.update.mutate({
  id: '...',
  name: 'Nouveau nom',
  // ...champs à modifier
});
```

**Input**: Partial de `CreateQRCodeInput` + `id`

---

#### `qrCode.delete`

**Type**: Mutation
**Auth**: Protected
**Description**: Supprime un QR code et son logo

```typescript
await api.qrCode.delete.mutate({ id: '...' });
```

**Input**:

```typescript
{
  id: string;
}
```

**Note**: Supprime aussi le logo du storage Supabase

---

#### `qrCode.uploadLogo`

**Type**: Mutation
**Auth**: Protected
**Description**: Upload un logo vers Supabase Storage

```typescript
const { url } = await api.qrCode.uploadLogo.mutate({
  file: 'data:image/png;base64,...',
  filename: 'logo.png',
  contentType: 'image/png',
});
```

**Input**:

```typescript
{
  file: string; // Base64 data URL
  filename: string;
  contentType: string; // MIME type
}
```

**Retour**:

```typescript
{
  url: string;
} // URL publique du logo
```

---

## 🎨 Personnalisation

### Styles Disponibles

| Style        | Description           | Recommandé pour          |
| ------------ | --------------------- | ------------------------ |
| **DOTS**     | Points arrondis       | Design moderne, web      |
| **ROUNDED**  | Coins arrondis        | Design doux, sympathique |
| **SQUARE**   | Carré classique       | Print, professionnel     |
| **CLASSY**   | Élégant avec dégradés | Luxe, haut de gamme      |
| **CIRCULAR** | Forme ronde           | Original, événementiel   |

### Animations Disponibles

| Animation           | Description           | Effet                |
| ------------------- | --------------------- | -------------------- |
| **RIPPLE**          | Onde de choc          | Recommandé, subtil   |
| **PULSE**           | Pulsation douce       | Attirant l'attention |
| **GLOW**            | Lumière néon          | Moderne, vibrant     |
| **WAVE**            | Vague dans les points | Créatif, fluide      |
| **ROTATE3D**        | Rotation 3D           | Spectaculaire        |
| **CIRCULAR_RIPPLE** | Onde circulaire       | Pour style CIRCULAR  |

### Templates Préconfigurés

Le système propose des templates par industrie:

- **Restaurant** - Couleurs chaudes, style ROUNDED
- **E-commerce** - Couleurs vives, style DOTS
- **Événement** - Couleurs dynamiques, style CIRCULAR
- **Professionnel** - Couleurs sobres, style SQUARE
- **Technologie** - Couleurs modernes, style CLASSY

### Palettes de Couleurs

Palettes prédéfinies disponibles:

```typescript
const colorPresets = [
  { name: 'Classique', fg: '#000000', bg: '#FFFFFF', anim: '#000000' },
  { name: 'Moderne', fg: '#667eea', bg: '#F3F4F6', anim: '#667eea' },
  { name: 'Vibrant', fg: '#EC4899', bg: '#FEF3C7', anim: '#EC4899' },
  { name: 'Professionnel', fg: '#1F2937', bg: '#E5E7EB', anim: '#667eea' },
  { name: 'Sunset', fg: '#F59E0B', bg: '#FEF3C7', anim: '#F59E0B' },
  { name: 'Ocean', fg: '#0EA5E9', bg: '#E0F2FE', anim: '#0EA5E9' },
];
```

### Correction d'Erreur & Logo

La correction d'erreur permet au QR code d'être lu même s'il est partiellement endommagé:

- **L (7%)** - Minimum, sans logo
- **M (15%)** - Standard, logo petit (<15%)
- **Q (25%)** - Recommandé avec logo
- **H (30%)** - Maximum, logo grand (>25%)

**Recommandation**:

```typescript
const getRecommendedErrorCorrection = (hasLogo: boolean, logoSize: number) => {
  if (!hasLogo) return 'M';
  if (logoSize > 25) return 'H';
  return 'Q';
};
```

### Tailles d'Export

| Taille | Usage               | Qualité    |
| ------ | ------------------- | ---------- |
| 256px  | Web, mobile         | Basse      |
| 512px  | Web, écrans HD      | Standard   |
| 1024px | Print, affiches     | Haute      |
| 2048px | Print haute qualité | Très haute |

---

## 🛠️ Guide de Développement

### Ajouter un Nouveau Style

1. Ajouter l'enum dans `prisma/schema.prisma`:

```prisma
enum QRCodeStyle {
  // ...
  NEW_STYLE
}
```

2. Mettre à jour le type TypeScript dans `lib/types/qr-code.types.ts`

3. Ajouter le style dans `QRCodeStyleSelector.tsx`:

```typescript
const styles = [
  // ...
  { value: 'NEW_STYLE', label: 'Nouveau Style', preview: '◆◆◆' },
];
```

4. Implémenter la génération dans `lib/utils/qr-code-generator.ts`

### Ajouter une Nouvelle Animation

1. Ajouter l'enum dans `prisma/schema.prisma`:

```prisma
enum QRCodeAnimation {
  // ...
  NEW_ANIMATION
}
```

2. Créer le CSS dans `QRCodePreview.tsx`:

```css
@keyframes new-animation {
  0% {
    /* ... */
  }
  100% {
    /* ... */
  }
}

.qr-animation-new-animation {
  animation: new-animation 2s ease-in-out infinite;
}
```

3. Ajouter dans `QRCodeAnimationSelector.tsx`:

```typescript
const animations = [
  // ...
  { value: 'NEW_ANIMATION', label: 'Nouvelle Animation', icon: Star },
];
```

### Modifier les Templates

Éditer `QRCodeTemplateSelector.tsx`:

```typescript
const templates = [
  // ...
  {
    id: 'new-template',
    name: 'Nouveau Template',
    icon: Star,
    config: {
      style: 'DOTS',
      animation: 'RIPPLE',
      foregroundColor: '#...',
      backgroundColor: '#...',
      animationColor: '#...',
    },
  },
];
```

### Tests

Créer des tests pour chaque composant:

```typescript
// components/qr-codes/__tests__/QRCodeGenerator.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('QRCodeGenerator', () => {
  it('should render preview', () => {
    render(<QRCodeGenerator />);
    expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
  });

  // ...plus de tests
});
```

---

## 📚 Documentation Connexe

### Documentation Interne

- **[GENERATION_PLAN.md](./GENERATION_PLAN.md)** - Plan technique détaillé de la fonctionnalité
- **[STATUS.md](./STATUS.md)** - État d'avancement et décisions
- **[qr-animation-demo.html](./demo/qr-animation-demo.html)** - Démo interactive des animations

### Guides Connexes

- [Coding Guidelines](../../guides/CODING_GUIDELINES.md) - Standards de code
- [Testing Guide](../../development/TESTING-GUIDE.md) - Guide des tests
- [Architecture](../../architecture/ARCHITECTURE.md) - Architecture du projet

### Ressources Externes

- [qr-code-styling Documentation](https://github.com/kozakdenys/qr-code-styling)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [QR Code Best Practices](https://www.qr-code-generator.com/qr-code-marketing/qr-codes-basics/)

---

## 🐛 Problèmes Connus & Solutions

### Upload de Logo Échoue (400 Bad Request)

**Problème**: Mismatch entre `fileType` et `contentType`

**Solution**: Utiliser `contentType` dans tous les appels API

```typescript
await api.qrCode.uploadLogo.mutate({
  file: base64Data,
  filename: file.name,
  contentType: file.type, // ✅ Correct
});
```

### Preview QR Code Rectangulaire

**Problème**: Aspect ratio non respecté

**Solution**: Utiliser `aspect-square` dans le wrapper

```tsx
<div className="aspect-square w-full">
  <canvas ref={canvasRef} />
</div>
```

### Animation Ne S'Affiche Pas

**Problème**: Couleur hardcodée dans le CSS

**Solution**: Conversion hex→RGB dynamique

```typescript
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};
```

---

## 🎯 Roadmap & Prochaines Étapes

### Court Terme

- [ ] Tests E2E complets
- [ ] Optimisation du cache
- [ ] Compression automatique des logos
- [ ] Mode sombre pour le dashboard

### Moyen Terme

- [ ] API publique de tracking
- [ ] Webhooks pour les scans
- [ ] Intégration avec Google Analytics
- [ ] Templates personnalisables par utilisateur

### Long Terme

- [ ] QR Codes dynamiques avec redirections conditionnelles
- [ ] A/B testing de QR codes
- [ ] Analytics avancés avec ML
- [ ] Générateur de campagnes automatisées

---

**Dernière mise à jour**: 2025-12-11
**Version**: 1.0.0
**Status**: Production-ready

---

**Questions?** Consultez [STATUS.md](./STATUS.md) pour l'état d'avancement ou créez une issue GitHub.
