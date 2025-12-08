-- =====================================================
-- ReviewLottery v3.0 - Migration Complète
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =====================================================

-- Note: Les tables Supabase Auth existent déjà (auth.users)
-- On crée seulement les tables de l'application

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "email_verified" BOOLEAN DEFAULT false NOT NULL,
    "hashed_password" TEXT,
    "name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

-- =====================================================
-- 2. SUBSCRIPTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT UNIQUE NOT NULL,
    "plan" TEXT DEFAULT 'FREE' NOT NULL,
    "status" TEXT DEFAULT 'ACTIVE' NOT NULL,
    "stores_limit" INTEGER DEFAULT 1 NOT NULL,
    "campaigns_limit" INTEGER DEFAULT 0 NOT NULL,
    "stripe_customer_id" TEXT UNIQUE,
    "stripe_subscription_id" TEXT UNIQUE,
    "current_period_end" TIMESTAMPTZ,
    "cancel_at_period_end" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "subscriptions_stripe_customer_id_idx"
    ON "subscriptions"("stripe_customer_id");

-- =====================================================
-- 3. BRANDS
-- =====================================================

CREATE TABLE IF NOT EXISTS "brands" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "primary_color" TEXT DEFAULT '#5B21B6' NOT NULL,
    "secondary_color" TEXT DEFAULT '#FACC15' NOT NULL,
    "font" TEXT DEFAULT 'inter' NOT NULL,
    "is_paid" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "brands_owner_id_fkey" FOREIGN KEY ("owner_id")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "brands_owner_id_idx" ON "brands"("owner_id");
CREATE INDEX IF NOT EXISTS "brands_owner_id_created_at_idx"
    ON "brands"("owner_id", "created_at" DESC);

-- =====================================================
-- 4. STORES
-- =====================================================

CREATE TABLE IF NOT EXISTS "stores" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "brand_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "google_place_id" TEXT,
    "google_business_url" TEXT NOT NULL,
    "google_places_api_key" TEXT,
    "google_api_key_status" TEXT DEFAULT 'not_configured',
    "last_review_sync" TIMESTAMPTZ,
    "auto_sync_enabled" BOOLEAN DEFAULT false NOT NULL,
    "sync_frequency_hours" INTEGER DEFAULT 24 NOT NULL,
    "is_active" BOOLEAN DEFAULT true NOT NULL,
    "is_paid" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "stores_brand_id_fkey" FOREIGN KEY ("brand_id")
        REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "stores_brand_id_idx" ON "stores"("brand_id");
CREATE INDEX IF NOT EXISTS "stores_brand_id_created_at_idx"
    ON "stores"("brand_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "stores_slug_idx" ON "stores"("slug");

-- =====================================================
-- 5. CAMPAIGNS
-- =====================================================

CREATE TABLE IF NOT EXISTS "campaigns" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "store_id" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "is_active" BOOLEAN DEFAULT false NOT NULL,
    "wheel_style" TEXT DEFAULT 'classic' NOT NULL,
    "wheel_animation" TEXT DEFAULT 'spin' NOT NULL,
    "type" TEXT DEFAULT 'generic' NOT NULL,
    "require_review" BOOLEAN DEFAULT false NOT NULL,
    "require_instagram" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "campaigns_store_id_fkey" FOREIGN KEY ("store_id")
        REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "campaigns_store_id_idx" ON "campaigns"("store_id");
CREATE INDEX IF NOT EXISTS "campaigns_active_dates_idx"
    ON "campaigns"("is_active", "start_date", "end_date");

-- =====================================================
-- 6. PRIZES
-- =====================================================

CREATE TABLE IF NOT EXISTS "prizes" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value" DOUBLE PRECISION,
    "campaign_id" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "prizes_campaign_id_fkey" FOREIGN KEY ("campaign_id")
        REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "prizes_campaign_id_idx" ON "prizes"("campaign_id");

-- =====================================================
-- 7. PARTICIPANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS "participants" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "campaign_id" TEXT NOT NULL,
    "has_played" BOOLEAN DEFAULT false NOT NULL,
    "played_at" TIMESTAMPTZ,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "has_reviewed" BOOLEAN DEFAULT false NOT NULL,
    "review_rating" INTEGER,
    "review_comment" TEXT,
    "consent_date" TIMESTAMPTZ,
    "data_retention_until" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "participants_campaign_id_fkey" FOREIGN KEY ("campaign_id")
        REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "participants_email_campaign_id_unique" UNIQUE ("email", "campaign_id")
);

CREATE INDEX IF NOT EXISTS "participants_campaign_id_idx" ON "participants"("campaign_id");
CREATE INDEX IF NOT EXISTS "participants_email_idx" ON "participants"("email");
CREATE INDEX IF NOT EXISTS "participants_data_retention_until_idx"
    ON "participants"("data_retention_until");

-- =====================================================
-- 8. WINNERS
-- =====================================================

CREATE TABLE IF NOT EXISTS "winners" (
    "id" TEXT PRIMARY KEY,
    "prize_id" TEXT NOT NULL,
    "participant_email" TEXT NOT NULL,
    "participant_name" TEXT,
    "claim_code" TEXT UNIQUE NOT NULL,
    "status" TEXT DEFAULT 'PENDING' NOT NULL,
    "claimed_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "winners_prize_id_fkey" FOREIGN KEY ("prize_id")
        REFERENCES "prizes"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "winners_claim_code_idx" ON "winners"("claim_code");
CREATE INDEX IF NOT EXISTS "winners_status_idx" ON "winners"("status");

-- =====================================================
-- 9. REVIEWS (Google)
-- =====================================================

CREATE TABLE IF NOT EXISTS "reviews" (
    "id" TEXT PRIMARY KEY,
    "google_review_id" TEXT UNIQUE NOT NULL,
    "store_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "author_name" TEXT NOT NULL,
    "author_email" TEXT,
    "author_google_id" TEXT,
    "author_photo_url" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "published_at" TIMESTAMPTZ NOT NULL,
    "has_response" BOOLEAN DEFAULT false NOT NULL,
    "response_content" TEXT,
    "responded_at" TIMESTAMPTZ,
    "responded_by" TEXT,
    "is_verified" BOOLEAN DEFAULT false NOT NULL,
    "participant_id" TEXT UNIQUE,
    "ai_suggestion" JSONB,
    "ai_sentiment" TEXT,
    "review_url" TEXT NOT NULL,
    "photo_url" TEXT,
    "status" TEXT DEFAULT 'NEW' NOT NULL,
    "sentiment" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "reviews_store_id_fkey" FOREIGN KEY ("store_id")
        REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_campaign_id_fkey" FOREIGN KEY ("campaign_id")
        REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reviews_participant_id_fkey" FOREIGN KEY ("participant_id")
        REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reviews_responded_by_fkey" FOREIGN KEY ("responded_by")
        REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reviews_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);

CREATE INDEX IF NOT EXISTS "reviews_store_id_published_at_idx"
    ON "reviews"("store_id", "published_at");
CREATE INDEX IF NOT EXISTS "reviews_campaign_id_idx" ON "reviews"("campaign_id");
CREATE INDEX IF NOT EXISTS "reviews_author_email_store_id_idx"
    ON "reviews"("author_email", "store_id");
CREATE INDEX IF NOT EXISTS "reviews_is_verified_idx" ON "reviews"("is_verified");
CREATE INDEX IF NOT EXISTS "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX IF NOT EXISTS "reviews_store_id_status_idx" ON "reviews"("store_id", "status");

-- =====================================================
-- 10. RESPONSE TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS "response_templates" (
    "id" TEXT PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "usage_count" INTEGER DEFAULT 0 NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "response_templates_store_id_fkey" FOREIGN KEY ("store_id")
        REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "response_templates_category_check"
        CHECK ("category" IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'CUSTOM'))
);

CREATE INDEX IF NOT EXISTS "response_templates_store_id_idx"
    ON "response_templates"("store_id");
CREATE INDEX IF NOT EXISTS "response_templates_store_id_category_idx"
    ON "response_templates"("store_id", "category");

-- =====================================================
-- 11. PRIZE TEMPLATES
-- =====================================================

CREATE TABLE IF NOT EXISTS "prize_templates" (
    "id" TEXT PRIMARY KEY,
    "brand_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "min_price" DOUBLE PRECISION,
    "max_price" DOUBLE PRECISION,
    "color" TEXT DEFAULT '#8B5CF6' NOT NULL,
    "icon_url" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "prize_templates_owner_id_fkey" FOREIGN KEY ("owner_id")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "prize_templates_brand_id_fkey" FOREIGN KEY ("brand_id")
        REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "prize_templates_brand_id_idx" ON "prize_templates"("brand_id");
CREATE INDEX IF NOT EXISTS "prize_templates_owner_id_idx" ON "prize_templates"("owner_id");
CREATE INDEX IF NOT EXISTS "prize_templates_brand_id_created_at_idx"
    ON "prize_templates"("brand_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "prize_templates_owner_id_created_at_idx"
    ON "prize_templates"("owner_id", "created_at" DESC);

-- =====================================================
-- 12. PRIZE SETS
-- =====================================================

CREATE TABLE IF NOT EXISTS "prize_sets" (
    "id" TEXT PRIMARY KEY,
    "brand_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "prize_sets_brand_id_fkey" FOREIGN KEY ("brand_id")
        REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "prize_sets_brand_id_idx" ON "prize_sets"("brand_id");
CREATE INDEX IF NOT EXISTS "prize_sets_brand_id_created_at_idx"
    ON "prize_sets"("brand_id", "created_at" DESC);

-- =====================================================
-- 13. PRIZE SET ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS "prize_set_items" (
    "id" TEXT PRIMARY KEY,
    "prize_set_id" TEXT NOT NULL,
    "prize_template_id" TEXT NOT NULL,
    "probability" DOUBLE PRECISION DEFAULT 10 NOT NULL,
    "quantity" INTEGER DEFAULT 1 NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT "prize_set_items_prize_set_id_fkey" FOREIGN KEY ("prize_set_id")
        REFERENCES "prize_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "prize_set_items_prize_template_id_fkey" FOREIGN KEY ("prize_template_id")
        REFERENCES "prize_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "prize_set_items_prize_set_id_prize_template_id_unique"
        UNIQUE ("prize_set_id", "prize_template_id")
);

CREATE INDEX IF NOT EXISTS "prize_set_items_prize_set_id_idx"
    ON "prize_set_items"("prize_set_id");
CREATE INDEX IF NOT EXISTS "prize_set_items_prize_template_id_idx"
    ON "prize_set_items"("prize_template_id");

-- =====================================================
-- 14. PLAN LIMITS
-- =====================================================

CREATE TABLE IF NOT EXISTS "plan_limits" (
    "id" TEXT PRIMARY KEY,
    "plan" TEXT UNIQUE NOT NULL,
    "max_brands" INTEGER NOT NULL,
    "max_stores_per_brand" INTEGER NOT NULL,
    "max_prize_templates" INTEGER NOT NULL,
    "max_prize_sets" INTEGER NOT NULL,
    "max_campaigns" INTEGER NOT NULL,
    "max_participants" INTEGER NOT NULL,
    "custom_branding" BOOLEAN DEFAULT false NOT NULL,
    "advanced_analytics" BOOLEAN DEFAULT false NOT NULL,
    "api_access" BOOLEAN DEFAULT false NOT NULL,
    "priority_support" BOOLEAN DEFAULT false NOT NULL,
    "price_monthly" DOUBLE PRECISION,
    "price_yearly" DOUBLE PRECISION,
    "description" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "plan_limits_plan_idx" ON "plan_limits"("plan");

-- =====================================================
-- TRIGGERS - Updated At
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON "subscriptions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON "brands"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON "stores"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON "campaigns"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prizes_updated_at BEFORE UPDATE ON "prizes"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON "reviews"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_response_templates_updated_at BEFORE UPDATE ON "response_templates"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prize_templates_updated_at BEFORE UPDATE ON "prize_templates"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prize_sets_updated_at BEFORE UPDATE ON "prize_sets"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_limits_updated_at BEFORE UPDATE ON "plan_limits"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Commentaires pour documentation
-- =====================================================

COMMENT ON TABLE "reviews" IS 'Avis Google synchronisés et gérés - Conservation 3 ans (RGPD)';
COMMENT ON TABLE "response_templates" IS 'Templates de réponses aux avis - Par commerce';
COMMENT ON COLUMN "reviews"."is_verified" IS 'Indique si l''avis a été vérifié pour participation à la loterie';
COMMENT ON COLUMN "reviews"."status" IS 'NEW=nouveau, PENDING=en attente, PROCESSED=traité, ARCHIVED=archivé après 3 ans (RGPD)';
COMMENT ON COLUMN "stores"."google_places_api_key" IS 'API Key Google chiffrée AES-256-GCM';

-- =====================================================
-- Fin de la migration
-- =====================================================

-- Afficher les tables créées
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
