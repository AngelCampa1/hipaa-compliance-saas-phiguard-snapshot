DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'legal_document_type'
  ) THEN
    CREATE TYPE "public"."legal_document_type" AS ENUM('terms', 'baa');
  END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legal_acceptances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "document_type" "public"."legal_document_type" NOT NULL,
  "document_version" text NOT NULL,
  "document_title" text NOT NULL,
  "content_hash" text NOT NULL,
  "customer_entity_name" text NOT NULL,
  "signer_name" text NOT NULL,
  "signer_title" text NOT NULL,
  "signer_email" text NOT NULL,
  "accepted_by_user_id" uuid NOT NULL,
  "accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
  "ip" inet,
  "user_agent" text,
  "snapshot" jsonb NOT NULL,
  "executed_pdf_base64" text,
  "executed_pdf_sha256" text,
  "executed_pdf_size_bytes" integer,
  "executed_pdf_mime_type" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'legal_acceptances'
      AND column_name = 'executed_pdf_base64'
  ) THEN
    ALTER TABLE "legal_acceptances" ADD COLUMN "executed_pdf_base64" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'legal_acceptances'
      AND column_name = 'executed_pdf_sha256'
  ) THEN
    ALTER TABLE "legal_acceptances" ADD COLUMN "executed_pdf_sha256" text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'legal_acceptances'
      AND column_name = 'executed_pdf_size_bytes'
  ) THEN
    ALTER TABLE "legal_acceptances" ADD COLUMN "executed_pdf_size_bytes" integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'legal_acceptances'
      AND column_name = 'executed_pdf_mime_type'
  ) THEN
    ALTER TABLE "legal_acceptances" ADD COLUMN "executed_pdf_mime_type" text;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'legal_acceptances_tenant_id_organizations_id_fk'
  ) THEN
    ALTER TABLE "legal_acceptances"
      ADD CONSTRAINT "legal_acceptances_tenant_id_organizations_id_fk"
      FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'legal_acceptances_accepted_by_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "legal_acceptances"
      ADD CONSTRAINT "legal_acceptances_accepted_by_user_id_users_id_fk"
      FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."users"("id")
      ON DELETE no action ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_legal_acceptances_tenant_type_ts"
  ON "legal_acceptances" ("tenant_id", "document_type", "accepted_at" DESC);
