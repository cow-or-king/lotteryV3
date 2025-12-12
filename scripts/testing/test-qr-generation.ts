/**
 * Script de test pour la génération automatique de QR Code
 * Usage: npx tsx scripts/testing/test-qr-generation.ts
 */

import * as QRCode from 'qrcode';

async function testQRCodeGeneration() {
  console.log('🧪 Test de génération de QR Code SVG\n');

  try {
    const testUrl = 'https://example.com/s/test-store-123';

    console.log('📝 Génération du QR Code pour:', testUrl);

    const svgData = await QRCode.toString(testUrl, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 512,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    console.log('✅ QR Code SVG généré avec succès!');
    console.log('📊 Taille du SVG:', svgData.length, 'caractères');
    console.log('📄 Aperçu (premiers 200 caractères):');
    console.log(svgData.substring(0, 200) + '...\n');

    // Test avec différentes configurations
    console.log('🔄 Test avec niveau de correction H (avec logo)...');
    const svgHighCorrection = await QRCode.toString(testUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H', // 30% correction (pour logo)
      margin: 1,
      width: 512,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    console.log('✅ QR Code avec haute correction généré!');
    console.log('📊 Taille:', svgHighCorrection.length, 'caractères\n');

    console.log('✨ Tous les tests ont réussi!');
    console.log('\n🎉 La librairie qrcode fonctionne correctement côté serveur.');
    console.log('✅ Prêt à générer des QR Codes par défaut pour les Stores!\n');
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    process.exit(1);
  }
}

testQRCodeGeneration();
