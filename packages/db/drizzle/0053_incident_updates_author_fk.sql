-- Adds the missing foreign-key constraint on incident_updates.author_id, which
-- already references users semantically but was not declared as a SQL FK. The
-- table is append-only PHI, so NO ACTION (the default) is the correct policy:
-- a user with attached incident updates cannot be hard-deleted, preserving the
-- HIPAA audit chain.

DELETE FROM "incident_updates"
WHERE "author_id" NOT IN (SELECT "id" FROM "users");
--> statement-breakpoint
ALTER TABLE "incident_updates"
  ADD CONSTRAINT "incident_updates_author_id_users_id_fk"
  FOREIGN KEY ("author_id") REFERENCES "public"."users"("id")
  ON DELETE no action ON UPDATE no action;
