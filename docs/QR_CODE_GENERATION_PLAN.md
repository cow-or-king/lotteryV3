# Plan de Génération de QR Codes - ReviewLottery V3

## 🎯 Objectifs

### Cas d'Usage

1. **QR Code Statique** : Pour impressions physiques (leaflets, PLV, affiches)
2. **QR Code Dynamique** : Pour campagnes digitales ponctuelles
3. **Personnalisation** : Styles, couleurs, logo pour correspondre à l'identité de marque

### Fonctionnalités Phase 1 (Générateur uniquement)

- ✅ Génération de QR codes avec **5 styles différents** (incluant forme ronde)
- ✅ **Animations interactives** au survol (6 types d'animations CSS)
- ✅ Personnalisation des couleurs (fond + premier plan)
- ✅ Option d'ajout de logo/icône au centre
- ✅ **Upload logo via Supabase Storage** (Store + QR codes)
- ✅ Prévisualisation en temps réel avec animations
- ✅ Téléchargement en plusieurs formats (PNG, SVG, PDF)
- ✅ Paramètres de qualité (taille, niveau de correction d'erreur)
- ✅ Animation de bienvenue au scan (page de destination)

### Fonctionnalités Phase 2 (Attribution - À venir)

- ⏳ Association QR code → Commerce
- ⏳ Association QR code → Campagne
- ⏳ QR codes multiples par commerce
- ⏳ Analytics de scan
- ⏳ QR codes avec expiration

---

## 📚 Stack Technique

### Bibliothèques de Génération

```json
{
  "qrcode": "^1.5.3", // Génération QR code de base
  "qr-code-styling": "^1.6.0", // Styles avancés + logo
  "canvas": "^2.11.2", // Rendu côté serveur (optionnel)
  "html-to-image": "^1.11.11", // Export PNG/JPEG
  "framer-motion": "^10.16.16" // Animations fluides
}
```

### Pourquoi ces bibliothèques ?

- **qrcode** : Simple, rapide, génération basique
- **qr-code-styling** : Styles avancés (dots, rounded, classy, square, circular)
- Support du logo central avec gestion automatique de l'espace
- Export en SVG, PNG, JPEG, Canvas
- **framer-motion** : Animations CSS performantes pour les effets interactifs

### 🎬 Demo Interactive des Animations

Un fichier HTML de démonstration est disponible pour tester les animations :
📄 **`docs/qr-animation-demo.html`**

Ouvrez-le dans votre navigateur pour voir les 6 types d'animations :

1. **Ripple Effect** : Onde de choc qui se propage (recommandé)
2. **Pulse** : Pulsation douce et subtile
3. **Dots Wave** : Vague animée dans les points
4. **Rotate 3D** : Rotation 3D spectaculaire
5. **Glow** : Effet lumière néon pulsante
6. **Circular Ripple** : Onde circulaire pour QR ronds (nouveau !)

Passez la souris sur chaque QR code pour voir l'animation en action.

---

## 🏗️ Architecture

### Structure de Dossiers

```
src/
├── app/dashboard/qr-codes/
│   ├── page.tsx                    # Page principale QR codes
│   ├── new/
│   │   └── page.tsx               # Créer un nouveau QR code
│   └── [id]/
│       └── page.tsx               # Éditer un QR code existant
│
├── components/qr-codes/
│   ├── index.ts                    # Exports centralisés
│   ├── QRCodeGenerator.tsx         # Composant principal générateur
│   ├── QRCodePreview.tsx           # Prévisualisation en temps réel
│   ├── QRCodeStyleSelector.tsx     # Sélection du style (dots/rounded/square/classy)
│   ├── QRCodeColorPicker.tsx       # Sélecteur de couleurs
│   ├── QRCodeLogoPicker.tsx        # Upload/sélection logo
│   ├── QRCodeQualitySettings.tsx   # Taille, correction d'erreurs
│   ├── QRCodeExportPanel.tsx       # Boutons export PNG/SVG/PDF
│   ├── QRCodeList.tsx              # Liste des QR codes créés
│   └── QRCodeListItem.tsx          # Item individuel
│
├── hooks/qr-codes/
│   ├── index.ts
│   ├── useQRCodeGenerator.ts       # Hook principal génération
│   ├── useQRCodePreview.ts         # Hook prévisualisation
│   └── useQRCodeExport.ts          # Hook export/téléchargement
│
├── lib/types/
│   └── qr-code.types.ts            # Types QR code
│
├── lib/utils/
│   └── qr-code-generator.ts        # Utilitaires génération
│
└── server/routers/
    └── qr-code.router.ts           # Routes tRPC

prisma/schema.prisma
└── model QRCode                     # Schéma DB
```

---

## 💾 Modèle de Données (Prisma)

### Schema Database

```prisma
model QRCode {
  id            String   @id @default(cuid())

  // Informations de base
  name          String                    // Nom descriptif
  url           String                    // URL de destination
  type          QRCodeType  @default(STATIC)

  // Style & Apparence
  style         QRCodeStyle @default(DOTS)
  foregroundColor String   @default("#000000")
  backgroundColor String   @default("#FFFFFF")

  // Logo (optionnel)
  logoUrl       String?
  logoSize      Int?      @default(80)    // Taille en px

  // Qualité
  size          Int       @default(512)   // 256, 512, 1024, 2048
  errorCorrectionLevel String @default("M") // L, M, Q, H

  // Relations (Phase 2)
  storeId       String?
  store         Store?    @relation(fields: [storeId], references: [id], onDelete: SetNull)

  campaignId    String?
  // campaign      Campaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)

  // Métadonnées
  scanCount     Int       @default(0)     // Phase 2
  lastScannedAt DateTime?                 // Phase 2
  expiresAt     DateTime?                 // Phase 2

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdBy     String
  user          User      @relation(fields: [createdBy], references: [id], onDelete: Cascade)

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
  CLASSY      // Style élégant avec dégradés
  CIRCULAR    // 🆕 Forme ronde (QR code circulaire)
}

enum QRCodeAnimation {
  NONE          // Pas d'animation
  RIPPLE        // Onde de choc (recommandé)
  PULSE         // Pulsation douce
  WAVE          // Vague dans les points
  ROTATE3D      // Rotation 3D
  GLOW          // Lumière néon
  CIRCULAR_RIPPLE  // Onde circulaire (pour CIRCULAR style)
}
```

---

## 🎨 Types TypeScript

### `/src/lib/types/qr-code.types.ts`

```typescript
import type { QRCodeType, QRCodeStyle } from '@prisma/client';

/**
 * Configuration pour générer un QR code
 */
export interface QRCodeConfig {
  // Données de base
  url: string;
  name: string;
  type: QRCodeType;

  // Style
  style: QRCodeStyle;
  foregroundColor: string;
  backgroundColor: string;

  // Logo
  logoUrl?: string;
  logoSize?: number;

  // Qualité
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
}

/**
 * Options de personnalisation du QR code
 */
export interface QRCodeStyleOptions {
  style: QRCodeStyle;
  dotsOptions: {
    color: string;
    type: 'dots' | 'rounded' | 'classy' | 'square';
  };
  backgroundOptions: {
    color: string;
  };
  cornersSquareOptions?: {
    color?: string;
    type?: 'dot' | 'square' | 'extra-rounded';
  };
  cornersDotOptions?: {
    color?: string;
    type?: 'dot' | 'square';
  };
  imageOptions?: {
    hideBackgroundDots?: boolean;
    imageSize?: number;
    margin?: number;
  };
}

/**
 * Niveaux de correction d'erreur
 * L: ~7% de restauration
 * M: ~15% (recommandé)
 * Q: ~25%
 * H: ~30% (nécessaire avec logo)
 */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * Format d'export du QR code
 */
export type QRCodeExportFormat = 'png' | 'svg' | 'jpeg' | 'pdf';

/**
 * Résultat de la génération
 */
export interface QRCodeGenerationResult {
  success: boolean;
  dataUrl?: string; // Data URL pour prévisualisation
  blob?: Blob; // Blob pour téléchargement
  error?: string;
}

/**
 * Options d'export
 */
export interface QRCodeExportOptions {
  format: QRCodeExportFormat;
  filename: string;
  size: number;
}

/**
 * Branded type pour QRCodeId
 */
export type QRCodeId = string & { readonly __brand: 'QRCodeId' };

/**
 * DTO pour créer un QR code
 */
export interface CreateQRCodeInput {
  name: string;
  url: string;
  type: QRCodeType;
  style: QRCodeStyle;
  foregroundColor: string;
  backgroundColor: string;
  logoUrl?: string;
  logoSize?: number;
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  storeId?: string;
}

/**
 * DTO pour mettre à jour un QR code
 */
export interface UpdateQRCodeInput extends Partial<CreateQRCodeInput> {
  id: QRCodeId;
}

/**
 * QR code avec métadonnées
 */
export interface QRCodeWithMetadata {
  id: QRCodeId;
  name: string;
  url: string;
  type: QRCodeType;
  style: QRCodeStyle;
  foregroundColor: string;
  backgroundColor: string;
  logoUrl?: string;
  logoSize?: number;
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  scanCount: number;
  lastScannedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  store?: {
    id: string;
    name: string;
  };
}
```

---

## 🎨 Composants UI

### 1. QRCodeGenerator (Composant Principal)

**Responsabilité** : Orchestrer tous les sous-composants

```tsx
interface QRCodeGeneratorProps {
  initialConfig?: QRCodeConfig;
  onSave?: (config: QRCodeConfig) => void;
  mode: 'create' | 'edit';
}
```

### 2. QRCodeStyleSelector

**Responsabilité** : Sélection du style visuel

```tsx
interface QRCodeStyleSelectorProps {
  selectedStyle: QRCodeStyle;
  onStyleChange: (style: QRCodeStyle) => void;
}

// 4 options visuelles avec miniatures
const styles = [
  { value: 'DOTS', label: 'Points Arrondis', preview: '●●●' },
  { value: 'ROUNDED', label: 'Coins Arrondis', preview: '◙◙◙' },
  { value: 'SQUARE', label: 'Classique', preview: '■■■' },
  { value: 'CLASSY', label: 'Élégant', preview: '◆◆◆' },
];
```

### 3. QRCodeColorPicker

**Responsabilité** : Sélection des couleurs

```tsx
interface QRCodeColorPickerProps {
  foregroundColor: string;
  backgroundColor: string;
  onForegroundChange: (color: string) => void;
  onBackgroundChange: (color: string) => void;
}

// Palettes prédéfinies + sélecteur libre
const colorPresets = [
  { name: 'Classique', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Moderne', fg: '#667eea', bg: '#F3F4F6' },
  { name: 'Vibrant', fg: '#EC4899', bg: '#FEF3C7' },
  { name: 'Professionnel', fg: '#1F2937', bg: '#E5E7EB' },
];
```

### 4. QRCodeLogoPicker

**Responsabilité** : Upload/sélection du logo

```tsx
interface QRCodeLogoPickerProps {
  logoUrl?: string;
  logoSize: number;
  onLogoChange: (url: string) => void;
  onLogoRemove: () => void;
  onLogoSizeChange: (size: number) => void;
}

// Features:
// - Upload depuis l'ordinateur
// - Sélection depuis la galerie du commerce
// - Slider pour ajuster la taille (20% à 30% du QR code)
// - Preview du logo
```

### 5. QRCodePreview

**Responsabilité** : Affichage en temps réel

```tsx
interface QRCodePreviewProps {
  config: QRCodeConfig;
  size?: number;
  showGrid?: boolean;
}

// Génère et affiche le QR code en temps réel
// Affiche un loader pendant la génération
// Affiche les erreurs de génération
```

### 6. QRCodeQualitySettings

**Responsabilité** : Paramètres de qualité

```tsx
interface QRCodeQualitySettingsProps {
  size: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  onSizeChange: (size: number) => void;
  onErrorCorrectionChange: (level: ErrorCorrectionLevel) => void;
}

// Tailles: 256px, 512px, 1024px, 2048px
// Correction d'erreur: L, M, Q, H avec explications
```

### 7. QRCodeExportPanel

**Responsabilité** : Export et téléchargement

```tsx
interface QRCodeExportPanelProps {
  config: QRCodeConfig;
  disabled?: boolean;
}

// Boutons:
// - Télécharger PNG (haute qualité)
// - Télécharger SVG (vectoriel, pour print)
// - Télécharger PDF (prêt à imprimer)
// - Copier l'URL du QR code (Phase 2)
```

---

## 🔧 Custom Hooks

### 1. useQRCodeGenerator

```typescript
export function useQRCodeGenerator(initialConfig?: QRCodeConfig) {
  const [config, setConfig] = useState<QRCodeConfig>(initialConfig || defaultQRCodeConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfig = (updates: Partial<QRCodeConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const generateQRCode = async (): Promise<QRCodeGenerationResult> => {
    // Logique de génération
  };

  return {
    config,
    updateConfig,
    generateQRCode,
    isGenerating,
    error,
  };
}
```

### 2. useQRCodePreview

```typescript
export function useQRCodePreview(config: QRCodeConfig) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Régénérer le preview à chaque changement de config
    // Avec debounce de 300ms pour éviter trop de re-render
    const timeoutId = setTimeout(() => {
      regeneratePreview();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [config]);

  return { previewUrl, isLoading };
}
```

### 3. useQRCodeExport

```typescript
export function useQRCodeExport() {
  const exportQRCode = async (
    config: QRCodeConfig,
    options: QRCodeExportOptions,
  ): Promise<void> => {
    // Génération et téléchargement
  };

  const exportToPNG = async (config: QRCodeConfig, filename: string) => {
    return exportQRCode(config, { format: 'png', filename, size: config.size });
  };

  const exportToSVG = async (config: QRCodeConfig, filename: string) => {
    return exportQRCode(config, { format: 'svg', filename, size: config.size });
  };

  const exportToPDF = async (config: QRCodeConfig, filename: string) => {
    return exportQRCode(config, { format: 'pdf', filename, size: config.size });
  };

  return { exportToPNG, exportToSVG, exportToPDF };
}
```

---

## 🌐 Routes tRPC

### `/src/server/routers/qr-code.router.ts`

```typescript
export const qrCodeRouter = router({
  // Liste des QR codes
  list: protectedProcedure.query(async ({ ctx }) => {
    // Liste tous les QR codes de l'utilisateur
  }),

  // Détails d'un QR code
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    // Récupère un QR code par ID
  }),

  // Créer un QR code
  create: protectedProcedure.input(CreateQRCodeSchema).mutation(async ({ ctx, input }) => {
    // Crée un nouveau QR code en DB
    // Retourne l'ID et les métadonnées
  }),

  // Mettre à jour un QR code
  update: protectedProcedure.input(UpdateQRCodeSchema).mutation(async ({ ctx, input }) => {
    // Met à jour un QR code existant
  }),

  // Supprimer un QR code
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Supprime un QR code
    }),

  // Upload logo (Phase 1)
  uploadLogo: protectedProcedure
    .input(
      z.object({
        file: z.string(), // Base64
        filename: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Upload le logo sur le storage (Supabase Storage)
      // Retourne l'URL publique
    }),

  // Phase 2: Analytics
  getStats: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    // Statistiques de scan (Phase 2)
  }),
});
```

---

## 📐 UI/UX Design

### Page Principale (`/dashboard/qr-codes`)

```
┌─────────────────────────────────────────────────────────┐
│ 🎯 QR Codes                                    [+ Nouveau]│
├─────────────────────────────────────────────────────────┤
│                                                           │
│ Filtres: [Tous] [Statique] [Dynamique] 🔍 Rechercher... │
│                                                           │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │ [QR Preview]    │ │ [QR Preview]    │ │ [QR Preview]│ │
│ │                 │ │                 │ │             │ │
│ │ Mon Restaurant  │ │ Promo Noël 2024 │ │ Avis Google │ │
│ │ Statique        │ │ Dynamique       │ │ Statique    │ │
│ │ 1,234 scans     │ │ 89 scans        │ │ 456 scans   │ │
│ │ [✏️] [📥] [🗑️]   │ │ [✏️] [📥] [🗑️]   │ │ [✏️] [📥] [🗑️]│ │
│ └─────────────────┘ └─────────────────┘ └─────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Page Création/Édition (`/dashboard/qr-codes/new`)

```
┌─────────────────────────────────────────────────────────┐
│ ← Retour          Créer un QR Code                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─────────────────────┐  ┌─────────────────────────────┐│
│ │   Prévisualisation  │  │    Configuration             ││
│ │                     │  │                              ││
│ │   ┌─────────────┐   │  │ 📝 Informations de base      ││
│ │   │             │   │  │ Nom: [_________________]     ││
│ │   │  [QR CODE]  │   │  │ URL: [_________________]     ││
│ │   │             │   │  │ Type: (•) Statique           ││
│ │   │             │   │  │       ( ) Dynamique          ││
│ │   └─────────────┘   │  │                              ││
│ │                     │  │ 🎨 Style                     ││
│ │  512×512px          │  │ [●●●] [◙◙◙] [■■■] [◆◆◆]    ││
│ │                     │  │                              ││
│ │  [📥 PNG] [📥 SVG]  │  │ 🌈 Couleurs                  ││
│ │  [📥 PDF]           │  │ Premier plan: [⬛ #000000]   ││
│ │                     │  │ Fond:         [⬜ #FFFFFF]   ││
│ │                     │  │                              ││
│ └─────────────────────┘  │ 🖼️ Logo (optionnel)          ││
│                          │ [📁 Upload] [🗑️ Supprimer]  ││
│                          │ Taille: [────●──] 80%        ││
│                          │                              ││
│                          │ ⚙️ Qualité                   ││
│                          │ Taille: [512px ▼]            ││
│                          │ Correction: [M - Moyen ▼]    ││
│                          │                              ││
│                          │    [Annuler]  [💾 Enregistrer]││
│                          └──────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Plan d'Implémentation

### Phase 1A : Setup & Infrastructure (2-3h)

1. ✅ Installer les dépendances npm
2. ✅ Créer le schéma Prisma
3. ✅ Créer les types TypeScript
4. ✅ Générer la migration DB
5. ✅ Créer le router tRPC de base

### Phase 1B : Générateur Core (4-5h)

1. ✅ Créer `/lib/utils/qr-code-generator.ts`
2. ✅ Implémenter la génération basique (qr-code-styling)
3. ✅ Tester les 4 styles
4. ✅ Implémenter l'ajout de logo
5. ✅ Implémenter les exports (PNG, SVG, PDF)

### Phase 1C : Composants UI (6-8h)

1. ✅ QRCodePreview (+ hook useQRCodePreview)
2. ✅ QRCodeStyleSelector
3. ✅ QRCodeColorPicker
4. ✅ QRCodeLogoPicker
5. ✅ QRCodeQualitySettings
6. ✅ QRCodeExportPanel
7. ✅ QRCodeGenerator (composant principal)

### Phase 1D : Pages & Routes (3-4h)

1. ✅ Page liste (`/dashboard/qr-codes/page.tsx`)
2. ✅ Page création (`/dashboard/qr-codes/new/page.tsx`)
3. ✅ Page édition (`/dashboard/qr-codes/[id]/page.tsx`)
4. ✅ Implémenter les mutations tRPC (create, update, delete)
5. ✅ Intégration du système de toast

### Phase 1E : Tests & Refinement (2-3h)

1. ✅ Tester tous les styles
2. ✅ Tester les exports
3. ✅ Tester avec/sans logo
4. ✅ Optimiser les performances
5. ✅ Vérifier la responsivité mobile

**Total Phase 1 : 17-23 heures**

---

## 🚀 Phase 2 : Attribution & Analytics (Future)

### Fonctionnalités à ajouter

1. **Attribution aux commerces**
   - Associer un QR code à un ou plusieurs commerces
   - QR code par défaut pour chaque commerce

2. **Campagnes**
   - Créer des campagnes avec dates de début/fin
   - Associer des QR codes dynamiques aux campagnes
   - Réutiliser un QR physique pour différentes campagnes

3. **Analytics**
   - Tracker les scans (timestamp, localisation, device)
   - Dashboard avec graphiques
   - Export des données en CSV/Excel

4. **QR Codes Intelligents**
   - Redirection conditionnelle (ex: horaires d'ouverture)
   - A/B testing
   - Limitation de scans

---

## 💡 Bonnes Pratiques

### Performance

- Débouncer la génération du preview (300ms)
- Utiliser un Worker pour la génération côté client
- Mettre en cache les QR codes générés

### Sécurité

- Valider les URLs (whitelist de domaines autorisés)
- Limiter la taille des logos (max 2MB)
- Sanitize les noms de fichiers
- Rate limiting sur l'upload de logos

### UX

- Feedback visuel immédiat lors des changements
- Sauvegarder automatiquement en brouillon
- Permettre l'annulation des actions
- Afficher des exemples/templates prédéfinis

### Accessibilité

- Contraste suffisant pour les QR codes colorés
- Labels ARIA pour tous les contrôles
- Navigation au clavier complète
- Messages d'erreur clairs

---

## 📝 Notes Techniques

### Correction d'Erreur & Logo

```typescript
// Si logo présent, utiliser au minimum niveau Q (25%)
// Recommandé: niveau H (30%) pour logos > 20%
const getRecommendedErrorCorrection = (hasLogo: boolean, logoSize: number) => {
  if (!hasLogo) return 'M';
  if (logoSize > 25) return 'H';
  return 'Q';
};
```

### Taille & Qualité

```typescript
// Pour impression haute qualité: 1024px minimum
// Pour web/mobile: 512px suffisant
// Pour cartes de visite: 2048px recommandé
const sizeRecommendations = {
  web: 512,
  print: 1024,
  highQuality: 2048,
};
```

### Stockage Logo

```typescript
// Utiliser Supabase Storage
// Path: /qr-codes/logos/{userId}/{filename}
// Public URL avec expiration pour sécurité
const logoPath = `qr-codes/logos/${userId}/${filename}`;
```

---

## ✅ Checklist Pré-Implémentation

- [ ] Valider le plan avec le client
- [ ] Installer les dépendances
- [ ] Créer la branche `feature/qr-code-generator`
- [ ] Setup Supabase Storage bucket pour logos
- [ ] Créer les types TypeScript
- [ ] Implémenter la migration Prisma

---

**Ce plan est prêt à être exécuté. Confirmer pour commencer l'implémentation ?**
