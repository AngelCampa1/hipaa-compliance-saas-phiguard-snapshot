DO $$
DECLARE
  has_baa_envelopes boolean;
  has_organization_baa_envelope_references boolean;
BEGIN
  IF to_regclass('public.baa_envelopes') IS NOT NULL THEN
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.baa_envelopes LIMIT 1)'
      INTO has_baa_envelopes;

    IF has_baa_envelopes THEN
      RAISE EXCEPTION 'Refusing to drop baa_envelopes while rows exist; archive or migrate BAA envelope evidence first.';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'organizations'
      AND column_name = 'baa_envelope_id'
  ) THEN
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.organizations WHERE baa_envelope_id IS NOT NULL LIMIT 1)'
      INTO has_organization_baa_envelope_references;

    IF has_organization_baa_envelope_references THEN
      RAISE EXCEPTION 'Refusing to drop organizations.baa_envelope_id while references exist; archive or migrate BAA envelope references first.';
    END IF;
  END IF;
END $$;
--> statement-breakpoint
DROP TABLE IF EXISTS "baa_envelopes";
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."baa_envelope_status";
--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN IF EXISTS "baa_envelope_id";
