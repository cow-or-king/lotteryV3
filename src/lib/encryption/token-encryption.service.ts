/**
 * Service de chiffrement pour les tokens Google Business Profile API
 * Utilise AES-256-GCM pour chiffrer/déchiffrer les tokens OAuth
 *
 * Architecture: Infrastructure Layer
 * ZERO any types
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Récupère la clé de chiffrement depuis les variables d'environnement
 * @throws Error si la clé n'est pas configurée ou invalide
 */
function getEncryptionKey(): Buffer {
  const key = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;

  if (!key) {
    throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY is not configured in environment variables');
  }

  // Convertir la clé base64 en Buffer
  const keyBuffer = Buffer.from(key, 'base64');

  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (256 bits)`);
  }

  return keyBuffer;
}

/**
 * Chiffre un token avec AES-256-GCM
 * @param token Le token en clair à chiffrer
 * @returns Le token chiffré au format: iv:authTag:encryptedData (en base64)
 */
export function encryptToken(token: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(token, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData (tous en base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Déchiffre un token chiffré avec AES-256-GCM
 * @param encryptedToken Le token chiffré (format: iv:authTag:encryptedData)
 * @returns Le token en clair
 * @throws Error si le format est invalide ou le déchiffrement échoue
 */
export function decryptToken(encryptedToken: string): string {
  const key = getEncryptionKey();

  const parts = encryptedToken.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const [ivBase64, authTagBase64, encryptedData] = parts;

  if (!ivBase64 || !authTagBase64 || !encryptedData) {
    throw new Error('Invalid encrypted token format: missing parts');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Vérifie que la clé de chiffrement est correctement configurée
 * @returns true si la clé est valide, false sinon
 */
export function isEncryptionConfigured(): boolean {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}
