-- Add tenant_id to location_grants; backfill from memberships.tenant_id
ALTER TABLE "location_grants" ADD COLUMN IF NOT EXISTS "tenant_id" uuid;

UPDATE "location_grants" lg
  SET "tenant_id" = m."tenant_id"
  FROM "memberships" m
  WHERE lg."membership_id" = m."id"
    AND lg."tenant_id" IS NULL;

ALTER TABLE "location_grants" ALTER COLUMN "tenant_id" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'location_grants_tenant_id_organizations_id_fk'
      AND table_name = 'location_grants'
  ) THEN
    ALTER TABLE "location_grants"
      ADD CONSTRAINT "location_grants_tenant_id_organizations_id_fk"
      FOREIGN KEY ("tenant_id")
      REFERENCES "organizations"("id")
      ON DELETE CASCADE;
  END IF;
END $$;
