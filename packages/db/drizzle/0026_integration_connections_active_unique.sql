WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY organization_id, provider
      ORDER BY created_at DESC, updated_at DESC, id DESC
    ) AS rn
  FROM integration_connections
  WHERE status = 'active'
)
UPDATE integration_connections AS ic
SET status = 'revoked',
    updated_at = now()
FROM ranked
WHERE ic.id = ranked.id
  AND ranked.rn > 1;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "integration_connections_org_provider_active_unique"
  ON "integration_connections" ("organization_id", "provider")
  WHERE "status" = 'active';
