-- Script: Promouvoir un utilisateur en SUPER_ADMIN
-- À exécuter dans Supabase Dashboard > SQL Editor
-- IMPORTANT: Remplacer 'ton-email@example.com' par l'email de l'utilisateur

-- Promouvoir l'utilisateur en SUPER_ADMIN
UPDATE users
SET role = 'SUPER_ADMIN'
WHERE email = 'milone@me.com'; -- ← Remplacer par ton email

-- Vérifier que la mise à jour a fonctionné
SELECT id, email, role, created_at
FROM users
WHERE email = 'milone@me.com'; -- ← Remplacer par ton email
