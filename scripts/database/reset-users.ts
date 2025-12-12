/**
 * Script pour réinitialiser tous les utilisateurs
 * ATTENTION: Ce script supprime TOUS les utilisateurs et leurs données associées
 * Les utilisateurs pourront se reconnecter et seront automatiquement recréés avec le bon ID Supabase
 */

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function resetUsers() {
  console.log(
    '⚠️  ATTENTION: Ce script va supprimer TOUS les utilisateurs de la base de données\n',
  );

  try {
    // Compter les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`📊 ${userCount} utilisateurs trouvés dans la base de données\n`);

    if (userCount === 0) {
      console.log('✅ Aucun utilisateur à supprimer');
      return;
    }

    console.log('🗑️  Suppression de tous les utilisateurs...');

    // Supprimer tous les utilisateurs (cascade supprimera toutes les données associées)
    const result = await prisma.user.deleteMany({});

    console.log(`\n✅ ${result.count} utilisateurs supprimés avec succès!`);
    console.log(
      '\nℹ️  Les utilisateurs pourront se reconnecter et seront automatiquement recréés avec le bon ID Supabase.',
    );
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    throw error;
  }
}

resetUsers()
  .then(() => {
    console.log('\n🎉 Script terminé!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('\n💥 Échec:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
