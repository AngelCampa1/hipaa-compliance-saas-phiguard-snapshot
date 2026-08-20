import { getRequest } from '@tanstack/react-start/server'
import { runInAuditContextForHeaders } from './audit.js'

export async function runInAuditContext<T>(
  actorId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const request = getRequest()
  return runInAuditContextForHeaders(actorId, request.headers, fn)
}
