-- Ensure enum exists
DO $$ BEGIN
 CREATE TYPE "ConditionType" AS ENUM ('GOOGLE_REVIEW', 'INSTAGRAM_FOLLOW', 'TIKTOK_FOLLOW', 'NEWSLETTER', 'LOYALTY_PROGRAM', 'CUSTOM_REDIRECT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Convert type column from TEXT to enum in campaign_conditions
ALTER TABLE "campaign_conditions"
ALTER COLUMN "type" TYPE "ConditionType"
USING "type"::text::"ConditionType";
