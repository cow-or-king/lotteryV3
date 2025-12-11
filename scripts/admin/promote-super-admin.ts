/**
 * Script pour promouvoir un utilisateur en SUPER_ADMIN
 * Usage: npx tsx scripts/promote-super-admin.ts <email>
 */

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Email requis');
    console.log('Usage: npx tsx scripts/promote-super-admin.ts <email>');
    process.exit(1);
  }

  try {
    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${email}`);
      process.exit(1);
    }

    if (user.role === 'SUPER_ADMIN') {
      console.log(`✅ ${email} est déjà SUPER_ADMIN`);
      process.exit(0);
    }

    // Promouvoir en SUPER_ADMIN
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'SUPER_ADMIN' },
    });

    console.log(`✅ ${email} promu en SUPER_ADMIN`);
    console.log(`🔑 Accès à /admin/ai-config maintenant disponible`);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
