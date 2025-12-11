-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "hashed_password" TEXT,
    "name" TEXT,
    "avatar_url" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "stores_limit" INTEGER NOT NULL DEFAULT 1,
    "campaigns_limit" INTEGER NOT NULL DEFAULT 0,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "primary_color" TEXT NOT NULL DEFAULT '#5B21B6',
    "secondary_color" TEXT NOT NULL DEFAULT '#FACC15',
    "font" TEXT NOT NULL DEFAULT 'inter',
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "google_place_id" TEXT,
    "google_business_url" TEXT NOT NULL,
    "google_places_api_key" TEXT,
    "google_api_key_status" TEXT DEFAULT 'not_configured',
    "last_review_sync" TIMESTAMP(3),
    "auto_sync_enabled" BOOLEAN NOT NULL DEFAULT false,
    "sync_frequency_hours" INTEGER NOT NULL DEFAULT 24,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "store_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "wheel_style" TEXT NOT NULL DEFAULT 'classic',
    "wheel_animation" TEXT NOT NULL DEFAULT 'spin',
    "type" TEXT NOT NULL DEFAULT 'generic',
    "require_review" BOOLEAN NOT NULL DEFAULT false,
    "require_instagram" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prizes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "value" DOUBLE PRECISION,
    "campaign_id" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "campaign_id" TEXT NOT NULL,
    "has_played" BOOLEAN NOT NULL DEFAULT false,
    "played_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "has_reviewed" BOOLEAN NOT NULL DEFAULT false,
    "review_rating" INTEGER,
    "review_comment" TEXT,
    "consent_date" TIMESTAMP(3),
    "data_retention_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winners" (
    "id" TEXT NOT NULL,
    "prize_id" TEXT NOT NULL,
    "participant_email" TEXT NOT NULL,
    "participant_name" TEXT,
    "claim_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "claimed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "winners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "google_review_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "author_name" TEXT NOT NULL,
    "author_email" TEXT,
    "author_google_id" TEXT,
    "author_photo_url" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL,
    "has_response" BOOLEAN NOT NULL DEFAULT false,
    "response_content" TEXT,
    "responded_at" TIMESTAMP(3),
    "responded_by" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "participant_id" TEXT,
    "ai_suggestion" JSONB,
    "ai_sentiment" TEXT,
    "review_url" TEXT NOT NULL,
    "google_place_id" TEXT NOT NULL,
    "photo_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "sentiment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_templates" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "response_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_templates" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "min_price" DOUBLE PRECISION,
    "max_price" DOUBLE PRECISION,
    "color" TEXT NOT NULL DEFAULT '#8B5CF6',
    "icon_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prize_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_sets" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prize_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prize_set_items" (
    "id" TEXT NOT NULL,
    "prize_set_id" TEXT NOT NULL,
    "prize_template_id" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prize_set_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_limits" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "max_brands" INTEGER NOT NULL,
    "max_stores_per_brand" INTEGER NOT NULL,
    "max_prize_templates" INTEGER NOT NULL,
    "max_prize_sets" INTEGER NOT NULL,
    "max_campaigns" INTEGER NOT NULL,
    "max_participants" INTEGER NOT NULL,
    "custom_branding" BOOLEAN NOT NULL DEFAULT false,
    "advanced_analytics" BOOLEAN NOT NULL DEFAULT false,
    "api_access" BOOLEAN NOT NULL DEFAULT false,
    "priority_support" BOOLEAN NOT NULL DEFAULT false,
    "ai_responses_enabled" BOOLEAN NOT NULL DEFAULT false,
    "ai_responses_per_month" INTEGER,
    "price_monthly" DOUBLE PRECISION,
    "price_yearly" DOUBLE PRECISION,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_service_config" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "api_key_status" TEXT NOT NULL DEFAULT 'active',
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "max_tokens" INTEGER NOT NULL DEFAULT 500,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "system_prompt" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "daily_quota_limit" INTEGER,
    "last_used_at" TIMESTAMP(3),
    "total_requests_count" INTEGER NOT NULL DEFAULT 0,
    "total_tokens_used" INTEGER NOT NULL DEFAULT 0,
    "last_error_at" TIMESTAMP(3),
    "last_error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_service_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "store_id" TEXT,
    "review_id" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL,
    "completion_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "estimated_cost_usd" DOUBLE PRECISION NOT NULL,
    "request_type" TEXT NOT NULL,
    "was_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_permissions" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "super_admin_visible" BOOLEAN NOT NULL DEFAULT true,
    "admin_visible" BOOLEAN NOT NULL DEFAULT true,
    "user_visible" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_key" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_stripe_customer_id_idx" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "brands_owner_id_idx" ON "brands"("owner_id");

-- CreateIndex
CREATE INDEX "brands_owner_id_created_at_idx" ON "brands"("owner_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "stores"("slug");

-- CreateIndex
CREATE INDEX "stores_brand_id_idx" ON "stores"("brand_id");

-- CreateIndex
CREATE INDEX "stores_brand_id_created_at_idx" ON "stores"("brand_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "stores_slug_idx" ON "stores"("slug");

-- CreateIndex
CREATE INDEX "campaigns_store_id_idx" ON "campaigns"("store_id");

-- CreateIndex
CREATE INDEX "campaigns_is_active_start_date_end_date_idx" ON "campaigns"("is_active", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "prizes_campaign_id_idx" ON "prizes"("campaign_id");

-- CreateIndex
CREATE INDEX "participants_campaign_id_idx" ON "participants"("campaign_id");

-- CreateIndex
CREATE INDEX "participants_email_idx" ON "participants"("email");

-- CreateIndex
CREATE INDEX "participants_data_retention_until_idx" ON "participants"("data_retention_until");

-- CreateIndex
CREATE UNIQUE INDEX "participants_email_campaign_id_key" ON "participants"("email", "campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "winners_claim_code_key" ON "winners"("claim_code");

-- CreateIndex
CREATE INDEX "winners_claim_code_idx" ON "winners"("claim_code");

-- CreateIndex
CREATE INDEX "winners_status_idx" ON "winners"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_google_review_id_key" ON "reviews"("google_review_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_participant_id_key" ON "reviews"("participant_id");

-- CreateIndex
CREATE INDEX "reviews_store_id_published_at_idx" ON "reviews"("store_id", "published_at");

-- CreateIndex
CREATE INDEX "reviews_campaign_id_idx" ON "reviews"("campaign_id");

-- CreateIndex
CREATE INDEX "reviews_author_email_store_id_idx" ON "reviews"("author_email", "store_id");

-- CreateIndex
CREATE INDEX "reviews_is_verified_idx" ON "reviews"("is_verified");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_store_id_status_idx" ON "reviews"("store_id", "status");

-- CreateIndex
CREATE INDEX "response_templates_store_id_idx" ON "response_templates"("store_id");

-- CreateIndex
CREATE INDEX "response_templates_store_id_category_idx" ON "response_templates"("store_id", "category");

-- CreateIndex
CREATE INDEX "prize_templates_brand_id_idx" ON "prize_templates"("brand_id");

-- CreateIndex
CREATE INDEX "prize_templates_owner_id_idx" ON "prize_templates"("owner_id");

-- CreateIndex
CREATE INDEX "prize_templates_brand_id_created_at_idx" ON "prize_templates"("brand_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "prize_templates_owner_id_created_at_idx" ON "prize_templates"("owner_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "prize_sets_brand_id_idx" ON "prize_sets"("brand_id");

-- CreateIndex
CREATE INDEX "prize_sets_brand_id_created_at_idx" ON "prize_sets"("brand_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "prize_set_items_prize_set_id_idx" ON "prize_set_items"("prize_set_id");

-- CreateIndex
CREATE INDEX "prize_set_items_prize_template_id_idx" ON "prize_set_items"("prize_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "prize_set_items_prize_set_id_prize_template_id_key" ON "prize_set_items"("prize_set_id", "prize_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_limits_plan_key" ON "plan_limits"("plan");

-- CreateIndex
CREATE INDEX "plan_limits_plan_idx" ON "plan_limits"("plan");

-- CreateIndex
CREATE INDEX "ai_service_config_provider_idx" ON "ai_service_config"("provider");

-- CreateIndex
CREATE INDEX "ai_service_config_is_active_idx" ON "ai_service_config"("is_active");

-- CreateIndex
CREATE INDEX "ai_usage_logs_user_id_created_at_idx" ON "ai_usage_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_usage_logs_store_id_created_at_idx" ON "ai_usage_logs"("store_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_usage_logs_review_id_idx" ON "ai_usage_logs"("review_id");

-- CreateIndex
CREATE INDEX "ai_usage_logs_created_at_idx" ON "ai_usage_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "menu_permissions_menu_id_key" ON "menu_permissions"("menu_id");

-- CreateIndex
CREATE INDEX "menu_permissions_menu_id_idx" ON "menu_permissions"("menu_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prizes" ADD CONSTRAINT "prizes_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_prize_id_fkey" FOREIGN KEY ("prize_id") REFERENCES "prizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_templates" ADD CONSTRAINT "response_templates_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_templates" ADD CONSTRAINT "prize_templates_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_templates" ADD CONSTRAINT "prize_templates_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_sets" ADD CONSTRAINT "prize_sets_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_set_items" ADD CONSTRAINT "prize_set_items_prize_set_id_fkey" FOREIGN KEY ("prize_set_id") REFERENCES "prize_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prize_set_items" ADD CONSTRAINT "prize_set_items_prize_template_id_fkey" FOREIGN KEY ("prize_template_id") REFERENCES "prize_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

