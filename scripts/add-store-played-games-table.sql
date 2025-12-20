-- Créer une table pour tracker les jeux joués au niveau STORE par TYPE de condition
-- Cela permet de gérer correctement les jeux entre différentes campagnes

CREATE TABLE IF NOT EXISTS store_played_games (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  store_id TEXT NOT NULL,
  condition_type "ConditionType" NOT NULL,
  campaign_id TEXT NOT NULL,
  played_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Un utilisateur ne peut jouer qu'une fois par type de condition par store
  CONSTRAINT unique_store_played_game UNIQUE (email, store_id, condition_type),

  -- Foreign keys
  CONSTRAINT fk_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT fk_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_store_played_games_email_store ON store_played_games(email, store_id);
CREATE INDEX IF NOT EXISTS idx_store_played_games_type ON store_played_games(condition_type);

-- Commentaires
COMMENT ON TABLE store_played_games IS 'Track games played per condition type at store level';
COMMENT ON COLUMN store_played_games.condition_type IS 'Type of condition that gave access to the game';
