-- Make phoneNumber optional and add email as unique login identifier
ALTER TABLE "users" ALTER COLUMN "phone_number" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" TEXT;

-- For any existing rows without email, generate a placeholder so unique constraint doesn't fail
UPDATE "users" SET "email" = CONCAT('legacy_', id, '@clearring.local') WHERE "email" IS NULL;

-- Now make email required and unique
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
