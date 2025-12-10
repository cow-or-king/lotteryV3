/**
 * Script de test pour vérifier l'API Google Places
 * Usage: npx tsx scripts/test-places-api.ts
 */

import { config } from 'dotenv';
config();

import { GooglePlacesService } from '../src/infrastructure/services/google-places.service';

async function main() {
  console.log('🚀 Testing Google Places API\n');

  // 1. Vérifier que l'API key est configurée
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY not found in .env');
    process.exit(1);
  }

  console.log('✅ API Key found:', process.env.GOOGLE_PLACES_API_KEY.substring(0, 20) + '...\n');

  // 2. Créer le service
  const placesService = new GooglePlacesService();

  // 3. Tester la validation de l'API key
  console.log('🔐 Step 1: Validating API Key...');
  const validationResult = await placesService.validateCredentials(
    process.env.GOOGLE_PLACES_API_KEY,
  );

  if (validationResult.success && validationResult.data) {
    console.log('✅ API Key is valid!\n');
  } else {
    console.warn('⚠️  API Key validation failed (may need time to propagate)');
    console.warn('   Continuing anyway to test reviews fetch...\n');
  }

  // 4. Tester avec un Place ID de test (Google HQ Mountain View)
  console.log('📍 Step 2: Fetching reviews for test location...');
  console.log('   Location: Google Headquarters, Mountain View, CA');
  console.log('   Place ID: ChIJj61dQgK6j4AR4GeTYWZsKWw\n');

  const testPlaceId = 'ChIJj61dQgK6j4AR4GeTYWZsKWw';
  const reviewsResult = await placesService.fetchReviews(testPlaceId);

  if (!reviewsResult.success) {
    console.error('❌ Failed to fetch reviews:', reviewsResult.error.message);
    process.exit(1);
  }

  const reviews = reviewsResult.data;
  console.log(`✅ Successfully fetched ${reviews.length} reviews!\n`);

  // 5. Afficher les avis
  if (reviews.length > 0) {
    console.log('📝 Reviews:\n');
    reviews.forEach((review, index) => {
      console.log(`${index + 1}. ${'⭐'.repeat(review.rating)} (${review.rating}/5)`);
      console.log(`   Author: ${review.authorName}`);
      console.log(`   Date: ${review.publishedAt.toLocaleDateString()}`);
      console.log(
        `   Comment: ${review.comment?.substring(0, 100)}${review.comment && review.comment.length > 100 ? '...' : ''}`,
      );
      console.log('');
    });
  }

  console.log('✅ Test completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Find your business Place ID on Google Maps');
  console.log('   2. Update your stores in the database with the Place ID');
  console.log('   3. Use the sync endpoint to fetch real reviews');
  console.log('\n💡 To find your Place ID:');
  console.log('   - Go to https://www.google.com/maps');
  console.log('   - Search for your business');
  console.log('   - Copy the URL, the Place ID starts with "ChIJ..."');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
