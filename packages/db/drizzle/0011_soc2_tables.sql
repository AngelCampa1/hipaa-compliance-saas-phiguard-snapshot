CREATE TYPE "public"."soc2_framework" AS ENUM('SOC2');
--> statement-breakpoint
CREATE TYPE "public"."soc2_control_category" AS ENUM('CC1', 'CC2', 'CC3', 'CC4', 'CC5', 'CC6', 'CC7', 'CC8', 'CC9', 'A1', 'C1', 'PI1', 'P1');
--> statement-breakpoint
CREATE TYPE "public"."soc2_evidence_source" AS ENUM('audit_log', 'manual_upload', 'automated_check');
--> statement-breakpoint
CREATE TYPE "public"."access_review_status" AS ENUM('open', 'closed');
--> statement-breakpoint
CREATE TYPE "public"."review_decision" AS ENUM('keep', 'revoke', 'change_role');
--> statement-breakpoint
CREATE TABLE "soc2_controls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"framework" "soc2_framework" DEFAULT 'SOC2' NOT NULL,
	"control_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "soc2_control_category" NOT NULL,
	"tenant_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soc2_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"control_id" text NOT NULL,
	"source" "soc2_evidence_source" NOT NULL,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"file_key" text,
	"query_ref" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"status" "access_review_status" DEFAULT 'open' NOT NULL,
	"completed_by_user_id" uuid,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access_review_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"membership_id" uuid NOT NULL,
	"decision" "review_decision",
	"notes" text,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_review_items" ADD CONSTRAINT "access_review_items_review_id_access_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."access_reviews"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_soc2_controls_category" ON "soc2_controls" ("category");
--> statement-breakpoint
CREATE INDEX "idx_soc2_evidence_tenant_control" ON "soc2_evidence" ("tenant_id", "control_id");
--> statement-breakpoint
CREATE INDEX "idx_access_reviews_tenant_status" ON "access_reviews" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX "idx_access_review_items_review_id" ON "access_review_items" ("review_id");
