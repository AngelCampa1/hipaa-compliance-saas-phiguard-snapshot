ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "access_token_enc" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "refresh_token_enc" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "id_token_enc" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "token_kms_key_id" text;--> statement-breakpoint
