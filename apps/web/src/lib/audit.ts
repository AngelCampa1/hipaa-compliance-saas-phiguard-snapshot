import { withAuditContext, type AuditContext } from '@phiguard/audit'

function getRequestIp(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for')
  const forwardedIp = forwardedFor
    ?.split(',')
    .map((part) => part.trim())
    .find((part) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(part))
  if (forwardedIp) {
    return forwardedIp
  }

  return headers.get('x-real-ip') ?? undefined
}

/**
 * Wraps a server function body with an audit context populated from the
 * current HTTP request headers. Call this inside every server fn that
 * touches PHI or writes data.
 *
 * Downstream code accesses the context via `getAuditContext()` from
 * `@phiguard/audit` - no need to thread it through call arguments.
 *
 * Usage:
 *   export const createTaskFn = createServerFn({ method: 'POST' }).handler(
 *     (input) => runInAuditContext(actorId, () => createTask(db, input))
 *   )
 */
export async function runInAuditContextForHeaders<T>(
  actorId: string,
  headers: Headers,
  fn: () => Promise<T>,
): Promise<T> {
  const ip = getRequestIp(headers)
  const userAgent = headers.get('user-agent') ?? undefined

  const ctx: AuditContext = { actorId, ip, userAgent }
  return withAuditContext(ctx, fn)
}
