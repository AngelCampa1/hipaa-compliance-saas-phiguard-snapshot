-- Add WorkOS organization ID to organizations table
ALTER TABLE "organizations" ADD COLUMN "workos_organization_id" text;
--> statement-breakpoint

-- SSO connections
CREATE TYPE "public"."sso_connection_status" AS ENUM('active', 'inactive', 'pending');
--> statement-breakpoint
CREATE TABLE "sso_connections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "workos_connection_id" text NOT NULL,
  "domain" text NOT NULL,
  "status" "public"."sso_connection_status" DEFAULT 'pending' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "sso_connections_workos_connection_id_unique" UNIQUE("workos_connection_id")
);
--> statement-breakpoint
ALTER TABLE "sso_connections" ADD CONSTRAINT "sso_connections_organization_id_organizations_id_fk"
  FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- SCIM directories
CREATE TYPE "public"."scim_directory_status" AS ENUM('active', 'inactive');
--> statement-breakpoint
CREATE TABLE "scim_directories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "workos_directory_id" text NOT NULL,
  "bearer_token_hash" text NOT NULL,
  "status" "public"."scim_directory_status" DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "scim_directories_workos_directory_id_unique" UNIQUE("workos_directory_id")
);
--> statement-breakpoint
ALTER TABLE "scim_directories" ADD CONSTRAINT "scim_directories_organization_id_organizations_id_fk"
  FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
