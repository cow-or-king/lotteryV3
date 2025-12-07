-- Migration: Remove owner_id column from stores table
-- Cette colonne ne devrait plus exister car Store -> Brand -> User

-- Supprimer la colonne owner_id de la table stores
ALTER TABLE stores DROP COLUMN IF EXISTS owner_id;
