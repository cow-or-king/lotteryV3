-- Politiques RLS pour le bucket store-logos

-- Vérifier et supprimer les politiques existantes si nécessaire
DROP POLICY IF EXISTS "Users can upload store logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for store logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their store logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their store logos" ON storage.objects;

-- Créer les politiques pour store-logos
CREATE POLICY "Users can upload store logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public read access for store logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'store-logos');

CREATE POLICY "Users can update their store logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'store-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their store logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'store-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Politiques RLS pour le bucket qr-codes

-- Vérifier et supprimer les politiques existantes si nécessaire
DROP POLICY IF EXISTS "Users can upload QR codes" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for QR codes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their QR codes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their QR codes" ON storage.objects;

-- Créer les politiques pour qr-codes
CREATE POLICY "Users can upload QR codes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'qr-codes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public read access for QR codes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'qr-codes');

CREATE POLICY "Users can update their QR codes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'qr-codes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their QR codes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'qr-codes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
