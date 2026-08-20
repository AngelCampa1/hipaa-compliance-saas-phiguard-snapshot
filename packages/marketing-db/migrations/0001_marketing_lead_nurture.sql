PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS marketing_leads (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL,
  magnet_slug text NOT NULL,
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referrer text,
  source_page_path text,
  cta_context text,
  consent_marketing_at text,
  CONSTRAINT marketing_leads_email_slug_unique UNIQUE (email, magnet_slug)
);

CREATE INDEX IF NOT EXISTS marketing_leads_magnet_slug_created_at_idx
  ON marketing_leads (magnet_slug, created_at);

CREATE TABLE IF NOT EXISTS email_subscriptions (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  subscribed integer NOT NULL DEFAULT 1,
  unsubscribed_at text,
  unsubscribe_token text NOT NULL UNIQUE,
  source text,
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (subscribed IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nurture_sequences (
  id text PRIMARY KEY NOT NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  active integer NOT NULL DEFAULT 1,
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS nurture_steps (
  id text PRIMARY KEY NOT NULL,
  sequence_id text NOT NULL REFERENCES nurture_sequences(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  delay_hours integer NOT NULL,
  subject text NOT NULL,
  template_key text NOT NULL,
  active integer NOT NULL DEFAULT 1,
  CHECK (active IN (0, 1)),
  CONSTRAINT nurture_steps_sequence_order_unique UNIQUE (sequence_id, step_order)
);

CREATE TABLE IF NOT EXISTS nurture_enrollments (
  id text PRIMARY KEY NOT NULL,
  lead_id text NOT NULL REFERENCES marketing_leads(id) ON DELETE CASCADE,
  sequence_id text NOT NULL REFERENCES nurture_sequences(id) ON DELETE CASCADE,
  current_step integer NOT NULL DEFAULT 0,
  next_send_at text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'unsubscribed', 'bounced')),
  enrolled_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  completed_at text,
  claimed_at text,
  CONSTRAINT nurture_enrollments_lead_sequence_unique UNIQUE (lead_id, sequence_id)
);

CREATE INDEX IF NOT EXISTS nurture_enrollments_status_next_send_at_idx
  ON nurture_enrollments (status, next_send_at);

CREATE TABLE IF NOT EXISTS nurture_sends (
  id text PRIMARY KEY NOT NULL,
  enrollment_id text NOT NULL REFERENCES nurture_enrollments(id) ON DELETE CASCADE,
  step_id text NOT NULL REFERENCES nurture_steps(id),
  sent_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  resend_message_id text,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')),
  CONSTRAINT nurture_sends_enrollment_step_unique UNIQUE (enrollment_id, step_id)
);

CREATE INDEX IF NOT EXISTS nurture_sends_enrollment_id_idx
  ON nurture_sends (enrollment_id);
