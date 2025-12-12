/**
 * Script pour vérifier et corriger le schéma de la table stores
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSchema() {
  console.log('🔍 Vérification du schéma de la table stores...\n');

  try {
    // Vérifier les colonnes de la table stores
    const columns = await prisma.$queryRawUnsafe<
      Array<{ column_name: string; is_nullable: string; data_type: string }>
    >(
      `SELECT column_name, is_nullable, data_type
       FROM information_schema.columns
       WHERE table_name = 'stores'
       ORDER BY ordinal_position`,
    );

    console.log('📋 Colonnes actuelles de la table stores:');
    columns.forEach((col: { column_name: string; data_type: string; is_nullable: string }) => {
      console.log(
        `  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`,
      );
    });

    // Vérifier si owner_id existe encore
    const hasOwnerId = columns.some(
      (col: { column_name: string }) => col.column_name === 'owner_id',
    );

    if (hasOwnerId) {
      console.log('\n⚠️  La colonne owner_id existe encore ! Suppression...');

      // Supprimer d'abord les policies qui dépendent de owner_id
      await prisma.$executeRawUnsafe('DROP POLICY IF EXISTS "stores_manage_own" ON "stores"');
      await prisma.$executeRawUnsafe('DROP POLICY IF EXISTS "campaigns_manage" ON "campaigns"');

      // Supprimer la colonne
      await prisma.$executeRawUnsafe('ALTER TABLE "stores" DROP COLUMN IF EXISTS "owner_id"');

      console.log('  ✓ Colonne owner_id supprimée');
    } else {
      console.log("\n✅ La colonne owner_id n'existe pas (OK)");
    }

    // Vérifier si brand_id existe
    const hasBrandId = columns.some(
      (col: { column_name: string }) => col.column_name === 'brand_id',
    );

    if (!hasBrandId) {
      console.log("\n⚠️  La colonne brand_id n'existe pas ! Ajout...");
      await prisma.$executeRawUnsafe('ALTER TABLE "stores" ADD COLUMN "brand_id" TEXT NOT NULL');
      console.log('  ✓ Colonne brand_id ajoutée');
    } else {
      console.log('\n✅ La colonne brand_id existe (OK)');
    }

    console.log('\n✅ Schéma corrigé avec succès!');
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    throw error;
  }
}

fixSchema()
  .then(() => {
    console.log('\n🎉 Terminé!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('\n💥 Échec:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
