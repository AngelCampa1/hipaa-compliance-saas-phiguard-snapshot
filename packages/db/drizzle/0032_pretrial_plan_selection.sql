ALTER TYPE "public"."plan_status" ADD VALUE IF NOT EXISTS 'selection_required';--> statement-breakpoint
ALTER TYPE "public"."plan_status" ADD VALUE IF NOT EXISTS 'trial_pending';--> statement-breakpoint
ALTER TABLE "organizations"
  ALTER COLUMN "plan_status" SET DEFAULT 'selection_required';--> statement-breakpoint
ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "plan_selected_at" timestamp with time zone;
