ALTER TABLE "partners"
  ADD COLUMN IF NOT EXISTS "company" text,
  ADD COLUMN IF NOT EXISTS "website" text;
