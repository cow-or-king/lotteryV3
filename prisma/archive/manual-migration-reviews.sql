-- Migration manuelle - Système de Gestion des Avis Google
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Table Review
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "googleReviewId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "reviewUrl" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "hasResponse" BOOLEAN NOT NULL DEFAULT false,
    "responseContent" TEXT,
    "responsePublishedAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "participantId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Table ResponseTemplate
CREATE TABLE IF NOT EXISTS "ResponseTemplate" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResponseTemplate_pkey" PRIMARY KEY ("id")
);

-- Index uniques
CREATE UNIQUE INDEX IF NOT EXISTS "Review_googleReviewId_key" ON "Review"("googleReviewId");
CREATE UNIQUE INDEX IF NOT EXISTS "Review_storeId_googleReviewId_key" ON "Review"("storeId", "googleReviewId");

-- Index de performance
CREATE INDEX IF NOT EXISTS "Review_storeId_idx" ON "Review"("storeId");
CREATE INDEX IF NOT EXISTS "Review_status_idx" ON "Review"("status");
CREATE INDEX IF NOT EXISTS "Review_rating_idx" ON "Review"("rating");
CREATE INDEX IF NOT EXISTS "Review_hasResponse_idx" ON "Review"("hasResponse");
CREATE INDEX IF NOT EXISTS "Review_publishedAt_idx" ON "Review"("publishedAt");
CREATE INDEX IF NOT EXISTS "Review_participantId_idx" ON "Review"("participantId");

CREATE INDEX IF NOT EXISTS "ResponseTemplate_storeId_idx" ON "ResponseTemplate"("storeId");
CREATE INDEX IF NOT EXISTS "ResponseTemplate_category_idx" ON "ResponseTemplate"("category");
CREATE INDEX IF NOT EXISTS "ResponseTemplate_isActive_idx" ON "ResponseTemplate"("isActive");

-- Foreign Keys
ALTER TABLE "Review" ADD CONSTRAINT "Review_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_participantId_fkey"
    FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ResponseTemplate" ADD CONSTRAINT "ResponseTemplate_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Check Constraints
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_check"
    CHECK ("rating" >= 1 AND "rating" <= 5);

ALTER TABLE "Review" ADD CONSTRAINT "Review_status_check"
    CHECK ("status" IN ('PENDING', 'PROCESSED', 'ARCHIVED'));

ALTER TABLE "ResponseTemplate" ADD CONSTRAINT "ResponseTemplate_category_check"
    CHECK ("category" IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'CUSTOM'));

-- Trigger pour updatedAt automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_updated_at BEFORE UPDATE ON "Review"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_response_template_updated_at BEFORE UPDATE ON "ResponseTemplate"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour documentation
COMMENT ON TABLE "Review" IS 'Avis Google synchronisés et gérés';
COMMENT ON TABLE "ResponseTemplate" IS 'Templates de réponses aux avis';
COMMENT ON COLUMN "Review"."isVerified" IS 'Indique si l''avis a été vérifié pour participation à la loterie';
COMMENT ON COLUMN "Review"."status" IS 'PENDING=nouveau, PROCESSED=traité, ARCHIVED=archivé après 3 ans (RGPD)';
