import { prisma } from '../src/infrastructure/database/prisma-client';
import { decryptToken } from '../src/lib/encryption/token-encryption.service';

async function main() {
  const token = await prisma.googleBusinessToken.findUnique({
    where: { storeId: 'cmjo7bgch0009125f5rh92gxf' },
  });

  if (!token) {
    console.log('No token found');
    return;
  }

  console.log('Token found:');
  console.log('- ID:', token.id);
  console.log('- Store ID:', token.storeId);
  console.log('- Account ID:', token.accountId);
  console.log('- Location ID:', token.locationId);
  console.log('- Location Name:', token.locationName);
  console.log('- Expires At:', token.expiresAt);
  console.log('- Created At:', token.createdAt);
  console.log('- Updated At:', token.updatedAt);

  try {
    const accessToken = decryptToken(token.accessToken);
    console.log('\n✅ Access token decrypted successfully (length:', accessToken.length, ')');
  } catch (error) {
    console.error('\n❌ Failed to decrypt access token:', error);
  }

  try {
    const refreshToken = decryptToken(token.refreshToken);
    console.log('✅ Refresh token decrypted successfully (length:', refreshToken.length, ')');
  } catch (error) {
    console.error('❌ Failed to decrypt refresh token:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
