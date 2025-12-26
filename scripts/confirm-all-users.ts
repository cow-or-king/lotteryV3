/**
 * Script pour auto-confirmer tous les utilisateurs Supabase existants
 * À exécuter une seule fois après le déploiement de la correction
 * IMPORTANT: Nécessite SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Charger les variables d'environnement
config({ path: '.env.production' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function confirmAllUsers() {
  console.log('🔍 Fetching all users from Supabase...');

  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error fetching users:', error);
    process.exit(1);
  }

  if (!users || users.users.length === 0) {
    console.log('✅ No users found');
    return;
  }

  console.log(`📊 Found ${users.users.length} users`);

  let confirmedCount = 0;
  let alreadyConfirmedCount = 0;
  let errorCount = 0;

  for (const user of users.users) {
    console.log(`\n👤 User: ${user.email} (ID: ${user.id})`);

    // Vérifier si déjà confirmé
    if (user.email_confirmed_at) {
      console.log('  ✓ Already confirmed');
      alreadyConfirmedCount++;
      continue;
    }

    // Confirmer l'utilisateur
    try {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });

      if (updateError) {
        console.error(`  ❌ Error confirming user: ${updateError.message}`);
        errorCount++;
      } else {
        console.log('  ✅ Confirmed successfully');
        confirmedCount++;
      }
    } catch (err) {
      console.error(`  ❌ Error: ${err}`);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Confirmed: ${confirmedCount}`);
  console.log(`  ℹ️  Already confirmed: ${alreadyConfirmedCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📈 Total: ${users.users.length}`);
}

confirmAllUsers()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
