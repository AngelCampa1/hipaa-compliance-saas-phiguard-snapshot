/**
 * Audit CSV export - /app/audit/export
 *
 * Renders a form with date range inputs. On submit, downloads CSV through
 * the `/api/audit/export` route.
 *
 * Active filters are read from URL search params (action, resourceType,
 * actorId, actorEmail, resourceId, search, locationId) and propagated to the export
 * request so that the downloaded CSV matches the filtered view.
 *
 * - Shows an estimated row count before submit.
 * - Warns when the date range exceeds 90 days.
 * - Blocks submit when the date range exceeds 365 days.
 * - Shows an async-delivery notice when the estimated row count exceeds 50 000.
 *
 * HIPAA note: The CSV is tenant-scoped and never includes PHI from the
 * before/after JSONB columns - only the audit metadata fields.
 * The audit_events table is append-only; no edit or delete affordances
 * are rendered on this page or the audit log viewer.
 */

import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Alert, Button, InputPrimitive, Label, PageHeader, Panel } from '@phiguard/ui'
import { estimateAuditCountFn, AUDIT_EXPORT_LARGE_ROW_THRESHOLD } from '../../../server/audit.js'
import { trackProductEvent } from '../../../lib/product-analytics-browser.js'

const WARN_RANGE_DAYS = 90
const MAX_RANGE_DAYS = 365

export const Route = createFileRoute('/app/audit/export')({
  component: AuditExportPage,
  validateSearch: (search: Record<string, unknown>) => ({
    action: typeof search.action === 'string' ? search.action : undefined,
    resourceType: typeof search.resourceType === 'string' ? search.resourceType : undefined,
    actorId: typeof search.actorId === 'string' ? search.actorId : undefined,
    actorEmail: typeof search.actorEmail === 'string' ? search.actorEmail : undefined,
    resourceId: typeof search.resourceId === 'string' ? search.resourceId : undefined,
    search: typeof search.search === 'string' ? search.search : undefined,
    locationId: typeof search.locationId === 'string' ? search.locationId : undefined,
    dateFrom: typeof search.dateFrom === 'string' ? search.dateFrom : undefined,
    dateTo: typeof search.dateTo === 'string' ? search.dateTo : undefined,
  }),
})

function AuditExportPage() {
  const filterParams = useSearch({ from: '/app/audit/export' })

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const toLocalInputValue = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const [dateFrom, setDateFrom] = useState(
    filterParams.dateFrom
      ? toLocalInputValue(new Date(filterParams.dateFrom))
      : toLocalInputValue(thirtyDaysAgo),
  )
  const [dateTo, setDateTo] = useState(
    filterParams.dateTo ? toLocalInputValue(new Date(filterParams.dateTo)) : toLocalInputValue(now),
  )
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [estimatedCount, setEstimatedCount] = useState<number | null>(null)
  const [estimating, setEstimating] = useState(false)

  function parseDates(): { from: Date; to: Date } | null {
    const from = new Date(dateFrom)
    const to = new Date(dateTo)
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return null
    }
    return { from, to }
  }

  function getRangeDays(from: Date, to: Date) {
    return (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
  }

  function getRowCountBucket(count: number | null) {
    if (count === null) return 'unknown'
    if (count === 0) return '0'
    if (count <= 100) return '1-100'
    if (count <= 1000) return '101-1000'
    if (count <= 10000) return '1001-10000'
    return '10001+'
  }

  const refreshEstimate = useCallback(async () => {
    const dates = parseDates()
    if (!dates || dates.from > dates.to) {
      setEstimatedCount(null)
      return
    }
    const rangeDays = getRangeDays(dates.from, dates.to)
    if (rangeDays > MAX_RANGE_DAYS) {
      setEstimatedCount(null)
      return
    }

    setEstimating(true)
    try {
      const result = await estimateAuditCountFn({
        data: {
          dateFrom: dates.from.toISOString(),
          dateTo: dates.to.toISOString(),
          actorId: filterParams.actorId,
          actorEmail: filterParams.actorEmail,
          action: filterParams.action,
          resourceType: filterParams.resourceType,
          resourceId: filterParams.resourceId,
          search: filterParams.search,
          locationId: filterParams.locationId,
        },
      })
      setEstimatedCount(result.count)
    } catch {
      setEstimatedCount(null)
    } finally {
      setEstimating(false)
    }
  }, [
    dateFrom,
    dateTo,
    filterParams.actorId,
    filterParams.actorEmail,
    filterParams.action,
    filterParams.resourceType,
    filterParams.resourceId,
    filterParams.search,
    filterParams.locationId,
  ])

  useEffect(() => {
    void refreshEstimate()
  }, [])

  async function handleExport(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const dates = parseDates()
    if (!dates) {
      setError('Enter a valid start and end date.')
      return
    }
    const { from, to } = dates

    if (from > to) {
      setError('The start date must be before the end date.')
      return
    }

    const rangeDays = getRangeDays(from, to)
    if (rangeDays > MAX_RANGE_DAYS) {
      setError(
        `Date range cannot exceed ${MAX_RANGE_DAYS} days. For longer exports, use the nightly object-storage export.`,
      )
      return
    }

    setExporting(true)
    trackProductEvent('audit_export_started', {
      route: '/app/audit/export',
      export_format: 'csv',
      filter_count: activeFilterCount,
      has_active_filters: activeFilterCount > 0,
      row_count_bucket: getRowCountBucket(estimatedCount),
    })

    try {
      const url = new URL('/api/audit/export', window.location.origin)
      url.searchParams.set('dateFrom', from.toISOString())
      url.searchParams.set('dateTo', to.toISOString())

      // Propagate active filters so the CSV matches the filtered log view
      if (filterParams.actorId) url.searchParams.set('actorId', filterParams.actorId)
      if (filterParams.actorEmail) url.searchParams.set('actorEmail', filterParams.actorEmail)
      if (filterParams.action) url.searchParams.set('action', filterParams.action)
      if (filterParams.resourceType) url.searchParams.set('resourceType', filterParams.resourceType)
      if (filterParams.resourceId) url.searchParams.set('resourceId', filterParams.resourceId)
      if (filterParams.search) url.searchParams.set('search', filterParams.search)
      if (filterParams.locationId) url.searchParams.set('locationId', filterParams.locationId)

      const response = await fetch(url, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Export failed.')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `audit-export-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
      setSuccess('Audit CSV exported. Check your downloads folder.')
      trackProductEvent('audit_export_completed', {
        route: '/app/audit/export',
        export_format: 'csv',
        filter_count: activeFilterCount,
        has_active_filters: activeFilterCount > 0,
        row_count_bucket: getRowCountBucket(estimatedCount),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.')
      trackProductEvent('audit_export_failed', {
        route: '/app/audit/export',
        export_format: 'csv',
        filter_count: activeFilterCount,
        has_active_filters: activeFilterCount > 0,
        row_count_bucket: getRowCountBucket(estimatedCount),
        reason: 'request_failed',
      })
    } finally {
      setExporting(false)
    }
  }

  const dates = parseDates()
  const rangeDays = dates ? getRangeDays(dates.from, dates.to) : 0
  const rangeExceedsMax = rangeDays > MAX_RANGE_DAYS
  const rangeWarning = !rangeExceedsMax && rangeDays > WARN_RANGE_DAYS

  const activeFilterCount = [
    filterParams.actorId,
    filterParams.actorEmail,
    filterParams.action,
    filterParams.resourceType,
    filterParams.resourceId,
    filterParams.search,
  ].filter(Boolean).length

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Export audit log"
        description="Download audit metadata as a CSV for compliance reviews, OCR investigations, or internal audit programs."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/app/audit">Return to audit log</Link>
          </Button>
        }
      />

      {activeFilterCount > 0 && (
        <Alert tone="info">
          {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''} will be applied to this export. Go back to the audit log to change them.
        </Alert>
      )}

      <Panel>
        <form onSubmit={handleExport} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="export-date-from">From</Label>
            <InputPrimitive
              id="export-date-from"
              type="datetime-local"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setEstimatedCount(null)
              }}
              onBlur={() => void refreshEstimate()}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="export-date-to">To</Label>
            <InputPrimitive
              id="export-date-to"
              type="datetime-local"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setEstimatedCount(null)
              }}
              onBlur={() => void refreshEstimate()}
              required
            />
          </div>

          {rangeExceedsMax && (
            <Alert tone="danger" role="alert">
              Date range is over {MAX_RANGE_DAYS} days. Narrow the range or use the nightly object-storage export for full-history downloads.
            </Alert>
          )}
          {rangeWarning && (
            <Alert tone="warning">
              Date range is over {WARN_RANGE_DAYS} days. Large exports can take a moment to generate.
            </Alert>
          )}

          {estimating && <p className="text-sm text-text-muted">Estimating row count…</p>}
          {!estimating && estimatedCount !== null && (
            <p className="text-sm text-text-secondary">
              About{' '}
              <span className="font-semibold">{estimatedCount.toLocaleString()}</span>{' '}
              rows match your current filters.
            </p>
          )}

          {!estimating &&
            estimatedCount !== null &&
            estimatedCount > AUDIT_EXPORT_LARGE_ROW_THRESHOLD && (
              <Alert tone="info">
                This export is large. It will download automatically if the file is small enough. Otherwise, we will send a download link to your account email.
              </Alert>
            )}

          {error && (
            <Alert tone="danger" role="alert">
              {error}
            </Alert>
          )}
          {success && (
            <Alert tone="success" title="Export ready">
              {success}
            </Alert>
          )}

          <Button type="submit" disabled={exporting || rangeExceedsMax}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </form>
      </Panel>

      <p className="mt-4 text-xs text-text-disabled">
        The exported CSV contains: event ID, timestamp, actor ID, action, resource type, resource ID, IP address, and user agent. PHI is never included.
      </p>
    </div>
  )
}
