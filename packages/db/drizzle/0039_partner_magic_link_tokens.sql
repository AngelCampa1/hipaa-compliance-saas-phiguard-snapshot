CREATE TABLE IF NOT EXISTS "partner_magic_link_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "partner_user_id" uuid NOT NULL,
  "token_hash" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "partner_magic_link_tokens_token_hash_unique" UNIQUE("token_hash")
);

DO $$ BEGIN
  ALTER TABLE "partner_magic_link_tokens"
    ADD CONSTRAINT "partner_magic_link_tokens_partner_user_id_partner_users_id_fk"
    FOREIGN KEY ("partner_user_id") REFERENCES "public"."partner_users"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "partner_magic_link_tokens_partner_user_id_idx"
  ON "partner_magic_link_tokens" USING btree ("partner_user_id");

CREATE INDEX IF NOT EXISTS "partner_magic_link_tokens_expires_at_idx"
  ON "partner_magic_link_tokens" USING btree ("expires_at");
