/**
 * ApiKeyEncryptionService Tests
 * Tests du service de chiffrement des API keys Google
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiKeyEncryptionService } from '@/infrastructure/encryption/api-key-encryption.service';

describe('ApiKeyEncryptionService', () => {
  let encryptionService: ApiKeyEncryptionService;
  const validSecretKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars

  beforeEach(() => {
    // Set up environment variable
    process.env.ENCRYPTION_SECRET_KEY = validSecretKey;
    encryptionService = new ApiKeyEncryptionService();
  });

  describe('Constructor', () => {
    it('should throw error if ENCRYPTION_SECRET_KEY is not set', () => {
      delete process.env.ENCRYPTION_SECRET_KEY;

      expect(() => {
        new ApiKeyEncryptionService();
      }).toThrow('ENCRYPTION_SECRET_KEY must be 64 hex characters');
    });

    it('should throw error if ENCRYPTION_SECRET_KEY is not 64 characters', () => {
      process.env.ENCRYPTION_SECRET_KEY = 'tooshort';

      expect(() => {
        new ApiKeyEncryptionService();
      }).toThrow('ENCRYPTION_SECRET_KEY must be 64 hex characters');
    });

    it('should initialize successfully with valid secret key', () => {
      process.env.ENCRYPTION_SECRET_KEY = validSecretKey;

      expect(() => {
        new ApiKeyEncryptionService();
      }).not.toThrow();
    });
  });

  describe('encrypt()', () => {
    it('should encrypt a plain text API key successfully', () => {
      const plainText = 'AIzaSyDemoKey123456789';

      const result = encryptionService.encrypt(plainText);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(typeof result.data).toBe('string');
        expect(result.data).not.toBe(plainText);
      }
    });

    it('should return encrypted data in format iv:authTag:encryptedData', () => {
      const plainText = 'AIzaSyDemoKey123456789';

      const result = encryptionService.encrypt(plainText);

      expect(result.success).toBe(true);
      if (result.success) {
        const parts = result.data.split(':');
        expect(parts).toHaveLength(3);
        expect(parts[0]).toHaveLength(32); // IV in hex (16 bytes = 32 hex chars)
        expect(parts[1]).toHaveLength(32); // Auth tag in hex (16 bytes = 32 hex chars)
        expect(parts[2]).toBeDefined(); // Encrypted data
      }
    });

    it('should produce different encrypted outputs for same input (due to random IV)', () => {
      const plainText = 'AIzaSyDemoKey123456789';

      const result1 = encryptionService.encrypt(plainText);
      const result2 = encryptionService.encrypt(plainText);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      if (result1.success && result2.success) {
        expect(result1.data).not.toBe(result2.data);
      }
    });

    it('should handle empty string', () => {
      const result = encryptionService.encrypt('');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
      }
    });

    it('should handle very long strings', () => {
      const longString = 'A'.repeat(10000);

      const result = encryptionService.encrypt(longString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
      }
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

      const result = encryptionService.encrypt(specialChars);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
      }
    });

    it('should handle Unicode characters', () => {
      const unicode = 'Hello 世界 🌍';

      const result = encryptionService.encrypt(unicode);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
      }
    });
  });

  describe('decrypt()', () => {
    it('should decrypt an encrypted text successfully', () => {
      const plainText = 'AIzaSyDemoKey123456789';
      const encryptResult = encryptionService.encrypt(plainText);

      expect(encryptResult.success).toBe(true);
      if (encryptResult.success) {
        const decryptResult = encryptionService.decrypt(encryptResult.data);

        expect(decryptResult.success).toBe(true);
        if (decryptResult.success) {
          expect(decryptResult.data).toBe(plainText);
        }
      }
    });

    it('should handle decryption of empty string encryption', () => {
      const plainText = '';
      const encryptResult = encryptionService.encrypt(plainText);

      expect(encryptResult.success).toBe(true);
      if (encryptResult.success) {
        const decryptResult = encryptionService.decrypt(encryptResult.data);

        expect(decryptResult.success).toBe(true);
        if (decryptResult.success) {
          expect(decryptResult.data).toBe(plainText);
        }
      }
    });

    it('should handle decryption of long string encryption', () => {
      const plainText = 'A'.repeat(10000);
      const encryptResult = encryptionService.encrypt(plainText);

      expect(encryptResult.success).toBe(true);
      if (encryptResult.success) {
        const decryptResult = encryptionService.decrypt(encryptResult.data);

        expect(decryptResult.success).toBe(true);
        if (decryptResult.success) {
          expect(decryptResult.data).toBe(plainText);
        }
      }
    });

    it('should handle decryption of special characters', () => {
      const plainText = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encryptResult = encryptionService.encrypt(plainText);

      expect(encryptResult.success).toBe(true);
      if (encryptResult.success) {
        const decryptResult = encryptionService.decrypt(encryptResult.data);

        expect(decryptResult.success).toBe(true);
        if (decryptResult.success) {
          expect(decryptResult.data).toBe(plainText);
        }
      }
    });

    it('should handle decryption of Unicode characters', () => {
      const plainText = 'Hello 世界 🌍';
      const encryptResult = encryptionService.encrypt(plainText);

      expect(encryptResult.success).toBe(true);
      if (encryptResult.success) {
        const decryptResult = encryptionService.decrypt(encryptResult.data);

        expect(decryptResult.success).toBe(true);
        if (decryptResult.success) {
          expect(decryptResult.data).toBe(plainText);
        }
      }
    });

    it('should fail with invalid format (missing parts)', () => {
      const invalidFormat = 'invalid:format';

      const result = encryptionService.decrypt(invalidFormat);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid encrypted format');
      }
    });

    it('should fail with invalid format (too many parts)', () => {
      const invalidFormat = 'part1:part2:part3:part4';

      const result = encryptionService.decrypt(invalidFormat);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid encrypted format');
      }
    });

    it('should fail with tampered encrypted data', () => {
      const plainText = 'AIzaSyDemoKey123456789';
      const encryptResult = encryptionService.encrypt(plainText);

      expect(encryptResult.success).toBe(true);
      if (encryptResult.success) {
        // Tamper with the encrypted data
        const parts = encryptResult.data.split(':');
        parts[2] = parts[2].substring(0, parts[2].length - 2) + 'XX';
        const tamperedData = parts.join(':');

        const decryptResult = encryptionService.decrypt(tamperedData);

        expect(decryptResult.success).toBe(false);
        if (!decryptResult.success) {
          expect(decryptResult.error.message).toBe('Decryption failed');
        }
      }
    });

    it('should fail with tampered IV', () => {
      const plainText = 'AIzaSyDemoKey123456789';
      const encryptResult = encryptionService.encrypt(plainText);

      expect(encryptResult.success).toBe(true);
      if (encryptResult.success) {
        // Tamper with the IV
        const parts = encryptResult.data.split(':');
        parts[0] = parts[0].substring(0, parts[0].length - 2) + 'XX';
        const tamperedData = parts.join(':');

        const decryptResult = encryptionService.decrypt(tamperedData);

        expect(decryptResult.success).toBe(false);
        if (!decryptResult.success) {
          expect(decryptResult.error.message).toBe('Decryption failed');
        }
      }
    });

    it('should fail with tampered auth tag', () => {
      const plainText = 'AIzaSyDemoKey123456789';
      const encryptResult = encryptionService.encrypt(plainText);

      expect(encryptResult.success).toBe(true);
      if (encryptResult.success) {
        // Tamper with the auth tag - flip first byte completely
        const parts = encryptResult.data.split(':');
        const authTag = parts[1];
        const flipped = (parseInt(authTag.substring(0, 2), 16) ^ 0xff)
          .toString(16)
          .padStart(2, '0');
        parts[1] = flipped + authTag.substring(2);
        const tamperedData = parts.join(':');

        const decryptResult = encryptionService.decrypt(tamperedData);

        expect(decryptResult.success).toBe(false);
        if (!decryptResult.success) {
          expect(decryptResult.error.message).toBe('Decryption failed');
        }
      }
    });

    it('should fail with completely invalid encrypted text', () => {
      const result = encryptionService.decrypt('completely-invalid-data');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid encrypted format');
      }
    });

    it('should fail with empty string', () => {
      const result = encryptionService.decrypt('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Invalid encrypted format');
      }
    });
  });

  describe('Encryption/Decryption Round Trip', () => {
    it('should successfully encrypt and decrypt multiple API keys', () => {
      const apiKeys = [
        'AIzaSyDemoKey123456789',
        'AIzaSyAnotherKey987654321',
        'sk-proj-abcdef123456',
        'gho_1234567890abcdefghij',
      ];

      apiKeys.forEach((apiKey) => {
        const encryptResult = encryptionService.encrypt(apiKey);
        expect(encryptResult.success).toBe(true);

        if (encryptResult.success) {
          const decryptResult = encryptionService.decrypt(encryptResult.data);
          expect(decryptResult.success).toBe(true);

          if (decryptResult.success) {
            expect(decryptResult.data).toBe(apiKey);
          }
        }
      });
    });
  });

  describe('Security Properties', () => {
    it('should use AES-256-GCM algorithm (authenticated encryption)', () => {
      const plainText = 'AIzaSyDemoKey123456789';
      const encryptResult = encryptionService.encrypt(plainText);

      expect(encryptResult.success).toBe(true);
      if (encryptResult.success) {
        // Verify auth tag is present (GCM provides authentication)
        const parts = encryptResult.data.split(':');
        expect(parts[1]).toHaveLength(32); // Auth tag should be 16 bytes = 32 hex chars
      }
    });

    it('should use unique IV for each encryption', () => {
      const plainText = 'AIzaSyDemoKey123456789';
      const ivs = new Set<string>();

      // Encrypt same text 100 times
      for (let i = 0; i < 100; i++) {
        const result = encryptionService.encrypt(plainText);
        if (result.success) {
          const iv = result.data.split(':')[0];
          ivs.add(iv);
        }
      }

      // All IVs should be unique
      expect(ivs.size).toBe(100);
    });
  });
});
