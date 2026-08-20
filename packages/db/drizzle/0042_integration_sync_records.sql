CREATE TABLE "integration_sync_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "connection_id" uuid NOT NULL,
  "resource_type" text NOT NULL,
  "resource_id" uuid NOT NULL,
  "provider_event_id" text NOT NULL,
  "provider_url" text,
  "status" text DEFAULT 'created' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "integration_sync_records" ADD CONSTRAINT "integration_sync_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "integration_sync_records" ADD CONSTRAINT "integration_sync_records_connection_id_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."integration_connections"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "integration_sync_records_connection_resource_unique" ON "integration_sync_records" USING btree ("connection_id","resource_type","resource_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "integration_sync_records_connection_event_unique" ON "integration_sync_records" USING btree ("connection_id","provider_event_id");
--> statement-breakpoint
CREATE INDEX "integration_sync_records_org_resource_idx" ON "integration_sync_records" USING btree ("organization_id","resource_type","resource_id");
