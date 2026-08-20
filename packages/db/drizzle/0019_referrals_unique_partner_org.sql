CREATE UNIQUE INDEX IF NOT EXISTS "referrals_partner_id_organization_id_unique"
  ON "referrals" ("partner_id", "organization_id");
