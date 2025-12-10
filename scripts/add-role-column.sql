-- Migration: Ajouter la colonne 'role' à la table 'users'
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Ajouter la colonne 'role' avec valeur par défaut 'ADMIN'
-- Les nouveaux utilisateurs = clients (gérants de commerces) = ADMIN par défaut
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'ADMIN';

-- 2. Créer un index pour optimiser les requêtes par rôle
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'role';

-- 4. Afficher tous les utilisateurs avec leur rôle
SELECT id, email, role, created_at
FROM users
ORDER BY created_at DESC;
