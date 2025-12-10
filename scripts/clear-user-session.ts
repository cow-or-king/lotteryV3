/**
 * Script pour effacer les sessions utilisateur (cookies orphelins)
 * Utile quand un utilisateur ne peut pas se connecter à cause de cookies corrompus
 * Usage: npx tsx scripts/clear-user-session.ts
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🧹 NETTOYAGE DES SESSIONS                                   ║
╚══════════════════════════════════════════════════════════════╝

Pour résoudre les problèmes de connexion liés aux cookies:

1️⃣  Ouvrir les DevTools (F12)
2️⃣  Aller dans Application > Cookies
3️⃣  Supprimer tous les cookies de localhost:3000
4️⃣  Ou utiliser la navigation privée

🔑 Cookies à vérifier/supprimer:
   • rl-access-token
   • rl-refresh-token

💡 Alternative: Navigation privée
   → Ouvrir une fenêtre de navigation privée
   → Tester la connexion

📝 Si le problème persiste:
   → Vérifier le mot de passe
   → Vérifier les logs dans la console navigateur (F12)
   → Vérifier les logs serveur (terminal Next.js)

`);
