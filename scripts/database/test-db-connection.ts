/**
 * Script de test de connexion à la base de données
 * Vérifie que la base de données est accessible et les tables créées
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔄 Test de connexion à Supabase...\n');

  try {
    // Test de connexion basique
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');

    // Vérifier les tables
    console.log('\n📊 Vérification des tables:\n');

    const tables = [
      'users',
      'subscriptions',
      'stores',
      'campaigns',
      'prizes',
      'participants',
      'winners',
      'reviews',
    ];

    for (const table of tables) {
      try {
        // @ts-ignore - On accède dynamiquement aux tables
        const count = await prisma[table].count();
        console.log(`  ✅ Table ${table.padEnd(15)} : ${count} enregistrements`);
      } catch (error) {
        console.log(`  ❌ Table ${table.padEnd(15)} : Non trouvée`);
      }
    }

    // Créer un utilisateur de test
    console.log("\n🧪 Test d'insertion (user de test):");

    const testUser = await prisma.user.create({
      data: {
        id: `user_test_${Date.now()}`,
        email: `test${Date.now()}@reviewlottery.com`,
        emailVerified: true,
        hashedPassword: 'test_hash',
        name: 'Test User',
      },
    });

    console.log(`  ✅ User créé: ${testUser.email}`);

    // Créer une subscription pour cet user
    const testSubscription = await prisma.subscription.create({
      data: {
        id: `sub_test_${Date.now()}`,
        userId: testUser.id,
        plan: 'FREE',
        status: 'ACTIVE',
        storesLimit: 1,
        campaignsLimit: 1,
      },
    });

    console.log(`  ✅ Subscription créée: ${testSubscription.plan}`);

    // Nettoyer les données de test
    await prisma.subscription.delete({ where: { id: testSubscription.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('  ✅ Données de test nettoyées');

    console.log('\n🎉 Tous les tests sont passés avec succès!');
    console.log('📍 Base de données Supabase opérationnelle\n');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    console.error('\nVérifiez:');
    console.error('1. Que le script SQL a été exécuté dans Supabase');
    console.error("2. Que les variables d'environnement sont correctes");
    console.error('3. Que votre IP est autorisée dans Supabase');
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
testConnection();
