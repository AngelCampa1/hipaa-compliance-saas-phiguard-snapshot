import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest'
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { execFileSync } from 'node:child_process'
import { writeAuditEvent, withAuditContext, getAuditContext } from '../write.js'
import { logger } from '../logger.js'
import { auditEvents } from '../schema/audit-events.phi.js'
import { eq, sql as drizzleSql } from 'drizzle-orm'

type DB = ReturnType<typeof drizzle<{ auditEvents: typeof auditEvents }>>

let db: DB
let sql: ReturnType<typeof postgres>
let container: StartedPostgreSqlContainer
let containerRuntimeUnavailable = false

function isMissingContainerError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('no such container') ||
    message.includes('No such container') ||
    message.includes('Could not find a working container runtime strategy')
  )
}

function isConnectTimeoutError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message.includes('CONNECT_TIMEOUT')
}

function hasContainerRuntime() {
  if (
    process.env.DOCKER_HOST ||
    process.env.TESTCONTAINERS_HOST_OVERRIDE ||
    process.env.TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE
  ) {
    return true
  }

  try {
    execFileSync('docker', ['info'], { stdio: 'ignore', timeout: 5_000 })
    return true
  } catch {
    if (process.env.CI === 'true') {
      throw new Error('Container runtime is required for audit DB-backed tests in CI')
    }

    return false
  }
}

async function startTestContainer() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await new PostgreSqlContainer('postgres:16-alpine').start()
    } catch (error) {
      if (!isMissingContainerError(error) || attempt > 0) {
        throw error
      }
    }
  }

  throw new Error('Failed to start PostgreSQL test container')
}

function buildReachableConnectionString(container: StartedPostgreSqlContainer) {
  const connectionUrl = new URL(container.getConnectionUri())
  const host = container.getHost()

  // Windows/Docker setups can expose the mapped port on 127.0.0.1 even when
  // the generated URI still uses localhost, which leads to CONNECT_TIMEOUTs.
  connectionUrl.hostname = host === 'localhost' ? '127.0.0.1' : host

  return connectionUrl.toString()
}

async function createSqlClient(connectionString: string) {
  let lastError: unknown

  for (let attempt = 0; attempt < 6; attempt++) {
    const client = postgres(connectionString, {
      max: 1,
      connect_timeout: 5,
    })

    try {
      await client.unsafe('SELECT 1;')
      return client
    } catch (error) {
      lastError = error
      await client.end().catch(() => {})

      if (isConnectTimeoutError(error) && attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, 1_000 * (attempt + 1)))
        continue
      }

      if (!isConnectTimeoutError(error) || attempt > 0) {
        throw error
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

function collectErrorMessages(error: unknown): string[] {
  const messages: string[] = []
  let current: unknown = error

  while (current instanceof Error) {
    messages.push(current.message)
    current = current.cause
  }

  return messages
}

async function expectAppendOnlyFailure(operation: Promise<unknown>) {
  try {
    await operation
    throw new Error('Expected audit_events mutation to fail')
  } catch (error) {
    const messages = collectErrorMessages(error)
    expect(messages.some((message) => message.includes('append-only'))).toBe(true)
  }
}

beforeAll(async () => {
  if (!hasContainerRuntime()) {
    containerRuntimeUnavailable = true
    return
  }

  try {
    container = await startTestContainer()
  } catch (error) {
    if (!isMissingContainerError(error)) {
      throw error
    }

    containerRuntimeUnavailable = true
    return
  }

  sql = await createSqlClient(buildReachableConnectionString(container))

  await sql.unsafe('CREATE EXTENSION IF NOT EXISTS pgcrypto;')
  await sql.unsafe(`
    CREATE TABLE "audit_events" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "tenant_id" uuid NOT NULL,
      "location_id" uuid,
      "actor_id" text NOT NULL,
      "action" text NOT NULL,
      "resource_type" text NOT NULL,
      "resource_id" text NOT NULL,
      "before" jsonb,
      "after" jsonb,
      "ip" inet,
      "user_agent" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `)
  await sql.unsafe(`
    CREATE INDEX "idx_audit_events_tenant_ts"
      ON "audit_events" ("tenant_id", "created_at" DESC);
  `)
  await sql.unsafe(`
    CREATE INDEX "idx_audit_events_resource"
      ON "audit_events" ("resource_type", "resource_id");
  `)
  await sql.unsafe(`
    CREATE INDEX "idx_audit_events_actor_ts"
      ON "audit_events" ("actor_id", "created_at" DESC);
  `)
  await sql.unsafe(`
    CREATE OR REPLACE FUNCTION audit_events_block_mutation()
    RETURNS TRIGGER AS $$
    BEGIN
      RAISE EXCEPTION 'audit_events is append-only' USING ERRCODE = '45000';
    END;
    $$ LANGUAGE plpgsql;
  `)
  await sql.unsafe(`
    CREATE TRIGGER audit_events_no_update
      BEFORE UPDATE ON "audit_events"
      FOR EACH ROW EXECUTE FUNCTION audit_events_block_mutation();
  `)
  await sql.unsafe(`
    CREATE TRIGGER audit_events_no_delete
      BEFORE DELETE ON "audit_events"
      FOR EACH ROW EXECUTE FUNCTION audit_events_block_mutation();
  `)
  await sql.unsafe(`
    CREATE TRIGGER audit_events_no_truncate
      BEFORE TRUNCATE ON "audit_events"
      EXECUTE FUNCTION audit_events_block_mutation();
  `)

  db = drizzle(sql, { schema: { auditEvents } })
})

afterAll(async () => {
  await sql?.end()
  await container?.stop()
})

function skipWhenContainerRuntimeUnavailable() {
  if (!containerRuntimeUnavailable) {
    return false
  }

  expect(containerRuntimeUnavailable).toBe(true)
  return true
}

describe('audit_events table', () => {
  it('INSERT into audit_events succeeds and row is readable', async () => {
    if (skipWhenContainerRuntimeUnavailable()) return

    const [row] = await db
      .insert(auditEvents)
      .values({
        tenantId: '00000000-0000-0000-0000-000000000001',
        actorId: 'user-1',
        action: 'task.created',
        resourceType: 'task',
        resourceId: 'task-1',
      })
      .returning()

    expect(row).toBeDefined()
    expect(row.id).toBeTruthy()
    expect(row.action).toBe('task.created')
    expect(row.resourceType).toBe('task')
    expect(row.createdAt).toBeInstanceOf(Date)
  })

  it('UPDATE on audit_events throws with SQLSTATE 45000 trigger error', async () => {
    if (skipWhenContainerRuntimeUnavailable()) return

    const [row] = await db
      .insert(auditEvents)
      .values({
        tenantId: '00000000-0000-0000-0000-000000000001',
        actorId: 'user-1',
        action: 'task.updated',
        resourceType: 'task',
        resourceId: 'task-2',
      })
      .returning()

    await expectAppendOnlyFailure(
      db.update(auditEvents).set({ action: 'tampered' }).where(eq(auditEvents.id, row.id)),
    )
  })

  it('DELETE on audit_events throws with SQLSTATE 45000 trigger error', async () => {
    if (skipWhenContainerRuntimeUnavailable()) return

    const [row] = await db
      .insert(auditEvents)
      .values({
        tenantId: '00000000-0000-0000-0000-000000000001',
        actorId: 'user-1',
        action: 'task.deleted',
        resourceType: 'task',
        resourceId: 'task-3',
      })
      .returning()

    await expectAppendOnlyFailure(
      db.delete(auditEvents).where(eq(auditEvents.id, row.id)),
    )
  })

  it('TRUNCATE on audit_events throws with append-only trigger error', async () => {
    if (skipWhenContainerRuntimeUnavailable()) return

    // TRUNCATE fires a statement-level trigger - must also be blocked
    await expectAppendOnlyFailure(
      db.execute(drizzleSql.raw('TRUNCATE TABLE audit_events')),
    )
  })
})

describe('writeAuditEvent', () => {
  it('inserts a row with correct fields', async () => {
    if (skipWhenContainerRuntimeUnavailable()) return

    await writeAuditEvent(db, {
      tenantId: '00000000-0000-0000-0000-000000000002',
      actorId: 'actor-abc',
      action: 'patient.viewed',
      resourceType: 'patient',
      resourceId: 'patient-99',
      before: null,
      after: { status: 'viewed' },
    })

    const rows = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.resourceId, 'patient-99'))

    expect(rows).toHaveLength(1)
    expect(rows[0].actorId).toBe('actor-abc')
    expect(rows[0].action).toBe('patient.viewed')
    expect(rows[0].after).toEqual({ status: 'viewed' })
  })

  it('uses context actorId when event actorId is not provided', async () => {
    if (skipWhenContainerRuntimeUnavailable()) return

    await withAuditContext({ actorId: 'ctx-actor', ip: '10.0.0.1', userAgent: 'TestAgent/1.0' }, async () => {
      await writeAuditEvent(db, {
        tenantId: '00000000-0000-0000-0000-000000000003',
        action: 'document.uploaded',
        resourceType: 'document',
        resourceId: 'doc-1',
      })
    })

    const rows = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.resourceId, 'doc-1'))

    expect(rows).toHaveLength(1)
    expect(rows[0].actorId).toBe('ctx-actor')
    expect(rows[0].ip).toBe('10.0.0.1')
    expect(rows[0].userAgent).toBe('TestAgent/1.0')
  })

  it('event actorId overrides context actorId', async () => {
    if (skipWhenContainerRuntimeUnavailable()) return

    await withAuditContext({ actorId: 'ctx-actor' }, async () => {
      await writeAuditEvent(db, {
        tenantId: '00000000-0000-0000-0000-000000000004',
        actorId: 'explicit-actor',
        action: 'form.submitted',
        resourceType: 'form',
        resourceId: 'form-1',
      })
    })

    const rows = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.resourceId, 'form-1'))

    expect(rows).toHaveLength(1)
    expect(rows[0].actorId).toBe('explicit-actor')
  })

  it('propagates the error when db insert fails', async () => {
    const logSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined)
    const brokenDb: Parameters<typeof writeAuditEvent>[0] = {
      insert: () => {
        throw new Error('DB connection lost for patient@example.com')
      },
    }
    await expect(
      writeAuditEvent(brokenDb, {
        tenantId: '00000000-0000-0000-0000-000000000099',
        actorId: 'actor',
        action: 'test',
        resourceType: 'test',
        resourceId: 'test',
      }),
    ).rejects.toThrow('DB connection lost')

    const loggedPayload = logSpy.mock.calls[0]?.[0]
    expect(JSON.stringify(loggedPayload)).not.toContain('patient@example.com')
    expect(loggedPayload).toEqual(expect.objectContaining({ err: expect.any(Error) }))
    logSpy.mockRestore()
  })

  it('redacts obvious PHI and secrets from before and after payloads before insert', async () => {
    const values = vi.fn().mockResolvedValue(undefined)
    const db: Parameters<typeof writeAuditEvent>[0] = {
      insert: vi.fn().mockReturnValue({ values }),
    }

    await writeAuditEvent(db, {
      tenantId: '00000000-0000-0000-0000-000000000098',
      actorId: 'actor',
      action: 'test',
      resourceType: 'test',
      resourceId: 'test',
      before: {
        patientEmail: 'patient@example.com',
        apiToken: 'sk_live_123456',
        api_key: 'api-key-secret',
        nested: { ssn: '123-45-6789', private_key: 'private-key-secret' },
      },
      after: {
        note: 'Contact patient@example.com for follow up',
        password: 'plain-text-secret',
        access_key: 'access-key-secret',
      },
    })

    const row = values.mock.calls[0]?.[0]
    expect(JSON.stringify(row.before)).not.toContain('patient@example.com')
    expect(JSON.stringify(row.before)).not.toContain('sk_live_123456')
    expect(JSON.stringify(row.before)).not.toContain('api-key-secret')
    expect(JSON.stringify(row.before)).not.toContain('private-key-secret')
    expect(JSON.stringify(row.before)).not.toContain('123-45-6789')
    expect(JSON.stringify(row.after)).not.toContain('patient@example.com')
    expect(JSON.stringify(row.after)).not.toContain('plain-text-secret')
    expect(JSON.stringify(row.after)).not.toContain('access-key-secret')
  })

  it('redacts common auth header and session secret fields before insert', async () => {
    const values = vi.fn().mockResolvedValue(undefined)
    const db: Parameters<typeof writeAuditEvent>[0] = {
      insert: vi.fn().mockReturnValue({ values }),
    }

    await writeAuditEvent(db, {
      tenantId: '00000000-0000-0000-0000-000000000096',
      actorId: 'actor',
      action: 'test',
      resourceType: 'test',
      resourceId: 'test',
      before: {
        headers: {
          authorization: 'Bearer raw-access-token',
          cookie: 'better-auth.session_token=raw-session-token',
          set_cookie: 'better-auth.session_token=raw-set-cookie-token',
        },
        sessionId: 'raw-session-id',
        jwt: 'raw-jwt',
        clientAssertion: 'raw-client-assertion',
      },
    })

    const row = values.mock.calls[0]?.[0]
    const serialized = JSON.stringify(row.before)
    expect(serialized).not.toContain('raw-access-token')
    expect(serialized).not.toContain('raw-session-token')
    expect(serialized).not.toContain('raw-set-cookie-token')
    expect(serialized).not.toContain('raw-session-id')
    expect(serialized).not.toContain('raw-jwt')
    expect(serialized).not.toContain('raw-client-assertion')
  })

  it('preserves Date values in audit payloads as ISO strings', async () => {
    const values = vi.fn().mockResolvedValue(undefined)
    const db: Parameters<typeof writeAuditEvent>[0] = {
      insert: vi.fn().mockReturnValue({ values }),
    }
    const signedAt = new Date('2026-05-13T02:00:00.000Z')

    await writeAuditEvent(db, {
      tenantId: '00000000-0000-0000-0000-000000000097',
      actorId: 'actor',
      action: 'test',
      resourceType: 'test',
      resourceId: 'test',
      after: {
        signedAt,
        nested: { completedAt: signedAt },
      },
    })

    const row = values.mock.calls[0]?.[0]
    expect(row.after).toEqual({
      signedAt: '2026-05-13T02:00:00.000Z',
      nested: { completedAt: '2026-05-13T02:00:00.000Z' },
    })
  })
})

describe('withAuditContext', () => {
  it('makes actorId/ip/userAgent available inside the callback', async () => {
    let capturedCtx: ReturnType<typeof getAuditContext>

    await withAuditContext({ actorId: 'user-xyz', ip: '192.168.1.1', userAgent: 'MyApp/2' }, async () => {
      capturedCtx = getAuditContext()
    })

    expect(capturedCtx).toBeDefined()
    expect(capturedCtx!.actorId).toBe('user-xyz')
    expect(capturedCtx!.ip).toBe('192.168.1.1')
    expect(capturedCtx!.userAgent).toBe('MyApp/2')
  })

  it('context is not available outside the callback', async () => {
    await withAuditContext({ actorId: 'temp-actor' }, async () => {
      // inside - available
      expect(getAuditContext()).toBeDefined()
    })
    // outside - undefined
    expect(getAuditContext()).toBeUndefined()
  })
})
