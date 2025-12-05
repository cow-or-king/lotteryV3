/**
 * User Entity Tests
 * Test-Driven Development (TDD)
 */

import { describe, it, expect } from 'vitest';
import { UserEntity } from '@/core/entities/user.entity';
import { Result } from '@/shared/types/result.type';

describe('UserEntity', () => {
  describe('create', () => {
    it('should create a valid user with correct data', () => {
      // Arrange
      const validUserData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        acceptedTerms: true,
      };

      // Act
      const result = UserEntity.create(validUserData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(validUserData.email);
        expect(result.data.emailVerified).toBe(false);
        expect(result.data.subscription).toBeNull();
        expect(result.data.stores).toHaveLength(0);
      }
    });

    it('should fail with invalid email', () => {
      // Arrange
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'SecurePassword123',
        acceptedTerms: true,
      };

      // Act
      const result = UserEntity.create(invalidEmailData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidUserDataError');
        expect(result.error.message).toContain('Invalid email format');
      }
    });

    it('should fail with short password', () => {
      // Arrange
      const shortPasswordData = {
        email: 'test@example.com',
        password: 'short',
        acceptedTerms: true,
      };

      // Act
      const result = UserEntity.create(shortPasswordData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidUserDataError');
        expect(result.error.message).toContain('Password must be at least 8 characters');
      }
    });

    it('should fail when terms not accepted', () => {
      // Arrange
      const noTermsData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        acceptedTerms: false,
      };

      // Act
      const result = UserEntity.create(noTermsData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.name).toBe('InvalidUserDataError');
        expect(result.error.message).toContain('User must accept terms');
      }
    });
  });

  describe('canCreateStore', () => {
    it('should allow free user to create one store', () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        acceptedTerms: true,
      };
      const userResult = UserEntity.create(userData);

      // Act & Assert
      expect(userResult.success).toBe(true);
      if (userResult.success) {
        expect(userResult.data.canCreateStore()).toBe(true);
      }
    });

    it('should not allow free user with one store to create another', () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        acceptedTerms: true,
      };
      const userResult = UserEntity.create(userData);

      // Act
      expect(userResult.success).toBe(true);
      if (userResult.success) {
        const storeId = 'store_123' as any; // Acceptable in test files
        const updatedUserResult = userResult.data.addStore(storeId);

        // Assert
        expect(updatedUserResult.success).toBe(true);
        if (updatedUserResult.success) {
          expect(updatedUserResult.data.canCreateStore()).toBe(false);
        }
      }
    });
  });

  describe('verifyEmail', () => {
    it('should verify unverified email', () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        acceptedTerms: true,
      };
      const userResult = UserEntity.create(userData);

      // Act
      expect(userResult.success).toBe(true);
      if (userResult.success) {
        const verifiedResult = userResult.data.verifyEmail();

        // Assert
        expect(verifiedResult.success).toBe(true);
        if (verifiedResult.success) {
          expect(verifiedResult.data.emailVerified).toBe(true);
        }
      }
    });

    it('should fail to verify already verified email', () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        acceptedTerms: true,
      };
      const userResult = UserEntity.create(userData);

      // Act
      expect(userResult.success).toBe(true);
      if (userResult.success) {
        const firstVerifyResult = userResult.data.verifyEmail();
        expect(firstVerifyResult.success).toBe(true);

        if (firstVerifyResult.success) {
          const secondVerifyResult = firstVerifyResult.data.verifyEmail();

          // Assert
          expect(secondVerifyResult.success).toBe(false);
          if (!secondVerifyResult.success) {
            expect(secondVerifyResult.error.message).toContain('Email already verified');
          }
        }
      }
    });
  });
});