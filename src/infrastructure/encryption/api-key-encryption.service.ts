/**
 * ApiKeyEncryptionService
 * Service de chiffrement/déchiffrement des API keys Google
 * Utilise AES-256-GCM pour un chiffrement authentifié
 *
 * SÉCURITÉ:
 * - Algorithm: AES-256-GCM (authenticated encryption)
 * - Key size: 256 bits (32 bytes)
 * - IV: 16 bytes (généré aléatoirement pour chaque encryption)
 * - Auth tag: 16 bytes (fourni par GCM)
 *
 * Format du texte chiffré: iv:authTag:encryptedData
 */

import crypto from 'crypto';
import { Result } from '@/lib/types/result.type';

export class ApiKeyEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;

  constructor() {
    const key = process.env.ENCRYPTION_SECRET_KEY;

    if (!key || key.length !== 64) {
      throw new Error('ENCRYPTION_SECRET_KEY must be 64 hex characters');
    }

    this.secretKey = Buffer.from(key, 'hex');
  }

  /**
   * Chiffre une clé API en texte clair
   * @param plainText - La clé API en texte clair
   * @returns Result contenant le texte chiffré au format iv:authTag:encryptedData
   */
  encrypt(plainText: string): Result<string> {
    try {
      // Générer un IV aléatoire pour chaque encryption (sécurité)
      const iv = crypto.randomBytes(16);

      // Créer le cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);

      // Chiffrer les données
      let encrypted = cipher.update(plainText, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Récupérer le tag d'authentification (GCM)
      const authTag = cipher.getAuthTag();

      // Format: iv:authTag:encryptedData
      const encryptedText = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;

      return Result.ok(encryptedText);
    } catch (_error) {
      return Result.fail(new Error('Encryption failed'));
    }
  }

  /**
   * Déchiffre une clé API chiffrée
   * @param encryptedText - Le texte chiffré au format iv:authTag:encryptedData
   * @returns Result contenant la clé API en texte clair
   */
  decrypt(encryptedText: string): Result<string> {
    try {
      // Parser le format iv:authTag:encryptedData
      const parts = encryptedText.split(':');

      if (parts.length !== 3) {
        return Result.fail(new Error('Invalid encrypted format'));
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      // Créer le decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);

      // Définir le tag d'authentification
      decipher.setAuthTag(authTag);

      // Déchiffrer les données
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return Result.ok(decrypted);
    } catch (_error) {
      return Result.fail(new Error('Decryption failed'));
    }
  }

  /**
   * Vérifie si une clé API est chiffrée (détection du format)
   * @param text - Le texte à vérifier
   * @returns true si le texte semble être chiffré
   */
  isEncrypted(text: string): boolean {
    const parts = text.split(':');
    return parts.length === 3 && parts[0]!.length === 32 && parts[1]!.length === 32;
  }
}
