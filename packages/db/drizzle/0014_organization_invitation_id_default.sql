DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns
      WHERE table_name = 'organization_invitations' AND column_name = 'id') = 'text' THEN
    ALTER TABLE "organization_invitations"
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
  END IF;
END $$;
