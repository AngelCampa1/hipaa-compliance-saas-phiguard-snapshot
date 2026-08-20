CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"ip" inet,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_audit_events_tenant_ts" ON "audit_events" ("tenant_id", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX "idx_audit_events_resource" ON "audit_events" ("resource_type", "resource_id");
--> statement-breakpoint
CREATE INDEX "idx_audit_events_actor_ts" ON "audit_events" ("actor_id", "created_at" DESC);
--> statement-breakpoint
CREATE OR REPLACE FUNCTION audit_events_block_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_events is append-only' USING ERRCODE = '45000';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER audit_events_no_update
  BEFORE UPDATE ON "audit_events"
  FOR EACH ROW EXECUTE FUNCTION audit_events_block_mutation();
--> statement-breakpoint
CREATE TRIGGER audit_events_no_delete
  BEFORE DELETE ON "audit_events"
  FOR EACH ROW EXECUTE FUNCTION audit_events_block_mutation();
--> statement-breakpoint
CREATE TRIGGER audit_events_no_truncate
  BEFORE TRUNCATE ON "audit_events"
  EXECUTE FUNCTION audit_events_block_mutation();
