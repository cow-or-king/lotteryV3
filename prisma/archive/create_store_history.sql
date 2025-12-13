-- Create StoreHistory table for anti-fraud system
-- This table tracks deleted stores to prevent free plan abuse

CREATE TABLE IF NOT EXISTS "store_history" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "google_business_url" TEXT NOT NULL,
  "store_name" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "user_email" TEXT NOT NULL,
  "was_on_free_plan" BOOLEAN NOT NULL DEFAULT true,
  "deleted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "store_history_google_business_url_idx" ON "store_history"("google_business_url");
CREATE INDEX IF NOT EXISTS "store_history_user_id_idx" ON "store_history"("user_id");
CREATE INDEX IF NOT EXISTS "store_history_google_business_url_was_on_free_plan_idx" ON "store_history"("google_business_url", "was_on_free_plan");
