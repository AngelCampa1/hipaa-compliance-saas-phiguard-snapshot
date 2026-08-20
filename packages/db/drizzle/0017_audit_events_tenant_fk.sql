-- Enforce referential integrity on audit_events.tenant_id
-- ON DELETE RESTRICT: audit trail must be preserved even if org is deleted
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'audit_events_tenant_id_fkey'
      AND table_name = 'audit_events'
  ) THEN
    ALTER TABLE "audit_events"
      ADD CONSTRAINT "audit_events_tenant_id_fkey"
      FOREIGN KEY ("tenant_id")
      REFERENCES "organizations"("id")
      ON DELETE RESTRICT;
  END IF;
END $$;
