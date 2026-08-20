ALTER TABLE organizations
  ALTER COLUMN created_at TYPE timestamptz,
  ALTER COLUMN updated_at TYPE timestamptz;
ALTER TABLE users
  ALTER COLUMN created_at TYPE timestamptz,
  ALTER COLUMN updated_at TYPE timestamptz;
ALTER TABLE memberships
  ALTER COLUMN created_at TYPE timestamptz,
  ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE tasks
  ALTER COLUMN created_at TYPE timestamptz,
  ALTER COLUMN updated_at TYPE timestamptz;

ALTER TABLE task_comments
  ALTER COLUMN created_at TYPE timestamptz,
  ALTER COLUMN updated_at TYPE timestamptz;
