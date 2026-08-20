import { AsyncLocalStorage } from 'node:async_hooks'
import { auditEvents } from './schema/audit-events.phi.js'
import { logger, redact } from './logger.js'

export interface AuditContext {
  actorId: string
  ip?: string
  userAgent?: string
}

const auditStore = new AsyncLocalStorage<AuditContext>()

export function withAuditContext<T>(ctx: AuditContext, fn: () => Promise<T>): Promise<T> {
  return auditStore.run(ctx, fn)
}

export function getAuditContext(): AuditContext | undefined {
  return auditStore.getStore()
}

export interface WriteAuditEventInput {
  tenantId: string
  locationId?: string
  /** Overrides context.actorId if provided */
  actorId?: string
  action: string
  resourceType: string
  resourceId: string
  before?: unknown
  after?: unknown
}

/** Minimal structural type that any Drizzle insert-capable DB satisfies. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AuditDb = { insert: (table: typeof auditEvents) => { values: (row: any) => PromiseLike<unknown> } }

const SECRET_KEY_PATTERN =
  /(password|secret|token|apikey|accesskey|privatekey|credential|authorization|cookie|setcookie|sessionid|jwt|clientassertion)/
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g

function sanitizeAuditPayload(payload: unknown): unknown {
  return scrubStringsAndSecrets(redact(payload), new WeakSet())
}

function scrubStringsAndSecrets(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') {
    return value
      .replace(EMAIL_PATTERN, '[REDACTED-EMAIL]')
      .replace(SSN_PATTERN, '[REDACTED-SSN]')
  }
  if (typeof value !== 'object') return value
  if (value instanceof Date) return value.toISOString()
  if (seen.has(value)) return '[Circular]'
  seen.add(value)

  if (Array.isArray(value)) {
    return value.map((item) => scrubStringsAndSecrets(item, seen))
  }

  const result: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    result[key] = SECRET_KEY_PATTERN.test(normalizeSecretKey(key))
      ? '[REDACTED]'
      : scrubStringsAndSecrets(item, seen)
  }
  return result
}

function normalizeSecretKey(key: string) {
  return key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
}

/**
 * Write an immutable audit event to the audit_events table.
 *
 * Throws on insert failure - a missing audit trail is a HIPAA compliance event.
 * Callers must not proceed with a mutation if the audit write fails.
 *
 * @param db - A Drizzle ORM database instance (PostgresJsDatabase or compatible)
 * @param event - The audit event payload
 */
export async function writeAuditEvent(
  db: AuditDb,
  event: WriteAuditEventInput,
): Promise<void> {
  try {
    const ctx = getAuditContext()

    const actorId = event.actorId ?? ctx?.actorId ?? 'unknown'
    const ip = ctx?.ip
    const userAgent = ctx?.userAgent

    await db.insert(auditEvents).values({
      tenantId: event.tenantId,
      locationId: event.locationId,
      actorId,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      before: sanitizeAuditPayload(event.before) as Record<string, unknown> | null | undefined,
      after: sanitizeAuditPayload(event.after) as Record<string, unknown> | null | undefined,
      ip,
      userAgent,
    })
  } catch (err) {
    // Use error level - a missing audit trail is a compliance event, not a minor warning.
    logger.error(
      { err: err instanceof Error ? err : new Error('Unknown audit write failure') },
      'writeAuditEvent: failed to insert audit event - audit trail gap',
    )
    throw err
  }
}
