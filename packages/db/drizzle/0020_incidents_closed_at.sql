-- Add closedAt timestamp to incidents table
-- Required for: HIPAA incident lifecycle tracking, SOC2 CC9.1 evidence
ALTER TABLE "incidents" ADD COLUMN "closed_at" timestamp with time zone;
