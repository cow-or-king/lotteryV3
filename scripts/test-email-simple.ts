/**
 * Simple Email Test
 * Test direct avec Resend sans React Email
 */

import 'dotenv/config';
import { Resend } from 'resend';

async function testSimpleEmail() {
  console.log('🧪 Testing simple email...\n');
  console.log('API Key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['milone.thierry@gmail.com'],
      subject: 'Test Email from ReviewLottery',
      html: '<p>This is a test email from ReviewLottery!</p>',
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('   Email ID:', data?.id);
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

testSimpleEmail();
