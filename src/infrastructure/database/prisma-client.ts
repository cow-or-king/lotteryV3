/**
 * Prisma Client Singleton
 * Gère une instance unique de Prisma Client
 * IMPORTANT: Évite les multiples connexions en développement
 */

import { PrismaClient } from '@/generated/prisma';

declare global {
  // Nécessaire pour le hot-reload en dev

  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Réutilise le client en dev, crée un nouveau en prod
const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };
