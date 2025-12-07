/**
 * Prisma Seed Script
 * Initialise les données par défaut de la base de données
 * Usage: npx prisma db seed
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // =====================
  // PLAN LIMITS (Configuration des limites par plan)
  // =====================
  console.log('📊 Création des limites de plans...');

  const planLimits = [
    {
      plan: 'FREE',
      maxBrands: 1,
      maxStoresPerBrand: 1,
      maxPrizeTemplates: 3,
      maxPrizeSets: 1,
      maxCampaigns: 1,
      maxParticipants: 100,
      customBranding: false,
      advancedAnalytics: false,
      apiAccess: false,
      prioritySupport: false,
      priceMonthly: 0,
      priceYearly: 0,
      description: 'Plan gratuit pour démarrer avec ReviewLottery',
    },
    {
      plan: 'STARTER',
      maxBrands: 3,
      maxStoresPerBrand: 10,
      maxPrizeTemplates: 10,
      maxPrizeSets: 5,
      maxCampaigns: 5,
      maxParticipants: 1000,
      customBranding: true,
      advancedAnalytics: false,
      apiAccess: false,
      prioritySupport: false,
      priceMonthly: 29.99,
      priceYearly: 299.99,
      description: 'Plan pour petites entreprises et commerces de proximité',
    },
    {
      plan: 'PRO',
      maxBrands: 999,
      maxStoresPerBrand: 999,
      maxPrizeTemplates: 999,
      maxPrizeSets: 999,
      maxCampaigns: 999,
      maxParticipants: 999999,
      customBranding: true,
      advancedAnalytics: true,
      apiAccess: true,
      prioritySupport: true,
      priceMonthly: 99.99,
      priceYearly: 999.99,
      description: 'Plan illimité pour grandes entreprises et franchises',
    },
  ];

  for (const limit of planLimits) {
    await prisma.planLimits.upsert({
      where: { plan: limit.plan },
      update: limit,
      create: limit,
    });
    console.log(`  ✅ Plan ${limit.plan} créé/mis à jour`);
  }

  console.log('✅ Seed terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
