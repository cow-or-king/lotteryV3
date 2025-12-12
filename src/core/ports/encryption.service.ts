/**
 * Encryption Service Port
 * Interface pour abstraire le service de chiffrement
 * Architecture hexagonale: Port dans le core, Adapter dans l'infrastructure
 */

import { Result } from '@/lib/types/result.type';

/**
 * Service de chiffrement pour les données sensibles (clés API, etc.)
 * Implémentation dans infrastructure/encryption/
 */
export interface IEncryptionService {
  /**
   * Chiffre une valeur
   * @param value Valeur à chiffrer
   * @returns Result contenant la valeur chiffrée ou une erreur
   */
  encrypt(value: string): Result<string, Error>;

  /**
   * Déchiffre une valeur
   * @param encryptedValue Valeur chiffrée
   * @returns Result contenant la valeur déchiffrée ou une erreur
   */
  decrypt(encryptedValue: string): Result<string, Error>;
}
