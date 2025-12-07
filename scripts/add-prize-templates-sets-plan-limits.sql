-- Migration: Add PrizeTemplate, PrizeSet, PrizeSetItem and PlanLimits tables
-- Date: 2025-01-07
-- Description: Ajoute les modèles pour gérer les gains réutilisables et les limites de plans

-- =====================
-- PRIZE TEMPLATES (Gains réutilisables)
-- =====================

CREATE TABLE IF NOT EXISTS prize_templates (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  value DOUBLE PRECISION,
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  icon_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prize_templates_brand_id ON prize_templates(brand_id);
CREATE INDEX IF NOT EXISTS idx_prize_templates_brand_created ON prize_templates(brand_id, created_at DESC);

-- =====================
-- PRIZE SETS (Lots de gains)
-- =====================

CREATE TABLE IF NOT EXISTS prize_sets (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prize_sets_brand_id ON prize_sets(brand_id);
CREATE INDEX IF NOT EXISTS idx_prize_sets_brand_created ON prize_sets(brand_id, created_at DESC);

-- =====================
-- PRIZE SET ITEMS (Table de liaison)
-- =====================

CREATE TABLE IF NOT EXISTS prize_set_items (
  id TEXT PRIMARY KEY,
  prize_set_id TEXT NOT NULL REFERENCES prize_sets(id) ON DELETE CASCADE,
  prize_template_id TEXT NOT NULL REFERENCES prize_templates(id) ON DELETE CASCADE,
  probability DOUBLE PRECISION NOT NULL DEFAULT 10,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_prize_set_template UNIQUE (prize_set_id, prize_template_id)
);

CREATE INDEX IF NOT EXISTS idx_prize_set_items_set_id ON prize_set_items(prize_set_id);
CREATE INDEX IF NOT EXISTS idx_prize_set_items_template_id ON prize_set_items(prize_template_id);

-- =====================
-- PLAN LIMITS (Configuration des limites)
-- =====================

CREATE TABLE IF NOT EXISTS plan_limits (
  id TEXT PRIMARY KEY,
  plan TEXT NOT NULL UNIQUE,

  -- Limites Brands & Stores
  max_brands INTEGER NOT NULL,
  max_stores_per_brand INTEGER NOT NULL,

  -- Limites Prizes & PrizeSets
  max_prize_templates INTEGER NOT NULL,
  max_prize_sets INTEGER NOT NULL,

  -- Limites Campaigns
  max_campaigns INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,

  -- Features
  custom_branding BOOLEAN NOT NULL DEFAULT FALSE,
  advanced_analytics BOOLEAN NOT NULL DEFAULT FALSE,
  api_access BOOLEAN NOT NULL DEFAULT FALSE,
  priority_support BOOLEAN NOT NULL DEFAULT FALSE,

  -- Pricing
  price_monthly DOUBLE PRECISION,
  price_yearly DOUBLE PRECISION,
  description TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_limits_plan ON plan_limits(plan);

-- Insérer les données par défaut
INSERT INTO plan_limits (id, plan, max_brands, max_stores_per_brand, max_prize_templates, max_prize_sets, max_campaigns, max_participants, custom_branding, advanced_analytics, api_access, priority_support, price_monthly, price_yearly, description)
VALUES
  ('plan_free', 'FREE', 1, 1, 3, 1, 1, 100, FALSE, FALSE, FALSE, FALSE, 0, 0, 'Plan gratuit pour démarrer avec ReviewLottery'),
  ('plan_starter', 'STARTER', 3, 10, 10, 5, 5, 1000, TRUE, FALSE, FALSE, FALSE, 29.99, 299.99, 'Plan pour petites entreprises et commerces de proximité'),
  ('plan_pro', 'PRO', 999, 999, 999, 999, 999, 999999, TRUE, TRUE, TRUE, TRUE, 99.99, 999.99, 'Plan illimité pour grandes entreprises et franchises')
ON CONFLICT (plan) DO UPDATE SET
  max_brands = EXCLUDED.max_brands,
  max_stores_per_brand = EXCLUDED.max_stores_per_brand,
  max_prize_templates = EXCLUDED.max_prize_templates,
  max_prize_sets = EXCLUDED.max_prize_sets,
  max_campaigns = EXCLUDED.max_campaigns,
  max_participants = EXCLUDED.max_participants,
  custom_branding = EXCLUDED.custom_branding,
  advanced_analytics = EXCLUDED.advanced_analytics,
  api_access = EXCLUDED.api_access,
  priority_support = EXCLUDED.priority_support,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  description = EXCLUDED.description,
  updated_at = NOW();
