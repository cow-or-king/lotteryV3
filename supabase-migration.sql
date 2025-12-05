-- ReviewLottery v3.0 - Database Schema
-- Execute this in Supabase SQL Editor

-- =====================
-- USERS & AUTHENTICATION
-- =====================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  hashed_password TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================
-- SUBSCRIPTIONS
-- =====================

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'FREE',
  status TEXT DEFAULT 'ACTIVE',
  stores_limit INT DEFAULT 1,
  campaigns_limit INT DEFAULT 0,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- =====================
-- STORES
-- =====================

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  google_place_id TEXT,
  google_business_url TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#5B21B6',
  secondary_color TEXT DEFAULT '#FACC15',
  font TEXT DEFAULT 'inter',
  is_active BOOLEAN DEFAULT true,
  is_paid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);

-- =====================
-- CAMPAIGNS
-- =====================

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  wheel_style TEXT DEFAULT 'classic',
  wheel_animation TEXT DEFAULT 'spin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaigns_store_id ON campaigns(store_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active_dates ON campaigns(is_active, start_date, end_date);

-- =====================
-- PRIZES
-- =====================

CREATE TABLE IF NOT EXISTS prizes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  value DOUBLE PRECISION,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  probability DOUBLE PRECISION NOT NULL,
  quantity INT NOT NULL,
  remaining INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prizes_campaign_id ON prizes(campaign_id);

-- =====================
-- PARTICIPANTS
-- =====================

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  has_played BOOLEAN DEFAULT false,
  played_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  has_reviewed BOOLEAN DEFAULT false,
  review_rating INT,
  review_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_campaign_id ON participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);

-- =====================
-- WINNERS
-- =====================

CREATE TABLE IF NOT EXISTS winners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  prize_id TEXT NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  participant_email TEXT NOT NULL,
  participant_name TEXT,
  claim_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'PENDING',
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_winners_claim_code ON winners(claim_code);
CREATE INDEX IF NOT EXISTS idx_winners_status ON winners(status);

-- =====================
-- GOOGLE REVIEWS
-- =====================

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  google_review_id TEXT UNIQUE NOT NULL,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_photo_url TEXT,
  rating INT NOT NULL,
  comment TEXT,
  review_time TIMESTAMP WITH TIME ZONE NOT NULL,
  response_text TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by TEXT,
  status TEXT DEFAULT 'NEW',
  sentiment TEXT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_store_id_status ON reviews(store_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_google_review_id ON reviews(google_review_id);

-- =====================
-- FUNCTIONS & TRIGGERS
-- =====================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_prizes_updated_at BEFORE UPDATE ON prizes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- =====================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- For now, we'll create basic policies
-- In production, these should be more restrictive

-- Users can read their own data
CREATE POLICY users_read_own ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Store owners can manage their stores
CREATE POLICY stores_manage_own ON stores
  FOR ALL USING (auth.uid()::text = owner_id);

-- Public can view active stores (for lottery participation)
CREATE POLICY stores_read_active ON stores
  FOR SELECT USING (is_active = true);

-- Campaign management by store owner
CREATE POLICY campaigns_manage ON campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = campaigns.store_id
      AND stores.owner_id = auth.uid()::text
    )
  );

-- Public can view active campaigns
CREATE POLICY campaigns_read_active ON campaigns
  FOR SELECT USING (is_active = true);

-- Similar patterns for other tables...

-- =====================
-- SEED DATA (Optional)
-- =====================

-- Create a test user (password: 'TestPassword123')
-- Note: In production, use proper password hashing
INSERT INTO users (email, email_verified, name)
VALUES ('admin@reviewlottery.com', true, 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Add a FREE subscription for the test user
INSERT INTO subscriptions (user_id, plan, status)
SELECT id, 'FREE', 'ACTIVE' FROM users WHERE email = 'admin@reviewlottery.com'
ON CONFLICT (user_id) DO NOTHING;

COMMIT;