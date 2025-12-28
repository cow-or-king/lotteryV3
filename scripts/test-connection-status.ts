import { prisma } from '../src/infrastructure/database/prisma-client';

async function main() {
  const storeId = 'cmjo7bgch0009125f5rh92gxf';

  const token = await prisma.googleBusinessToken.findUnique({
    where: { storeId },
    select: {
      id: true,
      accountId: true,
      locationId: true,
      locationName: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!token) {
    console.log('❌ No token found');
    return {
      isConnected: false,
      token: null,
    };
  }

  const now = new Date();
  const isExpired = token.expiresAt < now;

  console.log('Token info:');
  console.log('- Expires At:', token.expiresAt.toISOString());
  console.log('- Now:', now.toISOString());
  console.log('- Is Expired:', isExpired);
  console.log('- Is Connected:', !isExpired);
  console.log('- Account ID:', token.accountId);
  console.log('- Location ID:', token.locationId);
  console.log('- Location Name:', token.locationName);

  const result = {
    isConnected: !isExpired,
    token: {
      accountId: token.accountId,
      locationId: token.locationId,
      locationName: token.locationName,
      expiresAt: token.expiresAt.toISOString(),
      createdAt: token.createdAt.toISOString(),
      updatedAt: token.updatedAt.toISOString(),
    },
  };

  console.log('\nAPI Response:');
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
