CREATE TYPE "public"."legal_document_type" AS ENUM('terms', 'baa');
--> statement-breakpoint
ALTER TABLE "organizations"
  ADD COLUMN "terms_accepted_at" timestamp with time zone,
  ADD COLUMN "terms_accepted_by_user_id" uuid;
--> statement-breakpoint
ALTER TABLE "organizations"
  ADD CONSTRAINT "organizations_terms_accepted_by_user_id_users_id_fk"
  FOREIGN KEY ("terms_accepted_by_user_id")
  REFERENCES "public"."users"("id")
  ON DELETE no action
  ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "legal_acceptances" (
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
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "legal_acceptances"
  ADD CONSTRAINT "legal_acceptances_tenant_id_organizations_id_fk"
  FOREIGN KEY ("tenant_id")
  REFERENCES "public"."organizations"("id")
  ON DELETE cascade
  ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "legal_acceptances"
  ADD CONSTRAINT "legal_acceptances_accepted_by_user_id_users_id_fk"
  FOREIGN KEY ("accepted_by_user_id")
  REFERENCES "public"."users"("id")
  ON DELETE no action
  ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_legal_acceptances_tenant_type_ts"
  ON "legal_acceptances" ("tenant_id", "document_type", "accepted_at" DESC);
