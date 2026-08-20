-- Change organization_invitations.id from text to uuid
-- Drop the text default before changing the column type, then set a native uuid default
ALTER TABLE "organization_invitations" ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "organization_invitations"
  ALTER COLUMN "id" TYPE uuid USING "id"::uuid;

ALTER TABLE "organization_invitations"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
