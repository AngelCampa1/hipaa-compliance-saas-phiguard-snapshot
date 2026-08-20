ALTER TABLE "organizations"
  ADD COLUMN "trial_started_at" timestamp with time zone,
  ADD COLUMN "trial_ends_at" timestamp with time zone;
