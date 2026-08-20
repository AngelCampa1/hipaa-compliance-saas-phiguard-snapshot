CREATE OR REPLACE FUNCTION enforce_organization_invitation_member_capacity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  organization_max_members integer;
  active_member_count integer;
  pending_invitation_count integer;
BEGIN
  IF NEW.status <> 'pending' THEN
    RETURN NEW;
  END IF;

  SELECT max_members
    INTO organization_max_members
    FROM organizations
    WHERE id = NEW.organization_id
    FOR UPDATE;

  IF organization_max_members IS NULL THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;

  SELECT COUNT(*)
    INTO active_member_count
    FROM memberships
    WHERE tenant_id = NEW.organization_id;

  SELECT COUNT(*)
    INTO pending_invitation_count
    FROM organization_invitations
    WHERE organization_id = NEW.organization_id
      AND status = 'pending'
      AND id <> NEW.id;

  IF active_member_count + pending_invitation_count >= organization_max_members THEN
    RAISE EXCEPTION 'Member limit reached for this plan';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS organization_invitation_member_capacity ON organization_invitations;

CREATE TRIGGER organization_invitation_member_capacity
  BEFORE INSERT OR UPDATE OF status
  ON organization_invitations
  FOR EACH ROW
  EXECUTE FUNCTION enforce_organization_invitation_member_capacity();
