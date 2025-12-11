/**
 * Supabase Storage Utilities
 * Utilities for uploading, deleting, and retrieving logos from Supabase Storage
 * IMPORTANT: ZERO any types
 */

import { supabase } from '@/lib/supabase/client';
import { MAX_LOGO_FILE_SIZE, ACCEPTED_LOGO_FORMATS } from '@/lib/types/qr-code.types';

/**
 * Upload a store logo to Supabase Storage
 * @param storeId - The ID of the store
 * @param file - The file to upload
 * @returns Object containing the public URL and storage path
 * @throws Error if validation fails or upload fails
 */
export async function uploadStoreLogo(
  storeId: string,
  file: File,
): Promise<{ url: string; path: string }> {
  // Validation
  if (file.size > MAX_LOGO_FILE_SIZE) {
    throw new Error('Le fichier ne doit pas dépasser 2MB');
  }

  if (!ACCEPTED_LOGO_FORMATS.includes(file.type)) {
    throw new Error('Format non supporté. Utilisez PNG, JPEG, SVG ou WebP');
  }

  // Create the path
  const fileExt = file.name.split('.').pop();
  const fileName = `logo.${fileExt}`;
  const filePath = `${storeId}/${fileName}`;

  // Upload
  const { error } = await supabase.storage.from('store-logos').upload(filePath, file, {
    upsert: true, // Replace if exists
    contentType: file.type,
    cacheControl: '3600', // Cache 1 hour
  });

  if (error) {
    throw new Error(`Erreur upload: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('store-logos').getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

/**
 * Upload a QR code logo to Supabase Storage
 * @param userId - The ID of the user
 * @param qrCodeId - The ID of the QR code
 * @param file - The file to upload
 * @returns Object containing the public URL and storage path
 * @throws Error if validation fails or upload fails
 */
export async function uploadQRCodeLogo(
  userId: string,
  qrCodeId: string,
  file: File,
): Promise<{ url: string; path: string }> {
  // Validation
  if (file.size > MAX_LOGO_FILE_SIZE) {
    throw new Error('Le fichier ne doit pas dépasser 2MB');
  }

  if (!ACCEPTED_LOGO_FORMATS.includes(file.type)) {
    throw new Error('Format non supporté. Utilisez PNG, JPEG, SVG ou WebP');
  }

  // Create the path
  const fileExt = file.name.split('.').pop();
  const fileName = `logo.${fileExt}`;
  const filePath = `${userId}/${qrCodeId}/${fileName}`;

  // Upload
  const { error } = await supabase.storage.from('qr-code-logos').upload(filePath, file, {
    upsert: true, // Replace if exists
    contentType: file.type,
    cacheControl: '3600', // Cache 1 hour
  });

  if (error) {
    throw new Error(`Erreur upload: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('qr-code-logos').getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

/**
 * Delete a store logo from Supabase Storage
 * @param storagePath - The storage path of the logo to delete
 * @throws Error if deletion fails
 */
export async function deleteStoreLogo(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from('store-logos').remove([storagePath]);

  if (error) {
    throw new Error(`Erreur suppression: ${error.message}`);
  }
}

/**
 * Delete a QR code logo from Supabase Storage
 * @param storagePath - The storage path of the logo to delete
 * @throws Error if deletion fails
 */
export async function deleteQRCodeLogo(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from('qr-code-logos').remove([storagePath]);

  if (error) {
    throw new Error(`Erreur suppression: ${error.message}`);
  }
}

/**
 * Get the public URL for a store logo
 * @param storagePath - The storage path of the logo
 * @returns The public URL of the logo
 */
export function getStoreLogoUrl(storagePath: string): string {
  const { data } = supabase.storage.from('store-logos').getPublicUrl(storagePath);

  return data.publicUrl;
}

/**
 * Get the public URL for a QR code logo
 * @param storagePath - The storage path of the logo
 * @returns The public URL of the logo
 */
export function getQRCodeLogoUrl(storagePath: string): string {
  const { data } = supabase.storage.from('qr-code-logos').getPublicUrl(storagePath);

  return data.publicUrl;
}

/**
 * Helper to get the final logo URL for a store
 * Priority: Supabase Storage > External URL
 * @param store - Object containing logoUrl and logoStoragePath
 * @returns The final logo URL or null if none exists
 */
export function getStoreFinalLogoUrl(store: {
  logoUrl?: string | null;
  logoStoragePath?: string | null;
}): string | null {
  // Priority: Supabase Storage > External URL
  if (store.logoStoragePath) {
    return getStoreLogoUrl(store.logoStoragePath);
  }

  return store.logoUrl || null;
}

/**
 * Helper to get the final logo URL for a QR code
 * Priority: Supabase Storage > External URL
 * @param qrCode - Object containing logoUrl and logoStoragePath
 * @returns The final logo URL or null if none exists
 */
export function getQRCodeFinalLogoUrl(qrCode: {
  logoUrl?: string | null;
  logoStoragePath?: string | null;
}): string | null {
  // Priority: Supabase Storage > External URL
  if (qrCode.logoStoragePath) {
    return getQRCodeLogoUrl(qrCode.logoStoragePath);
  }

  return qrCode.logoUrl || null;
}
