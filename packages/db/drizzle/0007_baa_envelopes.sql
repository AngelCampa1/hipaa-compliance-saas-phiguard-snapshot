CREATE TYPE "public"."baa_envelope_status" AS ENUM(
  'pending',
  'sent',
  'viewed',
  'signed',
  'countersigned',
  'expired',
  'voided'
);
--> statement-breakpoint
CREATE TABLE "baa_envelopes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "status" "public"."baa_envelope_status" DEFAULT 'pending' NOT NULL,
  "docuseal_submission_id" text,
  "signer_user_id" uuid,
  "signer_email" text,
  "signing_url" text,
  "completed_at" timestamp with time zone,
  "s3_key" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "baa_envelopes" ADD CONSTRAINT "baa_envelopes_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "baa_envelopes" ADD CONSTRAINT "baa_envelopes_signer_user_id_users_id_fk" FOREIGN KEY ("signer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
