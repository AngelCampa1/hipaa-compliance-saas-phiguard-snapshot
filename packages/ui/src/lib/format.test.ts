import { describe, expect, it } from 'vitest'
import { formatCents, formatDate, formatDateTime, humanFileSize } from './format'

describe('formatDate', () => {
  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(formatDate('')).toBe('')
  })

  it('returns empty string for invalid date input', () => {
    expect(formatDate('not-a-date')).toBe('')
  })

  it('formats ISO date string in UTC by default', () => {
    // 2024-03-15T00:00:00Z should render as "3/15/2024" with en-US defaults
    // regardless of the runner's local timezone.
    expect(formatDate('2024-03-15T00:00:00Z')).toBe('3/15/2024')
  })

  it('formats Date instances', () => {
    expect(formatDate(new Date('2024-03-15T00:00:00Z'))).toBe('3/15/2024')
  })

  it('formats numeric timestamps', () => {
    const ts = Date.UTC(2024, 2, 15, 0, 0, 0)
    expect(formatDate(ts)).toBe('3/15/2024')
  })

  it('respects formatter options overrides', () => {
    expect(
      formatDate('2024-03-15T00:00:00Z', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    ).toBe('Mar 15, 2024')
  })

  it('treats Date(0) (Jan 1 1970) as a valid date, not a falsy value', () => {
    // Regression guard: the legacy implementation used `!value` which
    // incorrectly treated the number 0 as missing.
    expect(formatDate(0)).toBe('1/1/1970')
  })
})

describe('formatDateTime', () => {
  it('returns empty string for null/undefined/invalid', () => {
    expect(formatDateTime(null)).toBe('')
    expect(formatDateTime(undefined)).toBe('')
    expect(formatDateTime('not-a-date')).toBe('')
  })

  it('renders date and time in UTC regardless of runner timezone', () => {
    // 2024-06-01T12:00:00Z — UTC-pinned so SSR and client agree (hydration-safe).
    expect(formatDateTime('2024-06-01T12:00:00Z')).toBe('Jun 1, 2024, 12:00 PM')
  })

  it('allows option overrides', () => {
    expect(
      formatDateTime('2024-06-01T12:00:00Z', { year: undefined }),
    ).toBe('Jun 1, 12:00 PM')
  })
})

describe('formatCents', () => {
  it('always shows two fraction digits by default (money reads as money)', () => {
    // Regression guard: the partner payout table rendered "$178.8" for 17880
    // because the old formatter used minimumFractionDigits: 0.
    expect(formatCents(17880)).toBe('$178.80')
    expect(formatCents(35760)).toBe('$357.60')
  })

  it('shows whole dollars when explicitly asked (approximate figures)', () => {
    expect(formatCents(180000, 0)).toBe('$1,800')
  })

  it('renders a trailing-zero round amount with cents by default', () => {
    expect(formatCents(35700)).toBe('$357.00')
  })

  it('groups thousands', () => {
    expect(formatCents(123456789)).toBe('$1,234,567.89')
  })

  it('renders zero and falls back to $0.00 for non-finite input', () => {
    expect(formatCents(0)).toBe('$0.00')
    expect(formatCents(Number.NaN)).toBe('$0.00')
  })
})

describe('humanFileSize', () => {
  it('renders bytes under 1 KiB as B', () => {
    expect(humanFileSize(0)).toBe('0 B')
    expect(humanFileSize(512)).toBe('512 B')
  })

  it('renders KiB rounded to whole numbers', () => {
    expect(humanFileSize(1024)).toBe('1 KB')
    expect(humanFileSize(384721)).toBe('376 KB')
  })

  it('renders MiB with one decimal', () => {
    expect(humanFileSize(1048576)).toBe('1.0 MB')
    expect(humanFileSize(1572864)).toBe('1.5 MB')
  })

  it('renders GiB with one decimal', () => {
    expect(humanFileSize(1024 * 1024 * 1024)).toBe('1.0 GB')
  })

  it('returns 0 B for negative or non-finite inputs', () => {
    expect(humanFileSize(-1)).toBe('0 B')
    expect(humanFileSize(Number.NaN)).toBe('0 B')
    expect(humanFileSize(Number.POSITIVE_INFINITY)).toBe('0 B')
  })
})
