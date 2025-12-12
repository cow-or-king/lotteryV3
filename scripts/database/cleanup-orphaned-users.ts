/**
 * Script pour nettoyer les utilisateurs orphelins
 * Supprime les utilisateurs de la DB dont l'ID ne correspond pas à un utilisateur Supabase Auth
 * Cela permettra au middleware de les recréer avec le bon ID Supabase
 */

import { PrismaClient } from '@/generated/prisma';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function cleanupOrphanedUsers() {
  console.log('🔍 Recherche des utilisateurs orphelins...\n');

  try {
    // Créer un client Supabase Admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Récupérer tous les utilisateurs de Supabase Auth
    const { data: supabaseUsers, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs Supabase:', error);
      return;
    }

    console.log(`📊 ${supabaseUsers?.users.length ?? 0} utilisateurs trouvés dans Supabase Auth`);

    // Créer un Set des IDs Supabase valides
    const validSupabaseIds = new Set(supabaseUsers?.users.map((u) => u.id) ?? []);

    // Récupérer tous les utilisateurs de notre DB
    const dbUsers = await prisma.user.findMany({
      select: { id: true, email: true },
    });

    console.log(`📊 ${dbUsers.length} utilisateurs trouvés dans la base de données\n`);

    // Trouver les utilisateurs orphelins (ID dans DB qui n'existe pas dans Supabase)
    const orphanedUsers = dbUsers.filter((u) => !validSupabaseIds.has(u.id));

    if (orphanedUsers.length === 0) {
      console.log('✅ Aucun utilisateur orphelin trouvé!');
      return;
    }

    console.log(`⚠️  ${orphanedUsers.length} utilisateurs orphelins trouvés:`);
    orphanedUsers.forEach((u) => {
      console.log(`  - ${u.email} (ID: ${u.id})`);
    });

    console.log('\n🗑️  Suppression des utilisateurs orphelins...');

    // Supprimer les utilisateurs orphelins
    for (const user of orphanedUsers) {
      try {
        // Les subscriptions, brands, stores, etc. seront supprimés en cascade
        await prisma.user.delete({
          where: { id: user.id },
        });
        console.log(`  ✓ Supprimé: ${user.email}`);
      } catch (err) {
        console.error(`  ✗ Erreur lors de la suppression de ${user.email}:`, err);
      }
    }

    console.log('\n✅ Nettoyage terminé!');
    console.log(
      '\nℹ️  Les utilisateurs pourront se reconnecter et seront automatiquement recréés avec le bon ID Supabase.',
    );
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    throw error;
  }
}

cleanupOrphanedUsers()
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
