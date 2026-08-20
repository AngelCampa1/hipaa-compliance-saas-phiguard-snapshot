ALTER TABLE "task_assignments" ADD COLUMN "tenant_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE;
