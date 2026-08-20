// Shared display helpers for task status/priority

export const STATUS_BADGE = {
  open: 'default',
  in_progress: 'warning',
  blocked: 'danger',
  done: 'success',
} as const satisfies Record<string, 'default' | 'success' | 'warning' | 'danger'>

export const PRIORITY_BADGE = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
} as const satisfies Record<string, 'default' | 'warning' | 'danger'>

export function formatStatusLabel(status: string): string {
  return status.replaceAll('_', ' ')
}

/**
 * Returns the urgency state of a task's due date relative to now.
 * - "overdue"   - past due
 * - "due-soon"  - due within 7 days
 * - "scheduled" - due in the future beyond 7 days
 * - null        - no due date or invalid date
 */
export function getDueState(
  dueAt: Date | string | null | undefined,
): 'overdue' | 'due-soon' | 'scheduled' | null {
  if (!dueAt) return null

  const due = new Date(dueAt)
  const now = new Date()
  const soon = new Date(now)
  soon.setDate(now.getDate() + 7)

  if (Number.isNaN(due.getTime())) return null
  if (due < now) return 'overdue'
  if (due <= soon) return 'due-soon'
  return 'scheduled'
}

/** Map common MIME types to a short friendly label. */
export function friendlyMimeLabel(contentType: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/png': 'PNG',
    'image/jpeg': 'JPEG',
    'image/gif': 'GIF',
    'image/webp': 'WebP',
    'text/plain': 'Text',
    'text/csv': 'CSV',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/msword': 'Word',
    'application/vnd.ms-excel': 'Excel',
    'application/zip': 'ZIP',
  }
  return map[contentType] ?? contentType.split('/').pop()?.toUpperCase() ?? contentType
}

export const AV_STATUS_HELP: Record<
  'pending' | 'clean' | 'infected' | 'skipped',
  string
> = {
  pending: 'Malware scan is in progress. Download will be available once the scan completes.',
  clean: 'File passed malware scanning and is safe to download.',
  infected:
    'File was flagged by the malware scan and is blocked. Contact support if you believe this is a false positive.',
  skipped: 'Malware scan was skipped for this file.',
}
