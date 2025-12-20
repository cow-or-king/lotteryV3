-- Add played_conditions column to participants table
-- This tracks which conditions have had their associated game played

ALTER TABLE participants
ADD COLUMN played_conditions JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN participants.played_conditions IS 'Array of condition IDs for which the user has played the game';
