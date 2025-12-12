/**
 * Script pour configurer les politiques RLS des buckets Supabase Storage
 * Usage: npx tsx scripts/setup-storage-policies.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const directUrl = process.env.DIRECT_URL!;

if (!directUrl) {
  console.error('❌ Variable manquante: DIRECT_URL');
  process.exit(1);
}

async function executeSqlFile(filePath: string): Promise<void> {
  const { Client } = await import('pg');
  const client = new Client({ connectionString: directUrl });

  try {
    // Lire le fichier SQL
    const sql = readFileSync(filePath, 'utf-8');

    await client.connect();
    console.log('✅ Connexion à la base de données réussie');

    // Exécuter le SQL
    await client.query(sql);
    console.log('✅ Politiques RLS créées avec succès');

    await client.end();
  } catch (error) {
    await client.end();
    throw error;
  }
}

async function setupStoragePolicies() {
  console.log('🚀 Configuration des politiques RLS pour les buckets Storage...\n');

  try {
    const sqlFilePath = join(__dirname, 'setup-storage-policies.sql');
    await executeSqlFile(sqlFilePath);
    console.log('\n✅ Configuration terminée!');
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

setupStoragePolicies();
