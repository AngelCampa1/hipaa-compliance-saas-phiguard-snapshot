ALTER TABLE "memberships" RENAME COLUMN "organization_id" TO "tenant_id";--> statement-breakpoint
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_user_id_organization_id_unique";--> statement-breakpoint
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_tenant_id_unique" UNIQUE("user_id","tenant_id");--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_organizations_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
