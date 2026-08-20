-- Migration: nurture sequencer tables + email subscriptions + marketing_leads UTM columns

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE "nurture_enrollment_status" AS ENUM ('active', 'completed', 'unsubscribed', 'bounced');
CREATE TYPE "nurture_send_status" AS ENUM ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained');

-- ---------------------------------------------------------------------------
-- nurture_sequences
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "nurture_sequences" (
  "id"          uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug"        text        NOT NULL,
  "name"        text        NOT NULL,
  "description" text,
  "active"      boolean     NOT NULL DEFAULT true,
  "created_at"  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "nurture_sequences"
  ADD CONSTRAINT "nurture_sequences_slug_unique" UNIQUE ("slug");

-- ---------------------------------------------------------------------------
-- nurture_steps
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "nurture_steps" (
  "id"           uuid    PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "sequence_id"  uuid    NOT NULL,
  "step_order"   integer NOT NULL,
  "delay_hours"  integer NOT NULL,
  "subject"      text    NOT NULL,
  "template_key" text    NOT NULL,
  "active"       boolean NOT NULL DEFAULT true
);

ALTER TABLE "nurture_steps"
  ADD CONSTRAINT "nurture_steps_sequence_id_nurture_sequences_id_fk"
  FOREIGN KEY ("sequence_id") REFERENCES "nurture_sequences"("id") ON DELETE CASCADE;

ALTER TABLE "nurture_steps"
  ADD CONSTRAINT "nurture_steps_sequence_order_unique" UNIQUE ("sequence_id", "step_order");

-- ---------------------------------------------------------------------------
-- nurture_enrollments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "nurture_enrollments" (
  "id"           uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id"      uuid        NOT NULL,
  "sequence_id"  uuid        NOT NULL,
  "current_step" integer     NOT NULL DEFAULT 0,
  "next_send_at" timestamptz NOT NULL,
  "status"       nurture_enrollment_status NOT NULL DEFAULT 'active',
  "enrolled_at"  timestamptz NOT NULL DEFAULT now(),
  "completed_at" timestamptz
);

ALTER TABLE "nurture_enrollments"
  ADD CONSTRAINT "nurture_enrollments_lead_id_marketing_leads_id_fk"
  FOREIGN KEY ("lead_id") REFERENCES "marketing_leads"("id") ON DELETE CASCADE;

ALTER TABLE "nurture_enrollments"
  ADD CONSTRAINT "nurture_enrollments_sequence_id_nurture_sequences_id_fk"
  FOREIGN KEY ("sequence_id") REFERENCES "nurture_sequences"("id") ON DELETE CASCADE;

ALTER TABLE "nurture_enrollments"
  ADD CONSTRAINT "nurture_enrollments_lead_sequence_unique" UNIQUE ("lead_id", "sequence_id");

-- Runner's hot query path: fetch due active enrollments
CREATE INDEX IF NOT EXISTS "nurture_enrollments_status_next_send_at_idx"
  ON "nurture_enrollments" ("status", "next_send_at");

-- ---------------------------------------------------------------------------
-- nurture_sends
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "nurture_sends" (
  "id"                 uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "enrollment_id"      uuid        NOT NULL,
  "step_id"            uuid        NOT NULL,
  "sent_at"            timestamptz NOT NULL DEFAULT now(),
  "resend_message_id"  text,
  "status"             nurture_send_status NOT NULL DEFAULT 'sent'
);

ALTER TABLE "nurture_sends"
  ADD CONSTRAINT "nurture_sends_enrollment_id_nurture_enrollments_id_fk"
  FOREIGN KEY ("enrollment_id") REFERENCES "nurture_enrollments"("id") ON DELETE CASCADE;

ALTER TABLE "nurture_sends"
  ADD CONSTRAINT "nurture_sends_step_id_nurture_steps_id_fk"
  FOREIGN KEY ("step_id") REFERENCES "nurture_steps"("id");

CREATE INDEX IF NOT EXISTS "nurture_sends_enrollment_id_idx"
  ON "nurture_sends" ("enrollment_id");

-- ---------------------------------------------------------------------------
-- email_subscriptions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "email_subscriptions" (
  "id"                 uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email"              text        NOT NULL,
  "subscribed"         boolean     NOT NULL DEFAULT true,
  "unsubscribed_at"    timestamptz,
  "unsubscribe_token"  text        NOT NULL,
  "source"             text,
  "created_at"         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "email_subscriptions"
  ADD CONSTRAINT "email_subscriptions_email_unique" UNIQUE ("email");

ALTER TABLE "email_subscriptions"
  ADD CONSTRAINT "email_subscriptions_unsubscribe_token_unique" UNIQUE ("unsubscribe_token");

-- ---------------------------------------------------------------------------
-- marketing_leads - add UTM attribution + consent column
-- ---------------------------------------------------------------------------
ALTER TABLE "marketing_leads"
  ADD COLUMN IF NOT EXISTS "utm_source"          text,
  ADD COLUMN IF NOT EXISTS "utm_medium"          text,
  ADD COLUMN IF NOT EXISTS "utm_campaign"        text,
  ADD COLUMN IF NOT EXISTS "utm_content"         text,
  ADD COLUMN IF NOT EXISTS "referrer"            text,
  ADD COLUMN IF NOT EXISTS "consent_marketing_at" timestamptz;
