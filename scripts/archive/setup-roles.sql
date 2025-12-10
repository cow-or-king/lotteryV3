-- Script: Configuration des rôles pour ReviewLottery v3
-- À exécuter dans Supabase Dashboard > SQL Editor après avoir ajouté la colonne 'role'

-- ============================================================
-- HIÉRARCHIE DES RÔLES
-- ============================================================
-- SUPER_ADMIN: devily@ily.com (propriétaire ReviewLottery)
--   └─ Interface dédiée /admin/ai-config
--   └─ 100% accès à tout
--
-- ADMIN: milone@me.com + clients (gérants de commerces)
--   └─ Dashboard admin complet
--   └─ Peuvent créer des USERS
--   └─ Gèrent leurs commerces/campagnes
--
-- USER: Employés créés par les ADMIN
--   └─ Accès restreint (configuré par ADMIN)
-- ============================================================

-- 1. Promouvoir devily@ily.com en SUPER_ADMIN
UPDATE users
SET role = 'SUPER_ADMIN'
WHERE email = 'devily@ily.com';

-- 2. Promouvoir milone@me.com en ADMIN
UPDATE users
SET role = 'ADMIN'
WHERE email = 'milone@me.com';

-- 3. Vérifier que les mises à jour ont fonctionné
SELECT
  email,
  role,
  CASE
    WHEN role = 'SUPER_ADMIN' THEN '👑 Propriétaire ReviewLottery'
    WHEN role = 'ADMIN' THEN '👔 Gérant de commerce'
    WHEN role = 'USER' THEN '👤 Employé'
    ELSE '❓ Rôle inconnu'
  END as description,
  created_at
FROM users
WHERE email IN ('devily@ily.com', 'milone@me.com')
ORDER BY
  CASE role
    WHEN 'SUPER_ADMIN' THEN 1
    WHEN 'ADMIN' THEN 2
    WHEN 'USER' THEN 3
  END;

-- 4. Afficher tous les utilisateurs avec leurs rôles
SELECT
  email,
  role,
  created_at
FROM users
ORDER BY created_at DESC;
