-- Nettoyer les participants et données associées pour tests
-- À exécuter dans Supabase

-- 1. Supprimer les winners (gains)
DELETE FROM winners;

-- 2. Supprimer les store_condition_completions (conditions au niveau store)
DELETE FROM store_condition_completions;

-- 3. Supprimer les store_played_games (jeux joués au niveau store)
DELETE FROM store_played_games;

-- 4. Supprimer les participants
DELETE FROM participants;

-- 5. Optionnel: Réinitialiser les quantités de prizes restants
-- UPDATE prizes SET remaining = quantity;
