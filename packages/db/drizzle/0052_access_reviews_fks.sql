-- Adds missing foreign-key constraints to access_reviews and access_review_items.
-- Pre-existing rows that point at non-existent tenants, users, or memberships are
-- removed before constraint creation; these tables have always been empty in
-- production prior to this migration, so this is a safety guard, not data loss.

DELETE FROM "access_reviews"
WHERE "tenant_id" NOT IN (SELECT "id" FROM "organizations");
--> statement-breakpoint
UPDATE "access_reviews"
SET "completed_by_user_id" = NULL
WHERE "completed_by_user_id" IS NOT NULL
  AND "completed_by_user_id" NOT IN (SELECT "id" FROM "users");
--> statement-breakpoint
DELETE FROM "access_review_items"
WHERE "membership_id" NOT IN (SELECT "id" FROM "memberships");
--> statement-breakpoint
ALTER TABLE "access_reviews"
  ADD CONSTRAINT "access_reviews_tenant_id_organizations_id_fk"
  FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id")
  ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "access_reviews"
  ADD CONSTRAINT "access_reviews_completed_by_user_id_users_id_fk"
  FOREIGN KEY ("completed_by_user_id") REFERENCES "public"."users"("id")
  ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "access_review_items"
  ADD CONSTRAINT "access_review_items_membership_id_memberships_id_fk"
  FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id")
  ON DELETE cascade ON UPDATE no action;
