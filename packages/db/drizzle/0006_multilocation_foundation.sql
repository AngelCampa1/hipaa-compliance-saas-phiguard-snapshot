ALTER TYPE "public"."role" RENAME TO "role_old";
--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('org_owner', 'org_admin', 'location_manager', 'location_staff');
--> statement-breakpoint
ALTER TABLE "memberships" ALTER COLUMN "role" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "organization_invitations" ALTER COLUMN "role" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "memberships"
  ALTER COLUMN "role" TYPE "public"."role"
  USING (
    CASE "role"::text
      WHEN 'owner' THEN 'org_owner'
      WHEN 'admin' THEN 'org_admin'
      WHEN 'staff' THEN 'location_staff'
      ELSE 'location_staff'
    END
  )::"public"."role";
--> statement-breakpoint
ALTER TABLE "organization_invitations"
  ALTER COLUMN "role" TYPE "public"."role"
  USING (
    CASE "role"::text
      WHEN 'owner' THEN 'org_owner'
      WHEN 'admin' THEN 'org_admin'
      WHEN 'staff' THEN 'location_staff'
      ELSE 'location_staff'
    END
  )::"public"."role";
--> statement-breakpoint
ALTER TABLE "memberships" ALTER COLUMN "role" SET DEFAULT 'location_staff';
--> statement-breakpoint
ALTER TABLE "organization_invitations" ALTER COLUMN "role" SET DEFAULT 'location_staff';
--> statement-breakpoint
DROP TYPE "public"."role_old";
--> statement-breakpoint

CREATE TYPE "public"."location_status" AS ENUM('active', 'inactive');
--> statement-breakpoint
CREATE TABLE "locations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "status" "public"."location_status" DEFAULT 'active' NOT NULL,
  "is_primary" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "locations_organization_id_slug_unique" UNIQUE("organization_id","slug")
);
--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

INSERT INTO "locations" ("organization_id", "name", "slug", "is_primary")
SELECT
  o."id",
  o."name",
  'primary',
  true
FROM "organizations" o;
--> statement-breakpoint

CREATE TABLE "location_grants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "membership_id" uuid NOT NULL,
  "location_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "location_grants_membership_id_location_id_unique" UNIQUE("membership_id","location_id")
);
--> statement-breakpoint
ALTER TABLE "location_grants" ADD CONSTRAINT "location_grants_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "location_grants" ADD CONSTRAINT "location_grants_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

INSERT INTO "location_grants" ("membership_id", "location_id")
SELECT
  m."id",
  l."id"
FROM "memberships" m
INNER JOIN "locations" l
  ON l."organization_id" = m."tenant_id"
 AND l."is_primary" = true
WHERE m."role" IN ('location_manager', 'location_staff');
--> statement-breakpoint

ALTER TABLE "tasks" ADD COLUMN "location_id" uuid;
--> statement-breakpoint
UPDATE "tasks" t
SET "location_id" = l."id"
FROM "locations" l
WHERE l."organization_id" = t."tenant_id"
  AND l."is_primary" = true;
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "location_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "checklists" ADD COLUMN "location_id" uuid;
--> statement-breakpoint
UPDATE "checklists" c
SET "location_id" = l."id"
FROM "locations" l
WHERE l."organization_id" = c."tenant_id"
  AND l."is_primary" = true;
--> statement-breakpoint
ALTER TABLE "checklists" ALTER COLUMN "location_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "checklists" ADD CONSTRAINT "checklists_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "checklist_items" ADD COLUMN "location_id" uuid;
--> statement-breakpoint
UPDATE "checklist_items" i
SET "location_id" = COALESCE(c."location_id", l."id")
FROM "checklists" c,
     "locations" l
WHERE c."id" = i."checklist_id"
  AND l."organization_id" = i."tenant_id"
  AND l."is_primary" = true;
--> statement-breakpoint
ALTER TABLE "checklist_items" ALTER COLUMN "location_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "incidents" ADD COLUMN "location_id" uuid;
--> statement-breakpoint
UPDATE "incidents" i
SET "location_id" = l."id"
FROM "locations" l
WHERE l."organization_id" = i."tenant_id"
  AND l."is_primary" = true;
--> statement-breakpoint
ALTER TABLE "incidents" ALTER COLUMN "location_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "audit_events" ADD COLUMN "location_id" uuid;
--> statement-breakpoint

CREATE TYPE "public"."policy_assignment_status" AS ENUM('assigned', 'completed');
--> statement-breakpoint
CREATE TABLE "policy_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "policy_id" uuid NOT NULL,
  "location_id" uuid NOT NULL,
  "status" "public"."policy_assignment_status" DEFAULT 'assigned' NOT NULL,
  "due_at" timestamp with time zone,
  "assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
  "assigned_by" uuid,
  "completed_at" timestamp with time zone,
  "completed_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "policy_assignments_policy_id_location_id_unique" UNIQUE("policy_id","location_id")
);
--> statement-breakpoint
ALTER TABLE "policy_assignments" ADD CONSTRAINT "policy_assignments_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "policy_assignments" ADD CONSTRAINT "policy_assignments_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "policy_assignments" ADD CONSTRAINT "policy_assignments_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "policy_assignments" ADD CONSTRAINT "policy_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "policy_assignments" ADD CONSTRAINT "policy_assignments_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
