DELETE FROM "policy_acknowledgements" AS duplicate
USING "policy_acknowledgements" AS keeper
WHERE duplicate."policy_id" = keeper."policy_id"
  AND duplicate."user_id" = keeper."user_id"
  AND (
    duplicate."created_at" > keeper."created_at"
    OR (
      duplicate."created_at" = keeper."created_at"
      AND duplicate."id"::text > keeper."id"::text
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS "policy_acknowledgements_policy_user_unique"
  ON "policy_acknowledgements" ("policy_id", "user_id");
