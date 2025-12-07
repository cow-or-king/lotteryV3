-- AlterTable
ALTER TABLE "prize_templates"
  ADD COLUMN "owner_id" TEXT,
  ALTER COLUMN "brand_id" DROP NOT NULL;

-- Migrate existing data: set owner_id from brand's owner_id
UPDATE "prize_templates" pt
SET "owner_id" = b."owner_id"
FROM "brands" b
WHERE pt."brand_id" = b."id";

-- Make owner_id NOT NULL after data migration
ALTER TABLE "prize_templates"
  ALTER COLUMN "owner_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "prize_templates_owner_id_idx" ON "prize_templates"("owner_id");

-- CreateIndex
CREATE INDEX "prize_templates_owner_id_created_at_idx" ON "prize_templates"("owner_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "prize_templates" ADD CONSTRAINT "prize_templates_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
