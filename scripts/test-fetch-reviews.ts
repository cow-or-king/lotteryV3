/**
 * Script de test pour récupérer les avis Google Business
 * Usage: npx tsx scripts/test-fetch-reviews.ts
 */

import { googleBusinessOAuthService } from '../src/infrastructure/services/google-business-oauth.service';

async function main() {
  const storeId = 'cmjo7bgch0009125f5rh92gxf'; // Ton store ID

  console.log('🔍 Fetching Google Business reviews...');
  console.log('Store ID:', storeId);
  console.log('');

  const result = await googleBusinessOAuthService.fetchReviews(storeId);

  if (!result.success) {
    console.error('❌ Error:', result.error.message);
    return;
  }

  console.log('✅ Success! Found', result.data.length, 'reviews');
  console.log('');

  result.data.forEach((review, index) => {
    console.log(`📝 Review ${index + 1}:`);
    console.log('  - Author:', review.reviewer.displayName);
    console.log('  - Rating:', review.starRating);
    console.log('  - Comment:', review.comment || '(no comment)');
    console.log('  - Date:', review.createTime);
    if (review.reviewReply) {
      console.log('  - Reply:', review.reviewReply.comment);
    }
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => process.exit());
