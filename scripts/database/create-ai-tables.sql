-- Script SQL pour créer les tables AI dans Supabase
-- À exécuter dans: Supabase Dashboard → SQL Editor

-- =====================
-- TABLE: ai_service_config
-- =====================

CREATE TABLE IF NOT EXISTS "ai_service_config" (
  "id" TEXT PRIMARY KEY,
  "provider" TEXT NOT NULL,  -- 'openai' | 'anthropic'
  
  -- API Keys (CHIFFRÉES)
  "api_key" TEXT NOT NULL,
  "api_key_status" TEXT DEFAULT 'active' NOT NULL,  -- 'active' | 'inactive' | 'error'
  
  -- Configuration
  "model" TEXT DEFAULT 'gpt-4' NOT NULL,
  "max_tokens" INTEGER DEFAULT 500 NOT NULL,
  "temperature" DOUBLE PRECISION DEFAULT 0.7 NOT NULL,
  "system_prompt" TEXT,
  
  -- Monitoring
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "daily_quota_limit" INTEGER,
  "last_used_at" TIMESTAMP(3),
  "total_requests_count" INTEGER DEFAULT 0 NOT NULL,
  "total_tokens_used" INTEGER DEFAULT 0 NOT NULL,
  "last_error_at" TIMESTAMP(3),
  "last_error_message" TEXT,
  
  "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index pour ai_service_config
CREATE INDEX IF NOT EXISTS "ai_service_config_provider_idx" ON "ai_service_config"("provider");
CREATE INDEX IF NOT EXISTS "ai_service_config_is_active_idx" ON "ai_service_config"("is_active");

-- =====================
-- TABLE: ai_usage_logs
-- =====================

CREATE TABLE IF NOT EXISTS "ai_usage_logs" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "store_id" TEXT,
  "review_id" TEXT,
  
  -- Details requête
  "provider" TEXT NOT NULL,  -- 'openai' | 'anthropic'
  "model" TEXT NOT NULL,
  "prompt_tokens" INTEGER NOT NULL,
  "completion_tokens" INTEGER NOT NULL,
  "total_tokens" INTEGER NOT NULL,
  
  -- Coût
  "estimated_cost_usd" DOUBLE PRECISION NOT NULL,
  
  -- Métadonnées
  "request_type" TEXT NOT NULL,  -- 'generate_response' | 'sentiment_analysis'
  "was_used" BOOLEAN DEFAULT false NOT NULL,
  
  "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index pour ai_usage_logs
CREATE INDEX IF NOT EXISTS "ai_usage_logs_user_id_created_at_idx" ON "ai_usage_logs"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "ai_usage_logs_store_id_created_at_idx" ON "ai_usage_logs"("store_id", "created_at");
CREATE INDEX IF NOT EXISTS "ai_usage_logs_review_id_idx" ON "ai_usage_logs"("review_id");
CREATE INDEX IF NOT EXISTS "ai_usage_logs_created_at_idx" ON "ai_usage_logs"("created_at");

-- Message de confirmation
SELECT 'Tables AI créées avec succès!' AS status;
