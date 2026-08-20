-- Add total_paid_out_cents to referrals to prevent payout double-counting

ALTER TABLE "referrals" ADD COLUMN IF NOT EXISTS "total_paid_out_cents" integer NOT NULL DEFAULT 0;
