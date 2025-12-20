-- CreateEnum
DO $$ BEGIN
 CREATE TYPE "ConditionType" AS ENUM ('GOOGLE_REVIEW', 'INSTAGRAM_FOLLOW', 'TIKTOK_FOLLOW', 'NEWSLETTER', 'LOYALTY_PROGRAM', 'CUSTOM_REDIRECT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "store_condition_completions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "condition_type" "ConditionType" NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_condition_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "store_condition_completions_email_storeId_idx" ON "store_condition_completions"("email", "store_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "store_condition_completions_storeId_idx" ON "store_condition_completions"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "store_condition_completions_email_store_id_condition_type_key" ON "store_condition_completions"("email", "store_id", "condition_type");

-- AddForeignKey
ALTER TABLE "store_condition_completions" ADD CONSTRAINT "store_condition_completions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
