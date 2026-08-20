-- PHI table: incident_updates stores free-form notes on incidents that may contain patient context.
-- Append-only by application convention; no UPDATE or DELETE expected from app code.
-- References incidents(id) with ON DELETE CASCADE so updates are removed when an incident is deleted.
CREATE TABLE IF NOT EXISTS "incident_updates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "incident_id" uuid NOT NULL REFERENCES "incidents"("id") ON DELETE CASCADE,
  "author_id" uuid NOT NULL,
  "text" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_incident_updates_incident_id" ON "incident_updates" ("incident_id");
--> statement-breakpoint
CREATE INDEX "idx_incident_updates_tenant_id" ON "incident_updates" ("tenant_id");
