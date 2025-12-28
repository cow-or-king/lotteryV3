/**
 * Script pour définir manuellement une location Google Business
 * Permet de bypasser l'UI pendant que le quota API se reset
 * Usage: npx tsx scripts/set-google-location-manually.ts
 */

import { prisma } from '../src/infrastructure/database/prisma-client';
import { google } from 'googleapis';
import { decryptToken } from '../src/lib/encryption/token-encryption.service';

async function main() {
  const storeId = 'cmjo7bgch0009125f5rh92gxf';

  console.log('🔍 Fetching Google Business token...');

  const tokenRecord = await prisma.googleBusinessToken.findUnique({
    where: { storeId },
  });

  if (!tokenRecord) {
    console.error('❌ No token found for this store');
    return;
  }

  // Déchiffrer les tokens
  const accessToken = decryptToken(tokenRecord.accessToken);
  const refreshToken = decryptToken(tokenRecord.refreshToken);

  // Créer le client OAuth2
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_BUSINESS_CLIENT_ID,
    process.env.GOOGLE_BUSINESS_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-business/callback`,
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  console.log('✅ OAuth client configured');
  console.log('');
  console.log('🔍 Fetching accounts...');
  console.log('');

  try {
    const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: oauth2Client,
    });

    const accountsResponse = await mybusinessaccountmanagement.accounts.list();
    const accounts = accountsResponse.data.accounts || [];

    console.log(`📋 Found ${accounts.length} account(s)`);

    if (accounts.length === 0) {
      console.error('❌ No accounts found');
      return;
    }

    // Prendre le premier compte
    const account = accounts[0];
    console.log('');
    console.log('✅ Using account:', account.name);
    console.log('');

    // Récupérer les locations
    const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: oauth2Client,
    });

    const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
      parent: account.name!,
    });

    const locations = locationsResponse.data.locations || [];

    console.log(`📍 Found ${locations.length} location(s):`);
    console.log('');

    locations.forEach((location, index) => {
      const locationIdMatch = location.name?.match(/locations\/(.+)$/);
      const locationId = locationIdMatch ? locationIdMatch[1] : location.name;

      console.log(`${index + 1}. ${location.title}`);
      console.log(`   Name: ${location.name}`);
      console.log(`   Location ID: ${locationId}`);
      console.log('');
    });

    if (locations.length === 0) {
      console.error('❌ No locations found');
      return;
    }

    // Sélectionner automatiquement la première location
    const selectedLocation = locations[0];
    const locationIdMatch = selectedLocation.name?.match(/locations\/(.+)$/);
    const locationId = locationIdMatch ? locationIdMatch[1] : selectedLocation.name;

    console.log('✅ Auto-selecting first location:', selectedLocation.title);
    console.log('');

    // Mettre à jour la DB
    await prisma.googleBusinessToken.update({
      where: { storeId },
      data: {
        accountId: account.name!,
        locationId: locationId!,
        locationName: selectedLocation.title!,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Location saved to database!');
    console.log('');
    console.log('Account ID:', account.name);
    console.log('Location ID:', locationId);
    console.log('Location Name:', selectedLocation.title);
  } catch (error) {
    console.error('❌ Error:', error);
    if (error && typeof error === 'object' && 'message' in error) {
      console.error('Message:', (error as Error).message);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => {
    void prisma.$disconnect();
    process.exit();
  });
