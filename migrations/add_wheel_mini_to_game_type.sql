-- Migration: Add WHEEL_MINI to GameType enum
-- Date: 2025-12-14
-- Description: Adds WHEEL_MINI value to the GameType enum for wheel mini games

-- Add WHEEL_MINI to GameType enum
ALTER TYPE "GameType" ADD VALUE IF NOT EXISTS 'WHEEL_MINI';
