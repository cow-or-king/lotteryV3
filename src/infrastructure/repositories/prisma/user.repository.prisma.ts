/**
 * User Repository Prisma Implementation
 * Implémentation concrète avec Prisma
 * IMPORTANT: Utilise le Result Pattern pour toutes les opérations
 */

import { PrismaClient } from '@/generated/prisma';
import { Result } from '@/lib/types/result.type';
import { UserId, Email as EmailBrand } from '@/lib/types/branded.type';
import { Email } from '@/core/value-objects/email.vo';
import { UserEntity, type UserRole } from '@/core/entities/user.entity';
import { IUserRepository } from '@/core/repositories/user.repository.interface';

export class UserRepositoryPrisma implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UserId): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return null;
      }

      return this.toDomainEntity(user);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async findByEmail(email: Email): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.getValue() },
      });

      if (!user) {
        return null;
      }

      return this.toDomainEntity(user);
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async emailExists(email: Email): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { email: email.getValue() },
      });

      return count > 0;
    } catch (error) {
      console.error('Error checking if email exists:', error);
      return false;
    }
  }

  async save(user: UserEntity): Promise<Result<void>> {
    try {
      const data = this.toPersistence(user);

      await this.prisma.user.upsert({
        where: { id: user.id },
        create: data,
        update: {
          email: data.email,
          emailVerified: data.emailVerified,
          hashedPassword: data.hashedPassword,
          name: data.name,
          avatarUrl: data.avatarUrl,
          role: data.role,
          updatedAt: new Date(),
        },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new Error(
          `Failed to save user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  async delete(id: UserId): Promise<Result<void>> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        new Error(
          `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  async countUserStores(userId: UserId): Promise<number> {
    try {
      return await this.prisma.store.count({
        where: {
          brand: {
            ownerId: userId,
          },
        },
      });
    } catch (error) {
      console.error('Error counting user stores:', error);
      return 0;
    }
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'email';
    order?: 'asc' | 'desc';
  }): Promise<UserEntity[]> {
    try {
      const users = await this.prisma.user.findMany({
        take: options?.limit,
        skip: options?.offset,
        orderBy: options?.orderBy ? { [options.orderBy]: options.order ?? 'asc' } : undefined,
      });

      return users.map((user) => this.toDomainEntity(user));
    } catch (error) {
      console.error('Error finding all users:', error);
      return [];
    }
  }

  // Private helpers
  private toDomainEntity(data: {
    id: string;
    email: string;
    emailVerified: boolean;
    hashedPassword: string | null;
    name: string | null;
    avatarUrl: string | null;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return UserEntity.fromPersistence({
      id: data.id as UserId,
      email: data.email as EmailBrand,
      emailVerified: data.emailVerified,
      hashedPassword: data.hashedPassword,
      name: data.name,
      avatarUrl: data.avatarUrl,
      role: (data.role || 'ADMIN') as UserRole,
      subscription: null, // TODO: Load subscription from DB
      stores: [], // TODO: Load stores from DB
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private toPersistence(entity: UserEntity) {
    const data = entity.toPersistence();
    return {
      id: data.id,
      email: data.email, // email est déjà une string (branded type)
      emailVerified: data.emailVerified,
      hashedPassword: data.hashedPassword,
      name: data.name,
      avatarUrl: data.avatarUrl,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
