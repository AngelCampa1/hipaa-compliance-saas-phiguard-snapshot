ALTER TABLE "partner_payouts"
  ADD COLUMN IF NOT EXISTS "external_reference" text,
  ADD COLUMN IF NOT EXISTS "paid_at" timestamp with time zone;

ALTER TABLE "partner_payouts"
  ADD CONSTRAINT "partner_payouts_paid_reference_check"
  CHECK (
    "status" != 'paid'
    OR (
      "external_reference" IS NOT NULL
      AND length(btrim("external_reference")) > 0
      AND "paid_at" IS NOT NULL
    )
  )
  NOT VALID;
