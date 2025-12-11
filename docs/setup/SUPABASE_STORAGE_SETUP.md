# Configuration Supabase Storage pour Logos

## 🎯 Objectif

Permettre l'upload et le stockage des logos pour :

1. **Commerces (Stores)** : Logo principal du commerce
2. **QR Codes** : Logos personnalisés pour chaque QR code

## 📦 Architecture de Stockage

### Structure des Buckets

```
supabase-storage/
├── store-logos/               # Logos des commerces
│   └── {storeId}/
│       └── logo.{ext}         # Logo principal
│
└── qr-code-logos/             # Logos pour QR codes
    └── {userId}/
        └── {qrCodeId}/
            └── logo.{ext}
```

### Politique d'Accès

- **Public** : Lecture publique pour les logos (nécessaire pour affichage)
- **Authentifié** : Upload restreint aux utilisateurs authentifiés
- **Taille max** : 2MB par fichier
- **Formats autorisés** : PNG, JPEG, SVG, WebP

---

## 🔧 Setup Supabase (Via Dashboard ou SQL)

### 1. Créer les Buckets

```sql
-- Bucket pour les logos des commerces
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-logos', 'store-logos', true);

-- Bucket pour les logos des QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-code-logos', 'qr-code-logos', true);
```

### 2. Politique de Sécurité (RLS)

```sql
-- Store Logos: Lecture publique
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'store-logos');

-- Store Logos: Upload restreint aux propriétaires
CREATE POLICY "Authenticated Users Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'store-logos'
  AND auth.role() = 'authenticated'
);

-- Store Logos: Mise à jour restreinte aux propriétaires
CREATE POLICY "Owner Update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'store-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Store Logos: Suppression restreinte aux propriétaires
CREATE POLICY "Owner Delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'store-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Même chose pour qr-code-logos
CREATE POLICY "Public Access QR" ON storage.objects
FOR SELECT USING (bucket_id = 'qr-code-logos');

CREATE POLICY "Authenticated Users Upload QR" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'qr-code-logos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Owner Update QR" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'qr-code-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owner Delete QR" ON storage.objects
FOR DELETE USING (
  bucket_id = 'qr-code-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 💾 Migration Prisma

### Mise à Jour du Schéma

```prisma
model Store {
  id                String   @id @default(cuid())
  name              String

  // Logo - 2 options
  logoUrl           String?          // URL externe (si fournie)
  logoStoragePath   String?          // Path dans Supabase Storage (si uploadé)

  // Computed field (géré côté application)
  // logoPublicUrl = logoStoragePath ? getSupabaseUrl(logoStoragePath) : logoUrl

  // ... autres champs existants
}

model QRCode {
  id                String   @id @default(cuid())

  // ... champs existants

  // Logo
  logoUrl           String?          // URL externe OU
  logoStoragePath   String?          // Path dans Supabase Storage
  logoSize          Int?      @default(80)

  // ... autres champs
}
```

### Migration SQL

```sql
-- Add logoStoragePath to Store
ALTER TABLE "stores" ADD COLUMN "logo_storage_path" TEXT;

-- Add logoStoragePath to QRCode
ALTER TABLE "qr_codes" ADD COLUMN "logo_storage_path" TEXT;
```

---

## 🔨 Utilitaires TypeScript

### `/src/lib/utils/supabase-storage.ts`

```typescript
import { supabase } from '@/lib/supabase/client';

/**
 * Upload d'un logo de commerce
 */
export async function uploadStoreLogo(
  storeId: string,
  file: File,
): Promise<{ url: string; path: string }> {
  // Validation
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Le fichier ne doit pas dépasser 2MB');
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format non supporté. Utilisez PNG, JPEG, SVG ou WebP');
  }

  // Créer le path
  const fileExt = file.name.split('.').pop();
  const fileName = `logo.${fileExt}`;
  const filePath = `${storeId}/${fileName}`;

  // Upload
  const { data, error } = await supabase.storage.from('store-logos').upload(filePath, file, {
    upsert: true, // Remplacer si existe déjà
    contentType: file.type,
    cacheControl: '3600', // Cache 1h
  });

  if (error) {
    throw new Error(`Erreur upload: ${error.message}`);
  }

  // Récupérer l'URL publique
  const { data: urlData } = supabase.storage.from('store-logos').getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

/**
 * Upload d'un logo pour QR code
 */
export async function uploadQRCodeLogo(
  userId: string,
  qrCodeId: string,
  file: File,
): Promise<{ url: string; path: string }> {
  // Validation (même que uploadStoreLogo)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Le fichier ne doit pas dépasser 2MB');
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format non supporté');
  }

  // Path
  const fileExt = file.name.split('.').pop();
  const fileName = `logo.${fileExt}`;
  const filePath = `${userId}/${qrCodeId}/${fileName}`;

  // Upload
  const { data, error } = await supabase.storage.from('qr-code-logos').upload(filePath, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: '3600',
  });

  if (error) {
    throw new Error(`Erreur upload: ${error.message}`);
  }

  // URL publique
  const { data: urlData } = supabase.storage.from('qr-code-logos').getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

/**
 * Supprimer un logo
 */
export async function deleteStoreLogo(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from('store-logos').remove([storagePath]);

  if (error) {
    throw new Error(`Erreur suppression: ${error.message}`);
  }
}

export async function deleteQRCodeLogo(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from('qr-code-logos').remove([storagePath]);

  if (error) {
    throw new Error(`Erreur suppression: ${error.message}`);
  }
}

/**
 * Récupérer l'URL publique d'un logo
 */
export function getStoreLogoUrl(storagePath: string): string {
  const { data } = supabase.storage.from('store-logos').getPublicUrl(storagePath);

  return data.publicUrl;
}

export function getQRCodeLogoUrl(storagePath: string): string {
  const { data } = supabase.storage.from('qr-code-logos').getPublicUrl(storagePath);

  return data.publicUrl;
}

/**
 * Helper pour récupérer le logo final (Storage OU URL externe)
 */
export function getStoreFinalLogoUrl(store: {
  logoUrl?: string | null;
  logoStoragePath?: string | null;
}): string | null {
  // Priorité: Supabase Storage > URL externe
  if (store.logoStoragePath) {
    return getStoreLogoUrl(store.logoStoragePath);
  }

  return store.logoUrl || null;
}
```

---

## 🎨 Composant Upload

### `/src/components/stores/StoreLogoUpload.tsx`

```typescript
'use client';

import { useState } from 'react';
import { uploadStoreLogo, deleteStoreLogo } from '@/lib/utils/supabase-storage';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Link as LinkIcon } from 'lucide-react';

interface StoreLogoUploadProps {
  storeId: string;
  currentLogoUrl?: string | null;
  currentStoragePath?: string | null;
  onLogoChange: (url: string, storagePath?: string) => void;
}

export function StoreLogoUpload({
  storeId,
  currentLogoUrl,
  currentStoragePath,
  onLogoChange,
}: StoreLogoUploadProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('upload');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url, path } = await uploadStoreLogo(storeId, file);
      onLogoChange(url, path);
      toast({
        title: 'Logo uploadé',
        description: 'Le logo a été uploadé avec succès',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur upload',
        variant: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;

    try {
      // Valider l'URL
      new URL(urlInput);
      onLogoChange(urlInput);
      toast({
        title: 'Logo ajouté',
        description: 'L\'URL du logo a été enregistrée',
        variant: 'success',
      });
    } catch (_error) {
      toast({
        title: 'URL invalide',
        description: 'Veuillez entrer une URL valide',
        variant: 'error',
      });
    }
  };

  const handleRemove = async () => {
    if (currentStoragePath) {
      await deleteStoreLogo(currentStoragePath);
    }
    onLogoChange('');
    toast({
      title: 'Logo supprimé',
      variant: 'success',
    });
  };

  return (
    <div className="space-y-4">
      {/* Toggle Mode */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 px-4 py-2 rounded-lg border transition ${
            mode === 'upload'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          <Upload className="inline w-4 h-4 mr-2" />
          Upload Fichier
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 px-4 py-2 rounded-lg border transition ${
            mode === 'url'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          <LinkIcon className="inline w-4 h-4 mr-2" />
          URL Externe
        </button>
      </div>

      {/* Upload ou URL */}
      {mode === 'upload' ? (
        <div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {uploading && <p className="text-sm text-gray-500 mt-2">Upload en cours...</p>}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://exemple.com/logo.png"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Ajouter
          </button>
        </div>
      )}

      {/* Preview */}
      {currentLogoUrl && (
        <div className="relative inline-block">
          <img
            src={currentLogoUrl}
            alt="Logo"
            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500">
        Formats acceptés : PNG, JPEG, SVG, WebP • Taille max : 2MB
      </p>
    </div>
  );
}
```

---

## 🚀 Intégration dans les Routes tRPC

### `/src/server/routers/store.router.ts`

```typescript
import { uploadStoreLogo, getStoreFinalLogoUrl } from '@/lib/utils/supabase-storage';

export const storeRouter = router({
  // ... routes existantes

  // Upload logo
  uploadLogo: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        fileData: z.string(), // Base64
        fileName: z.string(),
        fileType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Convertir base64 en File
      const buffer = Buffer.from(input.fileData.split(',')[1], 'base64');
      const file = new File([buffer], input.fileName, { type: input.fileType });

      const { url, path } = await uploadStoreLogo(input.storeId, file);

      // Mettre à jour en DB
      await ctx.db.store.update({
        where: { id: input.storeId },
        data: {
          logoUrl: url,
          logoStoragePath: path,
        },
      });

      return { url, path };
    }),
});
```

---

## ✅ Checklist d'Implémentation

- [ ] Créer les buckets dans Supabase Dashboard
- [ ] Configurer les politiques RLS
- [ ] Créer la migration Prisma (logoStoragePath)
- [ ] Implémenter les utilitaires supabase-storage.ts
- [ ] Créer le composant StoreLogoUpload
- [ ] Intégrer dans le formulaire de création/édition Store
- [ ] Tester upload, affichage, suppression
- [ ] Intégrer dans QRCodeLogoPicker pour réutiliser les logos

---

**Configuration prête pour l'implémentation !**
