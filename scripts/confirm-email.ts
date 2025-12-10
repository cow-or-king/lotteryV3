/**
 * Script pour confirmer l'email d'un utilisateur (DEV ONLY)
 * Usage: npx tsx scripts/confirm-email.ts <email>
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
    console.log('Usage: npx tsx scripts/confirm-email.ts <email>');
    process.exit(1);
  }

  try {
    // 1. Trouver l'utilisateur dans Supabase Auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', listError.message);
      process.exit(1);
    }

    const authUser = authUsers.users.find((u) => u.email === email);

    if (!authUser) {
      console.error(`❌ Utilisateur non trouvé dans Supabase Auth: ${email}`);
      process.exit(1);
    }

    console.log(`🔍 Utilisateur trouvé: ${authUser.id}`);

    // 2. Vérifier si l'email est déjà confirmé
    if (authUser.email_confirmed_at) {
      console.log(
        `✅ Email déjà confirmé le ${new Date(authUser.email_confirmed_at).toLocaleString('fr-FR')}`,
      );
    } else {
      console.log('📧 Email non confirmé, confirmation en cours...');

      // 3. Confirmer l'email via l'API Admin
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        authUser.id,
        {
          email_confirm: true,
        },
      );

      if (updateError) {
        console.error('❌ Erreur lors de la confirmation:', updateError.message);
        process.exit(1);
      }

      console.log('✅ Email confirmé avec succès dans Supabase Auth!');
    }

    // 4. Mettre à jour dans notre base de données (Prisma)
    const prismaUser = await prisma.user.findUnique({
      where: { email },
    });

    if (prismaUser) {
      await prisma.user.update({
        where: { id: prismaUser.id },
        data: { emailVerified: true },
      });
      console.log('✅ Email vérifié mis à jour dans PostgreSQL!');
    } else {
      console.log('⚠️  Utilisateur non trouvé dans PostgreSQL (sera créé au prochain login)');
    }

    console.log("\n🎉 Succès! L'utilisateur peut maintenant se connecter.");
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
