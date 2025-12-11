-- Migration: Add QR Code Scans Tracking
-- Date: 2025-12-11
-- Description: Ajoute la table qr_code_scans pour le tracking détaillé des scans

-- Create qr_code_scans table
CREATE TABLE IF NOT EXISTS "qr_code_scans" (
    "id" TEXT NOT NULL,
    "qr_code_id" TEXT NOT NULL,
    "user_agent" TEXT,
    "referrer" TEXT,
    "ip_address" TEXT,
    "language" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device_type" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_code_scans_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "qr_code_scans_qr_code_id_idx" ON "qr_code_scans"("qr_code_id");
CREATE INDEX IF NOT EXISTS "qr_code_scans_qr_code_id_scanned_at_idx" ON "qr_code_scans"("qr_code_id", "scanned_at" DESC);
CREATE INDEX IF NOT EXISTS "qr_code_scans_scanned_at_idx" ON "qr_code_scans"("scanned_at");

-- Add foreign key constraint
ALTER TABLE "qr_code_scans"
ADD CONSTRAINT "qr_code_scans_qr_code_id_fkey"
FOREIGN KEY ("qr_code_id")
REFERENCES "qr_codes"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
