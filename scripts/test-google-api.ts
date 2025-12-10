/**
 * Script de test pour vérifier l'API Google My Business
 * Usage: npx tsx scripts/test-google-api.ts
 */

import { config } from 'dotenv';
config(); // Charger les variables d'environnement depuis .env

import { ApiKeyEncryptionService } from '../src/infrastructure/encryption/api-key-encryption.service';
import { GoogleMyBusinessProductionService } from '../src/infrastructure/services/google-my-business-production.service';

async function main() {
  console.log('🚀 Testing Google My Business API\n');

  // Refresh token obtenu via OAuth
  const refreshToken =
    '1//03U3FbdMr1XGACgYIARAAGAMSNwF-L9IrhUUubSDyRPkye9btyLYVmbJrwOa84uVgaqre1D6So19jfQRaZuDMwDrxXREmvjTzsdI';

  // 1. Chiffrer le refresh token
  console.log('📝 Step 1: Encrypting refresh token...');
  const encryptionService = new ApiKeyEncryptionService();
  const encryptResult = encryptionService.encrypt(refreshToken);

  if (!encryptResult.success) {
    console.error('❌ Failed to encrypt token:', encryptResult.error.message);
    process.exit(1);
  }

  const encryptedToken = encryptResult.data;
  console.log('✅ Encrypted token:', encryptedToken.substring(0, 50) + '...\n');

  // 2. Tester la validation des credentials
  console.log('🔐 Step 2: Validating credentials...');
  const googleService = new GoogleMyBusinessProductionService(encryptionService);
  const validationResult = await googleService.validateCredentials(encryptedToken);

  if (validationResult.success) {
    console.log(
      '✅ Credentials are valid!',
      validationResult.data ? '(has accounts)' : '(no accounts found)',
    );
  } else {
    console.log('❌ Credentials validation failed:', validationResult.error.message);
    process.exit(1);
  }

  // 3. Tester la récupération des avis
  console.log('\n📍 Step 3: Fetching reviews...');
  console.log('⚠️  You need to provide a valid Google Place ID');
  console.log('   Example Place ID: ChIJN1t_tDeuEmsRUsoyG83frY4 (Google HQ Sydney)');

  // Exemple avec un Place ID fictif
  const testPlaceId = 'YOUR_PLACE_ID_HERE';

  if (testPlaceId !== 'YOUR_PLACE_ID_HERE') {
    const reviewsResult = await googleService.fetchReviews(testPlaceId, {
      apiKey: encryptedToken,
    });

    if (reviewsResult.success) {
      console.log(`✅ Found ${reviewsResult.data.length} reviews`);
      reviewsResult.data.forEach((review, index) => {
        console.log(`\n  Review ${index + 1}:`);
        console.log(`    Author: ${review.authorName}`);
        console.log(`    Rating: ${'⭐'.repeat(review.rating)}`);
        console.log(`    Comment: ${review.comment?.substring(0, 100)}...`);
      });
    } else {
      console.log('❌ Failed to fetch reviews:', reviewsResult.error.message);
    }
  } else {
    console.log('⏭️  Skipped (no Place ID provided)');
  }

  console.log('\n✅ Test completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Copy the encrypted token above');
  console.log('   2. Store it in your database (stores.googleApiKey)');
  console.log('   3. Use it to fetch reviews via the sync endpoint');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
