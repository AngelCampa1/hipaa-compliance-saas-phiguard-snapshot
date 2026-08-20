ALTER TABLE "marketing_leads"
  ADD COLUMN IF NOT EXISTS "source_page_path" text,
  ADD COLUMN IF NOT EXISTS "cta_context" text;
