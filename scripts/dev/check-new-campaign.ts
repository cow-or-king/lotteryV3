/**
 * Script pour vérifier la nouvelle campagne
 */

import { prisma } from '@/infrastructure/database/prisma-client';

async function checkNewCampaign() {
  const campaignId = 'cmjclrrxz0018eg33kckdzb1c';

  console.log('🔍 Vérification de la campagne:', campaignId);
  console.log('');

  try {
    // Récupérer la campagne
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        conditions: {
          orderBy: { order: 'asc' },
        },
        store: {
          select: {
            name: true,
            googleBusinessUrl: true,
          },
        },
      },
    });

    if (!campaign) {
      console.log('❌ Campagne introuvable');
      return;
    }

    console.log('📋 Campagne:', campaign.name);
    console.log('🏪 Commerce:', campaign.store.name);
    console.log('🔗 URL Google du commerce:', campaign.store.googleBusinessUrl);
    console.log('🔗 URL Google de la campagne:', campaign.googleReviewUrl);
    console.log('');

    console.log('📝 Conditions:', campaign.conditions.length);
    console.log('');

    for (const condition of campaign.conditions) {
      console.log(`  ${condition.order + 1}. ${condition.type}`);
      console.log(`     Title: ${condition.title}`);
      console.log(`     Config:`, condition.config);
      console.log(`     RedirectUrl:`, condition.redirectUrl);
      console.log('');
    }

    // Vérifier les participants
    const participants = await prisma.participant.findMany({
      where: { campaignId },
    });

    console.log('👥 Participants:', participants.length);
    for (const p of participants) {
      console.log(`  - ${p.email}`);
      console.log(`    Condition actuelle: ${p.currentConditionOrder}`);
      console.log(`    A joué: ${p.hasPlayed}`);
      console.log(`    Conditions complétées:`, p.completedConditions);
      console.log('');
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNewCampaign().catch(console.error);
