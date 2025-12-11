-- Migration: Add google_place_id to reviews table
-- Date: 2025-01-08

-- Add google_place_id column (NOT NULL to match schema)
-- Using empty string as default for existing rows
ALTER TABLE "reviews"
ADD COLUMN IF NOT EXISTS "google_place_id" TEXT NOT NULL DEFAULT '';

-- Note: You may want to update existing reviews with actual place IDs
-- Example: UPDATE reviews SET google_place_id = (SELECT google_place_id FROM stores WHERE stores.id = reviews.store_id);
