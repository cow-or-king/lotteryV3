/**
 * ClaimCode Value Object
 * Code unique pour réclamer un prix
 */

import { Result } from '@/shared/types/result.type';
import { ClaimCode as ClaimCodeType } from '@/shared/types/branded.type';

export class InvalidClaimCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidClaimCodeError';
  }
}

export class ClaimCode {
  private readonly value: string;

  private constructor(code: string) {
    this.value = code.toUpperCase();
  }

  /**
   * Crée un ClaimCode à partir d'une string existante
   */
  static create(code: string): Result<ClaimCode, InvalidClaimCodeError> {
    const normalized = code.trim().toUpperCase();

    if (!ClaimCode.isValid(normalized)) {
      return Result.fail(new InvalidClaimCodeError(`Invalid claim code format: ${code}`));
    }

    return Result.ok(new ClaimCode(normalized));
  }

  /**
   * Génère un nouveau ClaimCode unique
   * Format: XXXX-XXXX-XXXX (12 caractères alphanumériques)
   */
  static generate(): ClaimCode {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 3;
    const segmentLength = 4;

    const code = Array.from({ length: segments }, () =>
      Array.from({ length: segmentLength }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length)),
      ).join(''),
    ).join('-');

    return new ClaimCode(code);
  }

  /**
   * Valide le format d'un claim code
   * Format attendu: XXXX-XXXX-XXXX
   */
  static isValid(code: string): boolean {
    const regex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return regex.test(code);
  }

  getValue(): string {
    return this.value;
  }

  toBranded(): ClaimCodeType {
    return this.value as ClaimCodeType;
  }

  /**
   * Format pour affichage utilisateur
   */
  format(): string {
    return this.value;
  }

  /**
   * Format masqué pour affichage partiel
   * Ex: XXXX-****-XXXX
   */
  formatMasked(): string {
    const parts = this.value.split('-');
    if (parts.length !== 3) return this.value;

    return `${parts[0]}-****-${parts[2]}`;
  }

  equals(other: ClaimCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
