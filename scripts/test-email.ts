/**
 * Test Email Sending
 * Script pour tester l'envoi d'emails avec Resend
 * Run with: npx tsx scripts/test-email.ts
 */

import 'dotenv/config';
import { createResendEmailService } from '@/infrastructure/services/resend-email.service';
import { render } from '@react-email/components';
import { WelcomeEmail, PrizeWonEmail } from '@/lib/email-templates';
import React from 'react';

async function testEmailService() {
  console.log('🧪 Testing email service...\n');

  try {
    // Create email service
    const emailService = createResendEmailService();

    // Test 1: Welcome Email
    console.log('📧 Test 1: Sending Welcome Email...');
    const welcomeElement = React.createElement(WelcomeEmail, {
      userName: 'Jean Dupont',
      loginUrl: 'https://reviewlottery.com/login',
    });
    const welcomeHtml = await render(welcomeElement);

    const welcomeResult = await emailService.sendEmail({
      to: {
        email: 'milone.thierry@gmail.com',
      },
      subject: '🎰 Bienvenue sur ReviewLottery!',
      html: welcomeHtml,
    });

    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully!');
      console.log('   Email ID:', welcomeResult.data.id);
    } else {
      console.error('❌ Failed to send welcome email:', welcomeResult.error.message);
    }

    console.log('');

    // Test 2: Prize Won Email
    console.log('📧 Test 2: Sending Prize Won Email...');
    const prizeElement = React.createElement(PrizeWonEmail, {
      userName: 'Marie Martin',
      prizeName: 'Café offert',
      prizeDescription: 'Un café de votre choix (espresso, cappuccino, latte)',
      claimCode: 'WIN-ABC123',
      campaignName: 'Jeu du mois de Décembre',
      storeName: 'Café des Artistes',
      claimUrl: 'https://reviewlottery.com/claim/ABC123',
    });
    const prizeHtml = await render(prizeElement);

    const prizeResult = await emailService.sendEmail({
      to: {
        email: 'milone.thierry@gmail.com',
      },
      subject: '🎉 Félicitations, vous avez gagné!',
      html: prizeHtml,
    });

    if (prizeResult.success) {
      console.log('✅ Prize email sent successfully!');
      console.log('   Email ID:', prizeResult.data.id);
    } else {
      console.error('❌ Failed to send prize email:', prizeResult.error.message);
    }

    console.log('\n🎉 Email tests completed!');
  } catch (error) {
    console.error('❌ Error testing email service:', error);
    process.exit(1);
  }
}

testEmailService().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
