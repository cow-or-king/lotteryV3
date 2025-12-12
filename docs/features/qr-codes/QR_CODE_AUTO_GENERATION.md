# Génération Automatique de QR Code par Défaut

## Vue d'ensemble

Ce document décrit l'implémentation de la génération automatique d'un QR Code par défaut lors de la création d'un Store.

## Architecture

### Workflow de Création d'un Store

```
1. Store créé (via CreateStoreUseCase)
2. Upload du logo si fourni (Supabase Storage)
3. ✨ NOUVEAU: Génération automatique du QR Code par défaut
   - URL cible: ${NEXT_PUBLIC_APP_URL}/s/${store.slug}
   - Format: SVG
   - Pas de logo (pour l'instant)
   - Configuration par défaut (noir & blanc)
4. ✨ NOUVEAU: Liaison du QR Code au Store via defaultQrCodeId
5. Retour du Store créé avec Brand info
```

## Fichiers Modifiés/Créés

### 1. Service de Génération QR Code

**Fichier:** `/src/lib/utils/qr-code-server-generator.ts`

**Description:** Service serveur utilisant la librairie `qrcode` native Node.js pour générer des QR Codes SVG.

**Fonctions principales:**

- `generateDefaultQRCodeForStore()`: Génère un QR Code SVG et l'enregistre en base
- `linkDefaultQRCodeToStore()`: Lie le QR Code au Store via `defaultQrCodeId`
- `generateAndLinkDefaultQRCode()`: Fonction complète qui combine génération + liaison

**Configuration par défaut:**

```typescript
{
  name: `QR Code par défaut - ${storeName}`,
  url: `${NEXT_PUBLIC_APP_URL}/s/${storeSlug}`,
  type: 'STATIC',
  style: 'SQUARE',
  animation: 'NONE',
  foregroundColor: '#000000',
  backgroundColor: '#FFFFFF',
  size: 512,
  errorCorrectionLevel: 'M', // 15% correction
  logoUrl: null,
  qrCodeCustomized: false
}
```

### 2. Modification du Router Store

**Fichier:** `/src/server/api/routers/store.router.ts`

**Modifications:**

- Import du service `generateAndLinkDefaultQRCode`
- Appel asynchrone après l'upload du logo
- Gestion d'erreur non bloquante (le Store est créé même si le QR Code échoue)

**Code ajouté (ligne ~262):**

```typescript
generateAndLinkDefaultQRCode({
  storeId: result.data.id,
  storeName: result.data.name,
  storeSlug: result.data.slug,
  userId: ctx.user.id,
}).catch((error) => {
  console.error('Erreur génération QR Code par défaut:', error);
});
```

### 3. Dépendances

**Ajout de types TypeScript:**

```bash
npm install --save-dev @types/qrcode
```

**Librairie déjà présente:**

- `qrcode@1.5.4` - Génération de QR Codes côté serveur

## Schéma de Base de Données

Le modèle `Store` dans Prisma Schema:

```prisma
model Store {
  // ... autres champs
  defaultQrCodeId    String?   @unique @map("default_qr_code_id")
  qrCodeCustomized   Boolean   @default(false) @map("qr_code_customized")
  qrCodeCustomizedAt DateTime? @map("qr_code_customized_at")

  // Relations
  defaultQrCode QRCode? @relation("StoreDefaultQRCode", fields: [defaultQrCodeId], references: [id], onDelete: SetNull)
  qrCodes       QRCode[]
}
```

## Points Importants

### 1. Opération Asynchrone Non Bloquante

La génération du QR Code est lancée en arrière-plan et ne bloque **PAS** le retour du Store créé:

```typescript
generateAndLinkDefaultQRCode(...).catch((error) => {
  console.error('Erreur génération QR Code par défaut:', error);
});
// Le code continue immédiatement ici
return { ...result.data, brand };
```

### 2. Gestion d'Erreur Robuste

- Si la génération échoue, l'erreur est loggée mais la création du Store réussit
- Le `defaultQrCodeId` reste `null` jusqu'à ce qu'un QR Code soit généré
- Le champ `qrCodeCustomized` reste `false` jusqu'à personnalisation

### 3. URL Dynamique

L'URL du QR Code pointe vers `/s/${slug}` où `slug` est le slug unique du Store:

- Exemple: `http://localhost:3000/s/mon-commerce-123`
- Production: `https://app.reviewlottery.com/s/mon-commerce-123`

### 4. Aucun Type `any`

Respect de la règle **ZERO any types** avec typage strict TypeScript.

## Tests

### Script de Test Unitaire

**Fichier:** `/scripts/testing/test-qr-generation.ts`

**Usage:**

```bash
npx tsx scripts/testing/test-qr-generation.ts
```

**Résultat attendu:**

```
🧪 Test de génération de QR Code SVG
✅ QR Code SVG généré avec succès!
📊 Taille du SVG: 1570 caractères
✅ Prêt à générer des QR Codes par défaut pour les Stores!
```

### Test d'Intégration

Pour tester la génération automatique complète:

1. Démarrer l'application: `npm run dev`
2. Créer un nouveau Store via l'interface UI
3. Vérifier dans la base de données:
   - Le Store a un `defaultQrCodeId` non null
   - Un QRCode existe avec le nom "QR Code par défaut - {store.name}"
   - Le QR Code pointe vers `/s/${slug}`

## Fonctionnalités Futures

- [ ] Ajout du logo du Store dans le QR Code (nécessite `errorCorrectionLevel: 'H'`)
- [ ] Personnalisation des couleurs selon la Brand
- [ ] Possibilité de régénérer le QR Code par défaut
- [ ] Export automatique du QR Code en PNG/PDF
- [ ] Page de visualisation `/s/${slug}` avec infos du Store

## Logs

Le service utilise le logger centralisé du projet:

```typescript
logger.info('Generating default QR Code for store', { storeId, targetUrl });
logger.error('Failed to generate default QR Code', { error });
```

Les logs apparaissent uniquement en développement (`NODE_ENV=development`).

## Support

En cas de problème:

1. Vérifier que `NEXT_PUBLIC_APP_URL` est défini dans `.env.local`
2. Vérifier les logs serveur pour les erreurs de génération
3. Vérifier que la librairie `qrcode` est installée: `npm list qrcode`
4. Vérifier les types TypeScript: `npm list @types/qrcode`

## Changelog

### Version 1.0.0 (2025-12-11)

- ✨ Implémentation initiale de la génération automatique de QR Code
- ✨ Service serveur `qr-code-server-generator.ts`
- ✨ Intégration dans `store.router.ts`
- ✨ Ajout de `@types/qrcode` dans devDependencies
- ✨ Script de test unitaire
- 📚 Documentation complète
