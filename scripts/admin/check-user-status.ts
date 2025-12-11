/**
 * Script de diagnostic pour vérifier le statut d'un utilisateur
 * Usage: npx tsx scripts/check-user-status.ts <email>
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@/generated/prisma';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Email requis');
    console.log('Usage: npx tsx scripts/check-user-status.ts <email>');
    process.exit(1);
  }

  console.log(`\n🔍 Diagnostic pour: ${email}\n`);

  try {
    // 1. Vérifier dans Supabase Auth
    console.log('📊 1. SUPABASE AUTH');
    console.log('─'.repeat(50));

    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Erreur Supabase:', authError.message);
    } else {
      const authUser = authUsers.users.find((u) => u.email === email);

      if (authUser) {
        console.log('✅ Utilisateur trouvé dans Supabase Auth');
        console.log(`   ID: ${authUser.id}`);
        console.log(`   Email: ${authUser.email}`);
        console.log(`   Email confirmé: ${authUser.email_confirmed_at ? '✅ OUI' : '❌ NON'}`);
        console.log(`   Créé le: ${new Date(authUser.created_at).toLocaleString('fr-FR')}`);
        console.log(
          `   Dernière connexion: ${authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString('fr-FR') : 'Jamais'}`,
        );

        if (!authUser.email_confirmed_at) {
          console.log("\n⚠️  EMAIL NON CONFIRMÉ - C'est probablement la cause du problème !");
        }
      } else {
        console.log('❌ Utilisateur NON trouvé dans Supabase Auth');
      }
    }

    // 2. Vérifier dans PostgreSQL (Prisma)
    console.log('\n📊 2. POSTGRESQL (via Prisma)');
    console.log('─'.repeat(50));

    const prismaUser = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
      },
    });

    if (prismaUser) {
      console.log('✅ Utilisateur trouvé dans PostgreSQL');
      console.log(`   ID: ${prismaUser.id}`);
      console.log(`   Email: ${prismaUser.email}`);
      console.log(`   Email vérifié: ${prismaUser.emailVerified ? '✅ OUI' : '❌ NON'}`);
      console.log(`   Nom: ${prismaUser.name ?? 'Non défini'}`);
      console.log(`   Rôle: ${prismaUser.role}${prismaUser.role === 'SUPER_ADMIN' ? ' 👑' : ''}`);
      console.log(`   Créé le: ${prismaUser.createdAt.toLocaleString('fr-FR')}`);

      if (prismaUser.subscription) {
        console.log(`   Plan: ${prismaUser.subscription.plan}`);
        console.log(`   Statut: ${prismaUser.subscription.status}`);
      }
    } else {
      console.log('❌ Utilisateur NON trouvé dans PostgreSQL');
      console.log('   → Le sync Supabase → Prisma a probablement échoué');
    }

    // 3. Recommandations
    console.log('\n💡 RECOMMANDATIONS');
    console.log('─'.repeat(50));

    if (authUsers && authUsers.users.find((u) => u.email === email)) {
      const authUser = authUsers.users.find((u) => u.email === email)!;

      if (!authUser.email_confirmed_at) {
        console.log("1. ⚠️  Confirmer l'email:");
        console.log('   npx tsx scripts/confirm-email.ts ' + email);
      }

      if (!prismaUser) {
        console.log('2. 🔄 Synchroniser avec la base de données:');
        console.log("   → L'utilisateur sera créé automatiquement au prochain login");
      }

      if (authUser.email_confirmed_at && prismaUser) {
        console.log("✅ Tout semble OK ! L'utilisateur devrait pouvoir se connecter.");
      }
    } else {
      console.log("❌ L'utilisateur n'existe pas dans Supabase Auth");
      console.log('   → Créer un nouveau compte sur /register');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
