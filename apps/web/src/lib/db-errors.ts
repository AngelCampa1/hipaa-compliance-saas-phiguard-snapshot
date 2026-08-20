export function isTransientDbError(error: unknown): boolean {
  if (!error) return false
  const candidates: unknown[] = [error]
  if (error instanceof Error && 'cause' in error && error.cause) {
    candidates.push(error.cause)
  }
  for (const candidate of candidates) {
    const code =
      candidate && typeof candidate === 'object' && 'code' in candidate
        ? (candidate as { code?: unknown }).code
        : undefined
    if (code === 'CONNECTION_CLOSED' || code === 'CONNECTION_ENDED' || code === 'ECONNRESET') {
      return true
    }
    const message =
      candidate instanceof Error
        ? candidate.message
        : typeof candidate === 'string'
          ? candidate
          : ''
    if (/CONNECTION_CLOSED|CONNECTION_ENDED|ECONNRESET/.test(message)) {
      return true
    }
  }
  return false
}
