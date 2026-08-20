ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "interested_plan" "plan";

CREATE TABLE IF NOT EXISTS "feature_usage" (
  "organization_id" uuid NOT NULL,
  "feature_key" text NOT NULL,
  "first_used_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
  "use_count" integer DEFAULT 1 NOT NULL,
  CONSTRAINT "feature_usage_pkey" PRIMARY KEY ("organization_id", "feature_key")
);

DO $$ BEGIN
  ALTER TABLE "feature_usage"
    ADD CONSTRAINT "feature_usage_organization_id_organizations_id_fk"
    FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
