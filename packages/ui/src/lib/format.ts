/**
 * Locale-aware date formatter shared across the PHIGuard product surface.
 *
 * Defaults to en-US in UTC so audit timestamps and clinic-level dates render
 * consistently regardless of the viewer's browser locale or timezone. Callers
 * can override either by passing `options`.
 *
 * Returns an empty string for null/undefined/invalid inputs so call sites do
 * not need to guard every render path.
 */
export function formatDate(
  value: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    ...options,
  }).format(date)
}

/**
 * Format a timestamp as a date + time string ("Jun 1, 2024, 12:00 PM").
 *
 * Shares formatDate's UTC/en-US pinning, so server (SSR) and client renders
 * agree exactly — this is the helper to reach for on any timestamp that is
 * server-rendered, since a raw Date.toLocaleString() would render in the
 * viewer's local timezone and trip a React hydration mismatch (#418).
 *
 * Returns an empty string for null/undefined/invalid inputs, like formatDate.
 */
export function formatDateTime(
  value: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatDate(value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...options,
  })
}

/**
 * Format an integer cent amount as a US-dollar string.
 *
 * Defaults to two fraction digits so money always reads as money
 * ("$178.80", never "$178.8" or "$178"). Pass `fractionDigits: 0` for
 * already-rounded, approximate figures (e.g. a lifetime value rounded to the
 * nearest $100) where trailing cents would be noise.
 */
export function formatCents(cents: number, fractionDigits: 0 | 2 = 2): string {
  const safe = Number.isFinite(cents) ? cents : 0
  return (safe / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

/**
 * Format a byte count as a human-readable size string.
 * Examples: 384721 -> "376 KB", 1048576 -> "1.0 MB"
 */
export function humanFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  const gb = mb / 1024
  return `${gb.toFixed(1)} GB`
}
