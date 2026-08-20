CREATE TABLE IF NOT EXISTS "marketing_leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "magnet_slug" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "marketing_leads_magnet_slug_created_at_idx"
  ON "marketing_leads" ("magnet_slug", "created_at");

ALTER TABLE "marketing_leads"
  ADD CONSTRAINT "marketing_leads_email_slug_unique" UNIQUE ("email", "magnet_slug");
