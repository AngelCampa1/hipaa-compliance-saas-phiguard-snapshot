CREATE TABLE IF NOT EXISTS "referral_revenue_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "referral_id" uuid NOT NULL REFERENCES "referrals"("id") ON DELETE CASCADE,
  "partner_id" uuid NOT NULL REFERENCES "partners"("id") ON DELETE CASCADE,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "stripe_invoice_id" text NOT NULL,
  "amount_cents" integer NOT NULL,
  "paid_at" timestamp with time zone NOT NULL,
  "payout_id" uuid REFERENCES "partner_payouts"("id") ON DELETE SET NULL,
  "payout_allocated_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "referral_revenue_events_stripe_invoice_id_unique"
  ON "referral_revenue_events" ("stripe_invoice_id");

CREATE INDEX IF NOT EXISTS "referral_revenue_events_partner_paid_at_idx"
  ON "referral_revenue_events" ("partner_id", "paid_at");

CREATE INDEX IF NOT EXISTS "referral_revenue_events_referral_id_idx"
  ON "referral_revenue_events" ("referral_id");

CREATE INDEX IF NOT EXISTS "referral_revenue_events_payout_id_idx"
  ON "referral_revenue_events" ("payout_id");
