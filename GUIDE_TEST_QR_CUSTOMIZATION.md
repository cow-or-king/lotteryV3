# Guide de Test - Personnalisation QR Code Store

## Vue d'ensemble

Ce guide explique comment tester le système complet de personnalisation du QR Code par défaut d'un Store, avec verrouillage à vie après personnalisation.

## Prérequis

### 1. Bucket Supabase Storage

Créer le bucket `qr-codes` dans Supabase Storage (si pas déjà créé) :

1. Aller dans Supabase Dashboard → Storage
2. Créer un nouveau bucket : `qr-codes`
3. Politique de sécurité :
   - **Public** : Non (accès via signed URLs)
   - **Authenticated** : Oui (upload par utilisateurs authentifiés)

### 2. Vérifier la Database

Le schema Prisma contient déjà les champs nécessaires dans `Store` :

- `defaultQrCodeId` (relation vers QRCode)
- `qrCodeCustomized` (boolean, défaut: false)
- `qrCodeCustomizedAt` (DateTime nullable)
- `logoUrl` (string nullable)
- `logoStoragePath` (string nullable)

## Fonctionnalités Testées

### 1. Affichage du Bouton de Personnalisation

**Localisation** : `/dashboard/stores` → StoreCard → Menu 3 points

**Vérifications** :

- ✅ Le bouton "Personnaliser QR Code" apparaît dans le menu
- ✅ Si déjà personnalisé : le texte devient "Télécharger QR Code"

### 2. Modal de Personnalisation (Première Fois)

**Scénario** : Cliquer sur "Personnaliser QR Code" pour un Store NON personnalisé

**Vérifications** :

- ✅ Warning visible : "⚠️ Attention : Vous ne pourrez personnaliser ce QR Code qu'une seule fois"
- ✅ 5 styles disponibles : SQUARE, DOTS, ROUNDED, CLASSY, CIRCULAR
- ✅ Couleurs personnalisables (foreground + background)
- ✅ Taille du logo (SMALL/MEDIUM/LARGE) si le Store a un logo
- ✅ Niveau de correction d'erreur : L, M, Q, H
- ✅ Bouton "Annuler" (gris)
- ✅ Bouton "Personnaliser définitivement" (rouge, style warning)

### 3. Personnalisation Serveur

**Ce qui se passe en backend** :

1. Vérifier que `qrCodeCustomized === false` (sinon erreur)
2. Générer QR Code SVG (vectoriel, 2048x2048)
3. Générer QR Code PNG (HD, 2048x2048)
4. Upload vers Supabase Storage : `qr-codes/{qrCodeId}/custom-{timestamp}.svg` et `.png`
5. Mettre à jour le QRCode (style, colors, logoSize, errorCorrectionLevel)
6. **Verrouillage** : `qrCodeCustomized = true`, `qrCodeCustomizedAt = now()`
7. Mettre à jour le Store : `qrCodeCustomized = true`, `qrCodeCustomizedAt = now()`

**Vérifications après personnalisation** :

- ✅ Redirection automatique (reload de la page)
- ✅ Le Store affiche "Télécharger QR Code" au lieu de "Personnaliser"
- ✅ Les champs DB sont mis à jour

### 4. Modal Readonly (Déjà Personnalisé)

**Scénario** : Cliquer sur "Télécharger QR Code" pour un Store DÉJÀ personnalisé

**Vérifications** :

- ✅ Message : "QR Code déjà personnalisé le [DATE]"
- ✅ Pas de modifications possibles
- ✅ 2 boutons d'export :
  - "📥 Télécharger SVG" (vectoriel)
  - "📥 Télécharger PNG HD" (2048x2048)
- ✅ Bouton "Fermer"

### 5. Export QR Code

**Formats disponibles** :

- **SVG** : Vectoriel, parfait pour l'impression professionnelle
- **PNG** : 2048x2048px minimum (haute résolution)

**Vérifications** :

- ✅ Cliquer sur "Télécharger SVG" → fichier `.svg` téléchargé
- ✅ Cliquer sur "Télécharger PNG HD" → fichier `.png` téléchargé
- ✅ Les fichiers sont fonctionnels et de haute qualité

### 6. Sécurité

**Tests de sécurité** :

- ✅ Essayer de personnaliser un QR Code déjà personnalisé → Erreur
- ✅ Essayer de personnaliser un QR Code d'un autre utilisateur → Forbidden
- ✅ Essayer d'exporter un QR Code non personnalisé → Erreur
- ✅ Signed URLs expirent dans 1h (vérifier avec un timestamp ancien)

## Tests Automatisés (À Implémenter)

### Test 1 : Personnalisation Unique

```typescript
test('Should allow customization only once', async () => {
  // 1. Créer un Store avec QR Code par défaut
  // 2. Personnaliser le QR Code
  // 3. Essayer de personnaliser à nouveau → Erreur "déjà personnalisé"
  // 4. Vérifier que qrCodeCustomized === true
});
```

### Test 2 : Export Multi-Format

```typescript
test('Should export SVG and PNG formats', async () => {
  // 1. Personnaliser un QR Code
  // 2. Exporter en SVG → vérifier l'URL signée
  // 3. Exporter en PNG → vérifier l'URL signée
  // 4. Vérifier que les URLs expirent dans 1h
});
```

### Test 3 : Ownership

```typescript
test('Should prevent unauthorized customization', async () => {
  // 1. User A crée un Store
  // 2. User B essaie de personnaliser le QR Code → Forbidden
});
```

## Checklist Complète

### Avant Mise en Production

- [ ] Bucket `qr-codes` créé dans Supabase
- [ ] Politique de sécurité configurée (authenticated users only)
- [ ] Tests manuels réussis (voir ci-dessus)
- [ ] Tests de sécurité réussis (ownership, verrouillage)
- [ ] Vérifier la qualité des exports (SVG + PNG)

### Fonctionnalités Avancées (Future)

- [ ] Preview en temps réel du QR Code dans le modal
- [ ] Historique des exports (logs)
- [ ] Analytics : nombre de téléchargements par format
- [ ] Support PDF export (impression directe)

## Erreurs Connues et Résolutions

### Erreur : "QR Code déjà personnalisé"

**Cause** : Tentative de re-personnalisation
**Solution** : C'est normal, le verrouillage fonctionne

### Erreur : "Échec upload SVG/PNG"

**Cause** : Bucket Supabase non configuré ou permissions incorrectes
**Solution** : Vérifier le bucket et les politiques de sécurité

### Erreur : "Fichier non trouvé"

**Cause** : Export appelé avant personnalisation
**Solution** : Personnaliser d'abord le QR Code

## Endpoints tRPC

### `qrCode.customize`

**Input** :

```typescript
{
  qrCodeId: string,
  style: 'SQUARE' | 'DOTS' | 'ROUNDED' | 'CLASSY' | 'CIRCULAR',
  foregroundColor: string, // #RRGGBB
  backgroundColor: string, // #RRGGBB
  logoSize: 'SMALL' | 'MEDIUM' | 'LARGE' | null,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
}
```

**Output** :

```typescript
{
  success: true,
  qrCodeId: string,
  svgUrl: string,
  pngUrl: string,
  customizedAt: Date
}
```

### `qrCode.export`

**Input** :

```typescript
{
  qrCodeId: string,
  format: 'SVG' | 'PNG'
}
```

**Output** :

```typescript
{
  downloadUrl: string, // Signed URL (expire dans 1h)
  expiresAt: Date
}
```

## Notes de Développement

### Architecture

- **Service** : `/src/lib/utils/qr-code-customizer.ts`
- **Router** : `/src/server/api/routers/qr-code/qr-code.customize.ts`
- **Modal** : `/src/components/qr-codes/CustomizeQRCodeModal.tsx`
- **StoreCard** : `/src/components/stores/StoreCard.tsx` (bouton ajouté)

### Librairies Utilisées

- `qrcode` (Node.js, server-side) pour génération SVG/PNG
- Supabase Storage pour upload/download
- tRPC pour endpoints type-safe

### Contraintes Respectées

1. ✅ Personnalisation UNE SEULE FOIS (verrouillage à vie)
2. ✅ Export multi-format (SVG vectoriel + PNG HD 2048x2048)
3. ✅ Signed URLs sécurisées (expiration 1h)
4. ✅ ZERO any types (TypeScript strict)
5. ✅ UX claire (warnings, état readonly)
