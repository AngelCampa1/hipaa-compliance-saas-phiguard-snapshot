CREATE TYPE "public"."integration_provider" AS ENUM('google', 'microsoft');
--> statement-breakpoint
CREATE TYPE "public"."integration_status" AS ENUM('active', 'revoked', 'error');
--> statement-breakpoint
CREATE TABLE "integration_connections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "location_id" uuid,
  "provider" "public"."integration_provider" NOT NULL,
  "account_email" text NOT NULL,
  "access_token_ciphertext" text NOT NULL,
  "refresh_token_ciphertext" text NOT NULL,
  "kms_key_id" text NOT NULL,
  "scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "status" "public"."integration_status" DEFAULT 'active' NOT NULL,
  "expires_at" timestamp with time zone,
  "installed_by_user_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_installed_by_user_id_users_id_fk" FOREIGN KEY ("installed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
