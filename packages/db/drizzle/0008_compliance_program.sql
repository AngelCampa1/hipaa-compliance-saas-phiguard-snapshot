-- Compliance Program Add-on: policies, training, risk assessments, and vendor BAA management
-- PHI tables: policy_acknowledgements, training_records, vendor_baas

-- Enums
CREATE TYPE "public"."policy_status" AS ENUM('draft', 'published', 'archived');
--> statement-breakpoint
CREATE TYPE "public"."training_status" AS ENUM('not_started', 'in_progress', 'completed', 'overdue');
--> statement-breakpoint
CREATE TYPE "public"."risk_assessment_status" AS ENUM('open', 'in_review', 'closed');
--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high', 'critical');
--> statement-breakpoint
CREATE TYPE "public"."vendor_status" AS ENUM('active', 'inactive', 'pending_baa');
--> statement-breakpoint

-- Non-PHI: program policies (separate from compliance-starter policies)
CREATE TABLE "program_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"location_id" uuid,
	"title" text NOT NULL,
	"body_markdown" text NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"effective_date" timestamp with time zone,
	"requires_acknowledgement" boolean DEFAULT true NOT NULL,
	"status" "policy_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- PHI: policy acknowledgements (ties user identity to compliance action)
CREATE TABLE "policy_acknowledgements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"policy_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"acknowledged_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Non-PHI: training course catalog
CREATE TABLE "training_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"frequency_days" integer DEFAULT 365 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- PHI: training records (ties user to course completion)
CREATE TABLE "training_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"status" "training_status" DEFAULT 'not_started' NOT NULL,
	"completed_at" timestamp with time zone,
	"due_at" timestamp with time zone NOT NULL,
	"certificate_file_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Non-PHI: risk assessments
CREATE TABLE "risk_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" "risk_assessment_status" DEFAULT 'open' NOT NULL,
	"reviewer_id" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Non-PHI: risk items within assessments
CREATE TABLE "risk_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"likelihood" integer NOT NULL,
	"impact" integer NOT NULL,
	"score" integer NOT NULL,
	"mitigation" text DEFAULT '' NOT NULL,
	"owner_id" uuid,
	"due_at" timestamp with time zone,
	"status" "risk_level" DEFAULT 'medium' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Non-PHI: vendor catalog
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"contact_email" text,
	"data_categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "vendor_status" DEFAULT 'pending_baa' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- PHI: vendor BAA records (contains signer PII)
CREATE TABLE "vendor_baas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"signed_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"document_file_key" text,
	"signer_name" text NOT NULL,
	"signer_email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Foreign key constraints
ALTER TABLE "program_policies" ADD CONSTRAINT "program_policies_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "program_policies" ADD CONSTRAINT "program_policies_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "policy_acknowledgements" ADD CONSTRAINT "policy_acknowledgements_policy_id_program_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."program_policies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "policy_acknowledgements" ADD CONSTRAINT "policy_acknowledgements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_courses" ADD CONSTRAINT "training_courses_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_course_id_training_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."training_courses"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "risk_items" ADD CONSTRAINT "risk_items_assessment_id_risk_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."risk_assessments"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "risk_items" ADD CONSTRAINT "risk_items_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "vendor_baas" ADD CONSTRAINT "vendor_baas_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
