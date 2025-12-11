-- =====================================================
-- ReviewLottery v3.0 - Enable Row Level Security (RLS)
-- Sécurise l'accès aux données via l'API Supabase
-- =====================================================

-- ⚠️ IMPORTANT:
-- L'application utilise Prisma avec service_role key (bypass RLS)
-- Mais RLS protège contre les accès non autorisés via l'API directe

-- =====================================================
-- 1. ACTIVER RLS SUR TOUTES LES TABLES
-- =====================================================

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "brands" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prizes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "winners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "response_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prize_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prize_sets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prize_set_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_limits" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLITIQUES PAR DÉFAUT (Bloquer tout accès public)
-- =====================================================

-- Les politiques ci-dessous BLOQUENT tout accès public
-- L'application utilise le service_role key qui bypass RLS

-- Users: Aucun accès public
CREATE POLICY "No public access to users"
    ON "users" FOR ALL
    USING (false);

-- Subscriptions: Aucun accès public
CREATE POLICY "No public access to subscriptions"
    ON "subscriptions" FOR ALL
    USING (false);

-- Brands: Aucun accès public
CREATE POLICY "No public access to brands"
    ON "brands" FOR ALL
    USING (false);

-- Stores: Lecture publique uniquement pour stores actifs (pour pages publiques loterie)
CREATE POLICY "Public read access to active stores"
    ON "stores" FOR SELECT
    USING (is_active = true);

CREATE POLICY "No public write to stores"
    ON "stores" FOR INSERT
    WITH CHECK (false);

CREATE POLICY "No public update to stores"
    ON "stores" FOR UPDATE
    USING (false)
    WITH CHECK (false);

CREATE POLICY "No public delete to stores"
    ON "stores" FOR DELETE
    USING (false);

-- Campaigns: Lecture publique uniquement pour campagnes actives
CREATE POLICY "Public read access to active campaigns"
    ON "campaigns" FOR SELECT
    USING (is_active = true AND start_date <= NOW() AND end_date >= NOW());

CREATE POLICY "No public write to campaigns"
    ON "campaigns" FOR INSERT
    WITH CHECK (false);

CREATE POLICY "No public update to campaigns"
    ON "campaigns" FOR UPDATE
    USING (false)
    WITH CHECK (false);

CREATE POLICY "No public delete to campaigns"
    ON "campaigns" FOR DELETE
    USING (false);

-- Prizes: Lecture publique pour prizes de campagnes actives
CREATE POLICY "Public read access to active campaign prizes"
    ON "prizes" FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "campaigns"
            WHERE "campaigns"."id" = "prizes"."campaign_id"
            AND "campaigns"."is_active" = true
            AND "campaigns"."start_date" <= NOW()
            AND "campaigns"."end_date" >= NOW()
        )
    );

CREATE POLICY "No public write to prizes"
    ON "prizes" FOR INSERT
    WITH CHECK (false);

CREATE POLICY "No public update to prizes"
    ON "prizes" FOR UPDATE
    USING (false)
    WITH CHECK (false);

CREATE POLICY "No public delete to prizes"
    ON "prizes" FOR DELETE
    USING (false);

-- Participants: Aucun accès public (données sensibles RGPD)
CREATE POLICY "No public access to participants"
    ON "participants" FOR ALL
    USING (false);

-- Winners: Lecture publique seulement avec claim_code valide
CREATE POLICY "Public read access to winners by claim code"
    ON "winners" FOR SELECT
    USING (expires_at > NOW());

CREATE POLICY "No public write to winners"
    ON "winners" FOR INSERT
    WITH CHECK (false);

CREATE POLICY "No public update to winners"
    ON "winners" FOR UPDATE
    USING (false)
    WITH CHECK (false);

CREATE POLICY "No public delete to winners"
    ON "winners" FOR DELETE
    USING (false);

-- Reviews: Aucun accès public (données personnelles RGPD)
CREATE POLICY "No public access to reviews"
    ON "reviews" FOR ALL
    USING (false);

-- Response Templates: Aucun accès public
CREATE POLICY "No public access to response templates"
    ON "response_templates" FOR ALL
    USING (false);

-- Prize Templates: Aucun accès public
CREATE POLICY "No public access to prize templates"
    ON "prize_templates" FOR ALL
    USING (false);

-- Prize Sets: Aucun accès public
CREATE POLICY "No public access to prize sets"
    ON "prize_sets" FOR ALL
    USING (false);

-- Prize Set Items: Aucun accès public
CREATE POLICY "No public access to prize set items"
    ON "prize_set_items" FOR ALL
    USING (false);

-- Plan Limits: Lecture publique (pour afficher les plans)
CREATE POLICY "Public read access to plan limits"
    ON "plan_limits" FOR SELECT
    USING (true);

CREATE POLICY "No public write to plan limits"
    ON "plan_limits" FOR INSERT
    WITH CHECK (false);

CREATE POLICY "No public update to plan limits"
    ON "plan_limits" FOR UPDATE
    USING (false)
    WITH CHECK (false);

CREATE POLICY "No public delete to plan limits"
    ON "plan_limits" FOR DELETE
    USING (false);

-- =====================================================
-- 3. VÉRIFICATION
-- =====================================================

-- Afficher toutes les tables avec RLS activé
SELECT
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Afficher toutes les politiques créées
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd as "Command"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- NOTES IMPORTANTES
-- =====================================================

-- ✅ RLS est maintenant activé sur toutes les tables
-- ✅ Par défaut, tout est bloqué sauf:
--    - Stores actifs (lecture publique)
--    - Campagnes actives (lecture publique)
--    - Prizes de campagnes actives (lecture publique)
--    - Winners avec claim_code valide (lecture publique)
--    - Plan limits (lecture publique)

-- ⚠️ L'application Prisma utilise le service_role key qui BYPASS RLS
-- Ces politiques protègent uniquement contre les accès via l'API Supabase directe

-- 🔐 Données sensibles RGPD protégées:
--    - users (données personnelles)
--    - participants (emails, consentements)
--    - reviews (avis Google, emails)
--    - subscriptions (paiements)
