/**
 * Script pour exécuter une migration SQL directement sur Supabase
 * Usage: npx tsx scripts/run-migration.ts scripts/remove-owner-id-from-stores.sql
 */

import { readFileSync } from 'fs';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function runMigration(sqlFilePath: string) {
  try {
    console.log(`📝 Lecture du fichier SQL: ${sqlFilePath}`);
    const sql = readFileSync(sqlFilePath, 'utf-8');

    console.log('🔄 Exécution de la migration...');
    console.log(sql);

    // Exécuter le SQL
    await prisma.$executeRawUnsafe(sql);

    console.log('✅ Migration exécutée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

const sqlFilePath = process.argv[2];
if (!sqlFilePath) {
  console.error('Usage: npx tsx scripts/run-migration.ts <path-to-sql-file>');
  process.exit(1);
}

runMigration(sqlFilePath);
