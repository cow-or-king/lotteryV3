/**
 * Register User Use Case
 * Gère l'inscription d'un nouvel utilisateur
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { UserId } from '@/shared/types/branded.type';
import { Email } from '@/core/value-objects/email.vo';
import { UserEntity } from '@/core/entities/user.entity';
import { SubscriptionEntity } from '@/core/entities/subscription.entity';
import { IUserRepository } from '@/core/repositories/user.repository.interface';
import { ISubscriptionRepository } from '@/core/repositories/subscription.repository.interface';

// DTO pour l'input
export interface RegisterUserInput {
  readonly email: string;
  readonly password: string;
  readonly name?: string;
  readonly avatarUrl?: string;
}

// DTO pour l'output
export interface RegisterUserOutput {
  readonly userId: UserId;
  readonly email: string;
  readonly name: string | null;
  readonly subscriptionPlan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
}

// Domain Errors
export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Email ${email} already exists`);
    this.name = 'EmailAlreadyExistsError';
  }
}

export class RegistrationFailedError extends Error {
  constructor(reason: string) {
    super(`Registration failed: ${reason}`);
    this.name = 'RegistrationFailedError';
  }
}

/**
 * Use Case: Register User
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly passwordHasher: {
      hash(password: string): Promise<string>;
    },
  ) {}

  async execute(input: RegisterUserInput): Promise<Result<RegisterUserOutput>> {
    // 1. Valider et créer l'email
    const emailResult = Email.create(input.email);
    if (!emailResult.success) {
      return Result.fail(emailResult.error);
    }

    // 2. Vérifier que l'email n'existe pas déjà
    const emailExists = await this.userRepository.emailExists(emailResult.data);
    if (emailExists) {
      return Result.fail(new EmailAlreadyExistsError(input.email));
    }

    // 3. Hasher le mot de passe
    const hashedPassword = await this.passwordHasher.hash(input.password);

    // 4. Créer l'entité User
    const userResult = UserEntity.create({
      email: input.email,
      hashedPassword,
      name: input.name,
      avatarUrl: input.avatarUrl,
    });

    if (!userResult.success) {
      return Result.fail(userResult.error);
    }

    const user = userResult.data;

    // 5. Transaction: Sauvegarder l'utilisateur et créer l'abonnement FREE
    try {
      // Sauvegarder l'utilisateur
      const saveUserResult = await this.userRepository.save(user);
      if (!saveUserResult.success) {
        return Result.fail(new RegistrationFailedError('Failed to save user'));
      }

      // Créer l'abonnement FREE
      const subscriptionResult = SubscriptionEntity.createFree(user.id);
      if (!subscriptionResult.success) {
        return Result.fail(new RegistrationFailedError('Failed to create subscription'));
      }

      const saveSubscriptionResult = await this.subscriptionRepository.save(
        subscriptionResult.data,
      );
      if (!saveSubscriptionResult.success) {
        return Result.fail(new RegistrationFailedError('Failed to save subscription'));
      }

      // 6. Retourner le résultat
      return Result.ok({
        userId: user.id,
        email: user.email.value,
        name: user.name,
        subscriptionPlan: 'FREE',
      });
    } catch (error) {
      return Result.fail(
        new RegistrationFailedError(error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }
}
