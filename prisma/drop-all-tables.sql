-- =====================================================
-- ReviewLottery v3.0 - DROP ALL TABLES
-- ⚠️ ATTENTION: Supprime toutes les données !
-- À exécuter AVANT complete-migration.sql
-- =====================================================

-- Supprimer toutes les tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS "prize_set_items" CASCADE;
DROP TABLE IF EXISTS "prize_sets" CASCADE;
DROP TABLE IF EXISTS "prize_templates" CASCADE;
DROP TABLE IF EXISTS "response_templates" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "winners" CASCADE;
DROP TABLE IF EXISTS "participants" CASCADE;
DROP TABLE IF EXISTS "prizes" CASCADE;
DROP TABLE IF EXISTS "campaigns" CASCADE;
DROP TABLE IF EXISTS "stores" CASCADE;
DROP TABLE IF EXISTS "brands" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "plan_limits" CASCADE;

-- Supprimer la fonction trigger
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Vérifier que tout est supprimé
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Si la liste est vide ou contient seulement des tables Supabase (auth.*), c'est OK ✅
