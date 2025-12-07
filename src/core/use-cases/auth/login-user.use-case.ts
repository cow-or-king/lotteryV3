/**
 * Login User Use Case
 * Gère l'authentification d'un utilisateur
 * IMPORTANT: Pure business logic, pas de dépendance au framework
 */

import { Result } from '@/shared/types/result.type';
import { UserId } from '@/shared/types/branded.type';
import { Email } from '@/core/value-objects/email.vo';
import { IUserRepository } from '@/core/repositories/user.repository.interface';
import { ISubscriptionRepository } from '@/core/repositories/subscription.repository.interface';

// DTO pour l'input
export interface LoginUserInput {
  readonly email: string;
  readonly password: string;
}

// DTO pour l'output
export interface LoginUserOutput {
  readonly userId: UserId;
  readonly email: string;
  readonly name: string | null;
  readonly avatarUrl: string | null;
  readonly emailVerified: boolean;
  readonly subscriptionPlan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  readonly subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
}

// Domain Errors
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountSuspendedError extends Error {
  constructor() {
    super('Account has been suspended');
    this.name = 'AccountSuspendedError';
  }
}

export class EmailNotVerifiedError extends Error {
  constructor() {
    super('Email address not verified');
    this.name = 'EmailNotVerifiedError';
  }
}

/**
 * Use Case: Login User
 */
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly passwordVerifier: {
      verify(password: string, hash: string): Promise<boolean>;
    },
  ) {}

  async execute(input: LoginUserInput): Promise<Result<LoginUserOutput>> {
    // 1. Valider l'email
    const emailResult = Email.create(input.email);
    if (!emailResult.success) {
      return Result.fail(new InvalidCredentialsError());
    }

    // 2. Trouver l'utilisateur
    const user = await this.userRepository.findByEmail(emailResult.data);
    if (!user) {
      return Result.fail(new InvalidCredentialsError());
    }

    // 3. Vérifier le mot de passe
    const isPasswordValid = await this.passwordVerifier.verify(input.password, user.hashedPassword);

    if (!isPasswordValid) {
      return Result.fail(new InvalidCredentialsError());
    }

    // 4. Vérifier que l'email est vérifié (optionnel selon la configuration)
    // Pour le développement, on peut désactiver cette vérification
    const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
    if (requireEmailVerification && !user.emailVerified) {
      return Result.fail(new EmailNotVerifiedError());
    }

    // 5. Récupérer l'abonnement
    const subscription = await this.subscriptionRepository.findByUser(user.id);
    if (!subscription) {
      return Result.fail(new Error('No subscription found for user'));
    }

    // 6. Vérifier que l'abonnement n'est pas suspendu
    if (subscription.status === 'SUSPENDED') {
      return Result.fail(new AccountSuspendedError());
    }

    // 7. Retourner les informations de l'utilisateur
    return Result.ok({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      subscriptionPlan: subscription.plan,
      subscriptionStatus: subscription.status,
    });
  }
}
