ALTER TABLE "integration_connections"
  ADD COLUMN IF NOT EXISTS "install_started_at" timestamp with time zone;
