/**
 * Seed script for Pricing Plans
 * Run with: npx tsx prisma/seeds/pricing-plans.seed.ts
 */

import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function seedPricingPlans() {
  console.log('🌱 Seeding pricing plans...');

  // Delete existing pricing plans
  await prisma.pricingFeature.deleteMany();
  await prisma.pricingPlan.deleteMany();

  // Create Starter Plan
  const starterPlan = await prisma.pricingPlan.create({
    data: {
      name: 'Starter',
      slug: 'starter',
      description: 'Pour les petits commerces qui démarrent',
      monthlyPrice: 29,
      annualPrice: 23,
      currency: 'EUR',
      isActive: true,
      isPopular: false,
      displayOrder: 1,
      ctaText: "Commencer l'essai",
      ctaHref: '/login',
      badgeText: null,
      features: {
        create: [
          { text: '1 commerce', isIncluded: true, isEmphasized: false, displayOrder: 1 },
          {
            text: '100 participations/mois',
            isIncluded: true,
            isEmphasized: false,
            displayOrder: 2,
          },
          { text: 'Réponses IA (50/mois)', isIncluded: true, isEmphasized: false, displayOrder: 3 },
          { text: '2 types de jeux', isIncluded: true, isEmphasized: false, displayOrder: 4 },
          { text: 'QR codes illimités', isIncluded: true, isEmphasized: false, displayOrder: 5 },
          { text: 'Analytics de base', isIncluded: true, isEmphasized: false, displayOrder: 6 },
          { text: 'Support email', isIncluded: true, isEmphasized: false, displayOrder: 7 },
          { text: 'Multi-commerces', isIncluded: false, isEmphasized: false, displayOrder: 8 },
          { text: 'Analytics avancés', isIncluded: false, isEmphasized: false, displayOrder: 9 },
        ],
      },
    },
  });

  // Create Pro Plan
  const proPlan = await prisma.pricingPlan.create({
    data: {
      name: 'Pro',
      slug: 'pro',
      description: 'Pour les commerces en croissance',
      monthlyPrice: 99,
      annualPrice: 79,
      currency: 'EUR',
      isActive: true,
      isPopular: true,
      displayOrder: 2,
      ctaText: "Commencer l'essai",
      ctaHref: '/login',
      badgeText: 'Most Popular',
      features: {
        create: [
          { text: '5 commerces', isIncluded: true, isEmphasized: true, displayOrder: 1 },
          {
            text: '500 participations/mois',
            isIncluded: true,
            isEmphasized: true,
            displayOrder: 2,
          },
          { text: 'Réponses IA illimitées', isIncluded: true, isEmphasized: true, displayOrder: 3 },
          {
            text: 'Tous les jeux disponibles',
            isIncluded: true,
            isEmphasized: true,
            displayOrder: 4,
          },
          { text: 'QR codes illimités', isIncluded: true, isEmphasized: true, displayOrder: 5 },
          { text: 'Analytics avancés', isIncluded: true, isEmphasized: true, displayOrder: 6 },
          { text: 'Multi-commerces', isIncluded: true, isEmphasized: true, displayOrder: 7 },
          { text: 'Support prioritaire', isIncluded: true, isEmphasized: true, displayOrder: 8 },
          { text: 'API access', isIncluded: true, isEmphasized: true, displayOrder: 9 },
        ],
      },
    },
  });

  // Create Enterprise Plan
  const enterprisePlan = await prisma.pricingPlan.create({
    data: {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Pour les grandes enseignes',
      monthlyPrice: null, // Sur devis
      annualPrice: null,
      currency: 'EUR',
      isActive: true,
      isPopular: false,
      displayOrder: 3,
      ctaText: 'Nous contacter',
      ctaHref: '#',
      badgeText: null,
      features: {
        create: [
          { text: 'Commerces illimités', isIncluded: true, isEmphasized: false, displayOrder: 1 },
          {
            text: 'Participations illimitées',
            isIncluded: true,
            isEmphasized: false,
            displayOrder: 2,
          },
          {
            text: 'Réponses IA illimitées',
            isIncluded: true,
            isEmphasized: false,
            displayOrder: 3,
          },
          {
            text: 'Tous les jeux personnalisables',
            isIncluded: true,
            isEmphasized: false,
            displayOrder: 4,
          },
          {
            text: 'White-label disponible',
            isIncluded: true,
            isEmphasized: false,
            displayOrder: 5,
          },
          {
            text: 'Analytics personnalisés',
            isIncluded: true,
            isEmphasized: false,
            displayOrder: 6,
          },
          { text: 'Manager dédié', isIncluded: true, isEmphasized: false, displayOrder: 7 },
          { text: 'Support 24/7', isIncluded: true, isEmphasized: false, displayOrder: 8 },
          { text: 'SLA garanti 99.9%', isIncluded: true, isEmphasized: false, displayOrder: 9 },
        ],
      },
    },
  });

  console.log('✅ Created Starter plan:', starterPlan.name);
  console.log('✅ Created Pro plan:', proPlan.name);
  console.log('✅ Created Enterprise plan:', enterprisePlan.name);
  console.log('🎉 Pricing plans seeded successfully!');
}

seedPricingPlans()
  .catch((error) => {
    console.error('❌ Error seeding pricing plans:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
