-- Add lookup_count to phone_numbers for activity tracking
ALTER TABLE "phone_numbers" ADD COLUMN IF NOT EXISTS "lookup_count" INT NOT NULL DEFAULT 0;
