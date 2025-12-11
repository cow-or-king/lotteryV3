-- Migration: Ajouter le modèle Brand et migrer les données existantes
-- Étape 1: Créer la table brands
CREATE TABLE IF NOT EXISTS "brands" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "primary_color" TEXT NOT NULL DEFAULT '#5B21B6',
    "secondary_color" TEXT NOT NULL DEFAULT '#FACC15',
    "font" TEXT NOT NULL DEFAULT 'inter',
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Étape 2: Migrer les données des stores existants vers brands
-- Pour chaque enseigne unique (brandName + logoUrl), créer un brand
INSERT INTO "brands" ("id", "name", "logo_url", "owner_id", "primary_color", "secondary_color", "font", "is_paid", "created_at", "updated_at")
SELECT
    'brand_' || substr(md5(owner_id || brand_name || logo_url), 1, 25) as id,
    brand_name as name,
    logo_url,
    owner_id,
    COALESCE(primary_color, '#5B21B6') as primary_color,
    COALESCE(secondary_color, '#FACC15') as secondary_color,
    COALESCE(font, 'inter') as font,
    false as is_paid, -- La première enseigne est toujours gratuite
    MIN(created_at) as created_at,
    MAX(updated_at) as updated_at
FROM "stores"
GROUP BY owner_id, brand_name, logo_url, primary_color, secondary_color, font;

-- Étape 3: Ajouter la colonne brand_id aux stores
ALTER TABLE "stores" ADD COLUMN "brand_id" TEXT;

-- Étape 4: Remplir brand_id pour les stores existants
UPDATE "stores"
SET "brand_id" = (
    SELECT "id"
    FROM "brands"
    WHERE "brands"."owner_id" = "stores"."owner_id"
    AND "brands"."name" = "stores"."brand_name"
    AND "brands"."logo_url" = "stores"."logo_url"
    LIMIT 1
);

-- Étape 5: Rendre brand_id obligatoire
ALTER TABLE "stores" ALTER COLUMN "brand_id" SET NOT NULL;

-- Étape 6: Supprimer les anciennes colonnes de stores
ALTER TABLE "stores" DROP COLUMN "brand_name";
ALTER TABLE "stores" DROP COLUMN "logo_url";
ALTER TABLE "stores" DROP COLUMN "owner_id";
ALTER TABLE "stores" DROP COLUMN "primary_color";
ALTER TABLE "stores" DROP COLUMN "secondary_color";
ALTER TABLE "stores" DROP COLUMN "font";

-- Étape 7: Ajouter les contraintes
ALTER TABLE "brands" ADD CONSTRAINT "brands_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stores" ADD CONSTRAINT "stores_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Étape 8: Créer les index
CREATE INDEX "brands_owner_id_idx" ON "brands"("owner_id");
CREATE INDEX "brands_owner_id_created_at_idx" ON "brands"("owner_id", "created_at" DESC);
CREATE INDEX "stores_brand_id_idx" ON "stores"("brand_id");
CREATE INDEX "stores_brand_id_created_at_idx" ON "stores"("brand_id", "created_at" DESC);

-- Étape 9: Supprimer les anciens index de stores qui référençaient owner_id
DROP INDEX IF EXISTS "stores_owner_id_idx";
DROP INDEX IF EXISTS "stores_owner_id_created_at_idx";
