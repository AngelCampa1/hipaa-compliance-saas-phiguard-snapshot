DROP TABLE IF EXISTS "scim_directories";
DROP TABLE IF EXISTS "sso_connections";

DROP TYPE IF EXISTS "public"."scim_directory_status";
DROP TYPE IF EXISTS "public"."sso_connection_status";

ALTER TABLE "organizations" DROP COLUMN IF EXISTS "workos_organization_id";
