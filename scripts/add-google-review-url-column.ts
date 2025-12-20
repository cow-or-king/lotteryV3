/**
 * Script pour ajouter la colonne google_review_url à la table campaigns
 */

import { prisma } from '../src/infrastructure/database/prisma-client';

async function addGoogleReviewUrlColumn() {
  try {
    console.log('🔧 Ajout de la colonne google_review_url à la table campaigns...');

    await prisma.$executeRaw`
      ALTER TABLE campaigns
      ADD COLUMN IF NOT EXISTS google_review_url TEXT;
    `;

    console.log('✅ Colonne google_review_url ajoutée avec succès!');

    // Vérifier que la colonne existe
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'campaigns'
      AND column_name = 'google_review_url';
    `;

    console.log('📊 Vérification:', result);
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addGoogleReviewUrlColumn();
