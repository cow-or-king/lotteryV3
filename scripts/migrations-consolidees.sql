-- =====================================================
-- MIGRATIONS CONSOLIDÉES - ReviewLottery V3
-- À exécuter sur la base de données de production
-- =====================================================
--
-- IMPORTANT: Vérifier que chaque migration n'a pas déjà été appliquée
-- avant d'exécuter ce script
--
-- Date de création: 2025-12-20
-- =====================================================

-- =====================================================
-- MIGRATION 1: Ajout du champ play_count aux participants
-- =====================================================
-- Permet de tracker combien de fois un participant a joué
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'participants' AND column_name = 'play_count'
    ) THEN
        ALTER TABLE participants
        ADD COLUMN play_count INTEGER DEFAULT 0 NOT NULL;

        COMMENT ON COLUMN participants.play_count IS 'Number of times the participant has played the game';
    END IF;
END $$;

-- =====================================================
-- MIGRATION 2: Ajout du champ min_days_between_plays aux campagnes
-- =====================================================
-- Permet de définir un délai minimum entre 2 participations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'min_days_between_plays'
    ) THEN
        ALTER TABLE campaigns
        ADD COLUMN min_days_between_plays INTEGER;

        COMMENT ON COLUMN campaigns.min_days_between_plays IS 'Minimum number of days between two plays for the same user';
    END IF;
END $$;

-- =====================================================
-- MIGRATION 3: Ajout du champ enables_game aux conditions de campagne
-- =====================================================
-- Permet de contrôler si une condition donne accès au jeu
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaign_conditions' AND column_name = 'enables_game'
    ) THEN
        ALTER TABLE campaign_conditions
        ADD COLUMN enables_game BOOLEAN DEFAULT true NOT NULL;

        COMMENT ON COLUMN campaign_conditions.enables_game IS 'Whether completing this condition gives access to the game';
    END IF;
END $$;

-- =====================================================
-- MIGRATION 4: Ajout du champ played_conditions aux participants
-- =====================================================
-- Permet de tracker quelles conditions ont donné accès au jeu
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'participants' AND column_name = 'played_conditions'
    ) THEN
        ALTER TABLE participants
        ADD COLUMN played_conditions JSONB DEFAULT '[]'::jsonb NOT NULL;

        COMMENT ON COLUMN participants.played_conditions IS 'Array of condition IDs for which the user has played the game';
    END IF;
END $$;

-- =====================================================
-- MIGRATION 5: Création de la table store_played_games
-- =====================================================
-- Track les jeux joués au niveau STORE par TYPE de condition
-- Évite qu'un utilisateur joue 2x pour Google Review dans 2 campagnes différentes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'store_played_games'
    ) THEN
        CREATE TABLE store_played_games (
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
        CREATE INDEX idx_store_played_games_email_store ON store_played_games(email, store_id);
        CREATE INDEX idx_store_played_games_type ON store_played_games(condition_type);

        -- Commentaires
        COMMENT ON TABLE store_played_games IS 'Track games played per condition type at store level (prevents duplicate games for same condition type across campaigns)';
        COMMENT ON COLUMN store_played_games.condition_type IS 'Type of condition that gave access to the game';
        COMMENT ON COLUMN store_played_games.email IS 'User email who played the game';
        COMMENT ON COLUMN store_played_games.store_id IS 'Store where the game was played';
        COMMENT ON COLUMN store_played_games.campaign_id IS 'Campaign where the game was played';
    END IF;
END $$;

-- =====================================================
-- FIN DES MIGRATIONS
-- =====================================================

-- Vérification finale
SELECT
    'Migrations terminées avec succès!' as message,
    NOW() as executed_at;

-- Liste des colonnes ajoutées
SELECT
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name IN ('participants', 'campaigns', 'campaign_conditions')
  AND column_name IN ('play_count', 'min_days_between_plays', 'enables_game', 'played_conditions')
ORDER BY table_name, column_name;

-- Vérification de la table store_played_games
SELECT
    COUNT(*) as store_played_games_exists
FROM information_schema.tables
WHERE table_name = 'store_played_games';
