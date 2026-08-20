ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "terms_accepted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "terms_accepted_by_user_id" uuid;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'organizations_terms_accepted_by_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "organizations"
      ADD CONSTRAINT "organizations_terms_accepted_by_user_id_users_id_fk"
      FOREIGN KEY ("terms_accepted_by_user_id") REFERENCES "public"."users"("id")
      ON DELETE no action
      ON UPDATE no action;
  END IF;
END $$;
