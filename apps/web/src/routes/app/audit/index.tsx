/**
 * Audit log viewer - /app/audit
 *
 * Filterable, cursor-paginated view of audit events.
 * Auto-fetches the most-recent events on mount (last 7 days, no user action required).
 * Filters: actor_id, actor_email, action, resource_type, resource_id, free-text search,
 *          date range (from/to).
 * Sort: click column headers (Timestamp, Actor, Action) to toggle asc/desc.
 * Pagination: 50 rows per page with "Load more" button using cursor-based pagination.
 *
 * HIPAA note: audit_events is append-only. No edit or delete affordances are rendered.
 */

import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, useEffect } from 'react'
import {
  Button,
  formatDateTime,
  InputPrimitive,
  Label,
  PageHeader,
  Panel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatusPanel,
  SummaryMetric,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableShell,
} from '@phiguard/ui'
import { getClientErrorMessage } from '../../../lib/client-errors.js'
import { listAuditEventsFn, getAuditEnumsFn } from '../../../server/audit.js'
import { trackProductEvent } from '../../../lib/product-analytics-browser.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type AuditEvent = {
  id: string
  createdAt: string | Date
  actorId: string
  actorName?: string | null
  action: string
  resourceType: string
  resourceId: string
  ip?: string | null
  userAgent?: string | null
}

type SortField = 'createdAt' | 'action' | 'actorId'
type SortDirection = 'asc' | 'desc'

function isValidUuid(value: string): boolean {
  return UUID_RE.test(value)
}

/** Build the default last-7-days window for the initial auto-fetch. */
function defaultDateRange() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return {
    dateFrom: sevenDaysAgo.toISOString(),
    dateTo: now.toISOString(),
  }
}

const SKELETON_ROW_COUNT = 8
const ALL_VALUE = '__all__'

function getAuditFilterCount(filters: {
  actorId: string
  actorEmail: string
  action: string
  resourceType: string
  resourceId: string
  search: string
  dateFrom?: string
  dateTo?: string
}) {
  return [
    filters.actorId.trim(),
    filters.actorEmail.trim(),
    filters.action !== ALL_VALUE ? filters.action : '',
    filters.resourceType !== ALL_VALUE ? filters.resourceType : '',
    filters.resourceId.trim(),
    filters.search.trim(),
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length
}

export const Route = createFileRoute('/app/audit/')({
  component: AuditLogPage,
})

function AuditLogPage() {
  // Filter state
  const [actorId, setActorId] = useState('')
  const [actorIdError, setActorIdError] = useState<string | null>(null)
  const [actorEmail, setActorEmail] = useState('')
  const [action, setAction] = useState(ALL_VALUE)
  const [resourceType, setResourceType] = useState(ALL_VALUE)
  const [resourceId, setResourceId] = useState('')
  const [resourceIdError, setResourceIdError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Sort state
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Enum lists for dropdowns
  const [actionOptions, setActionOptions] = useState<string[]>([])
  const [resourceTypeOptions, setResourceTypeOptions] = useState<string[]>([])

  const [events, setEvents] = useState<AuditEvent[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Validate UUID fields. Returns true when all fields are valid. */
  function validateUuidFields(): boolean {
    let valid = true

    if (actorId.trim() && !isValidUuid(actorId.trim())) {
      setActorIdError('Actor ID must be a valid UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).')
      valid = false
    } else {
      setActorIdError(null)
    }

    if (resourceId.trim() && !isValidUuid(resourceId.trim())) {
      setResourceIdError('Resource ID must be a valid UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).')
      valid = false
    } else {
      setResourceIdError(null)
    }

    return valid
  }

  const fetchEvents = useCallback(
    async (
      cursor?: string,
      overrides?: {
        dateFrom?: string
        dateTo?: string
        sortField?: SortField
        sortDirection?: SortDirection
      },
    ) => {
      setLoading(true)
      setError(null)

      const resolvedDateFrom =
        overrides?.dateFrom ?? (dateFrom ? new Date(dateFrom).toISOString() : undefined)
      const resolvedDateTo =
        overrides?.dateTo ?? (dateTo ? new Date(dateTo).toISOString() : undefined)
      const resolvedSortField = overrides?.sortField ?? sortField
      const resolvedSortDirection = overrides?.sortDirection ?? sortDirection
      const filterCount = getAuditFilterCount({
        actorId,
        actorEmail,
        action,
        resourceType,
        resourceId,
        search,
        dateFrom: resolvedDateFrom,
        dateTo: resolvedDateTo,
      })

      try {
        const result = await listAuditEventsFn({
          data: {
            actorId: actorId.trim() || undefined,
            actorEmail: actorEmail.trim() || undefined,
            action: action !== ALL_VALUE ? action : undefined,
            resourceType: resourceType !== ALL_VALUE ? resourceType : undefined,
            resourceId: resourceId.trim() || undefined,
            search: search.trim() || undefined,
            dateFrom: resolvedDateFrom,
            dateTo: resolvedDateTo,
            cursor,
            sort: {
              field: resolvedSortField,
              direction: resolvedSortDirection,
            },
          },
        })

        if (cursor) {
          setEvents((prev) => [...prev, ...(result.events as AuditEvent[])])
        } else {
          setEvents(result.events as AuditEvent[])
        }
        setNextCursor(result.nextCursor ?? null)
        setLoaded(true)
      } catch (err) {
        setError(
          getClientErrorMessage(err, {
            route: '/app/audit',
            operation: 'audit.list',
            fallbackMessage: 'Could not load audit events.',
          }),
        )
        trackProductEvent('audit_events_load_failed', {
          route: '/app/audit',
          report_type: 'audit_log',
          action: cursor ? 'load_more' : 'load',
          status: 'failed',
          reason: 'request_failed',
          filter_count: filterCount,
        })
        setLoaded(true)
      } finally {
        setLoading(false)
      }
    },
    [
      actorId,
      actorEmail,
      action,
      resourceType,
      resourceId,
      search,
      dateFrom,
      dateTo,
      sortField,
      sortDirection,
    ],
  )

  /** Auto-fetch the last 7 days on first mount and load enum options. */
  useEffect(() => {
    const { dateFrom: defaultFrom, dateTo: defaultTo } = defaultDateRange()
    fetchEvents(undefined, { dateFrom: defaultFrom, dateTo: defaultTo })

    getAuditEnumsFn({ data: undefined }).then((enums) => {
      setActionOptions(enums.actions)
      setResourceTypeOptions(enums.resourceTypes)
    })
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!validateUuidFields()) return
    trackProductEvent('audit_search_performed', {
      route: '/app/audit',
      filter_count: getActiveFilterCount(),
      has_active_filters: getActiveFilterCount() > 0,
    })
    setLoaded(false)
    setEvents([])
    setNextCursor(null)
    fetchEvents()
  }

  function handleClearFilters() {
    setActorId('')
    setActorIdError(null)
    setActorEmail('')
    setAction(ALL_VALUE)
    setResourceType(ALL_VALUE)
    setResourceId('')
    setResourceIdError(null)
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setSortField('createdAt')
    setSortDirection('desc')
    setLoaded(false)
    setEvents([])
    setNextCursor(null)
    const { dateFrom: defaultFrom, dateTo: defaultTo } = defaultDateRange()
    fetchEvents(undefined, {
      dateFrom: defaultFrom,
      dateTo: defaultTo,
      sortField: 'createdAt',
      sortDirection: 'desc',
    })
  }

  function handleRetry() {
    trackProductEvent('audit_events_retry_clicked', {
      route: '/app/audit',
      report_type: 'audit_log',
      action: 'retry',
      filter_count: getActiveFilterCount(),
      has_active_filters: getActiveFilterCount() > 0,
    })
    setLoaded(false)
    setEvents([])
    setNextCursor(null)
    const { dateFrom: defaultFrom, dateTo: defaultTo } = defaultDateRange()
    fetchEvents(undefined, { dateFrom: defaultFrom, dateTo: defaultTo })
  }

  function handleLoadMore() {
    if (nextCursor) {
      trackProductEvent('report_drilldown_clicked', {
        route: '/app/audit',
        report_type: 'audit_log',
        action: 'load_more',
      })
      fetchEvents(nextCursor)
    }
  }

  function handleSortToggle(field: SortField) {
    const newDirection = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc'
    setSortField(field)
    setSortDirection(newDirection)
    setLoaded(false)
    setEvents([])
    setNextCursor(null)
    fetchEvents(undefined, { sortField: field, sortDirection: newDirection })
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  function buildExportHref() {
    const params = new URLSearchParams()

    if (actorId.trim()) params.set('actorId', actorId.trim())
    if (actorEmail.trim()) params.set('actorEmail', actorEmail.trim())
    if (action !== ALL_VALUE) params.set('action', action)
    if (resourceType !== ALL_VALUE) params.set('resourceType', resourceType)
    if (resourceId.trim()) params.set('resourceId', resourceId.trim())
    if (search.trim()) params.set('search', search.trim())

    const from = dateFrom ? new Date(dateFrom) : null
    const to = dateTo ? new Date(dateTo) : null
    if (from && !Number.isNaN(from.getTime())) params.set('dateFrom', from.toISOString())
    if (to && !Number.isNaN(to.getTime())) params.set('dateTo', to.toISOString())

    const query = params.toString()
    return query ? `/app/audit/export?${query}` : '/app/audit/export'
  }

  function getActiveFilterCount() {
    return getAuditFilterCount({
      actorId,
      actorEmail,
      action,
      resourceType,
      resourceId,
      search,
      dateFrom,
      dateTo,
    })
  }

  const isInitialLoad = loading && !loaded
  const auditExportHref = buildExportHref()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="A permanent record of compliance actions in your clinic. No one can change or delete it."
        actions={
          <Button asChild variant="outline" size="sm">
            <a href={auditExportHref}>Export CSV</a>
          </Button>
        }
      />

      <form
        onSubmit={handleSearch}
        className="rounded-xl border border-border-default bg-surface-0 p-4 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Actor ID */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="audit-actor-id">Actor ID</Label>
            <InputPrimitive
              id="audit-actor-id"
              type="text"
              placeholder="User ID (UUID)"
              value={actorId}
              onChange={(e) => {
                setActorId(e.target.value)
                if (actorIdError) setActorIdError(null)
              }}
              aria-invalid={actorIdError ? 'true' : undefined}
              aria-describedby={actorIdError ? 'audit-actor-id-error' : undefined}
              className="h-9 w-full min-w-0"
            />
            {actorIdError && (
              <p id="audit-actor-id-error" className="text-xs text-danger-600" role="alert">
                {actorIdError}
              </p>
            )}
          </div>

          {/* Actor email */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="audit-actor-email">Actor email</Label>
            <InputPrimitive
              id="audit-actor-email"
              type="text"
              placeholder="e.g. alice@clinic.com"
              value={actorEmail}
              onChange={(e) => setActorEmail(e.target.value)}
              className="h-9 w-full min-w-0"
            />
          </div>

          {/* Action dropdown */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="audit-action">Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger id="audit-action" className="h-9">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All actions</SelectItem>
                {actionOptions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resource type dropdown */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="audit-resource-type">Resource type</Label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger id="audit-resource-type" className="h-9">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All types</SelectItem>
                {resourceTypeOptions.map((rt) => (
                  <SelectItem key={rt} value={rt}>
                    {rt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resource ID */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="audit-resource-id">Resource ID</Label>
            <InputPrimitive
              id="audit-resource-id"
              type="text"
              placeholder="Resource UUID"
              value={resourceId}
              onChange={(e) => {
                setResourceId(e.target.value)
                if (resourceIdError) setResourceIdError(null)
              }}
              aria-invalid={resourceIdError ? 'true' : undefined}
              aria-describedby={resourceIdError ? 'audit-resource-id-error' : undefined}
              className="h-9 w-full min-w-0"
            />
            {resourceIdError && (
              <p id="audit-resource-id-error" className="text-xs text-danger-600" role="alert">
                {resourceIdError}
              </p>
            )}
          </div>

          {/* Free-text search */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="audit-search">Search</Label>
            <InputPrimitive
              id="audit-search"
              type="text"
              placeholder="Search event actions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full min-w-0"
            />
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="audit-date-from">From</Label>
            <InputPrimitive
              id="audit-date-from"
              type="datetime-local"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 w-full min-w-0"
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="audit-date-to">To</Label>
            <InputPrimitive
              id="audit-date-to"
              type="datetime-local"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 w-full min-w-0"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" disabled={loading}>
            {loading && !nextCursor ? 'Searching…' : 'Search'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            disabled={loading}
          >
            Clear filters
          </Button>
        </div>
      </form>

      {/* Loading skeleton - shown only during the initial auto-fetch */}
      {isInitialLoad && (
        <Panel>
          <div className="space-y-2 p-2" aria-label="Loading audit events" aria-busy="true">
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </Panel>
      )}

      {/* Error state */}
      {!isInitialLoad && error && (
        <StatusPanel
          variant="error"
          title="Could not load audit events"
          description={error}
          action={{ label: 'Try again', onClick: handleRetry }}
        />
      )}

      {/* Results */}
      {!isInitialLoad && !error && loaded && (
        <>
          {events.length === 0 ? (
            <StatusPanel
              variant="empty"
              title="No audit events match your filters"
              description="Try a wider date range or clear some filters and search again."
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryMetric
                  label="Events on this page"
                  value={events.length}
                  detail={nextCursor ? 'More available below' : 'All results shown'}
                  tone="brand"
                />
                <SummaryMetric
                  label="Actors"
                  value={new Set(events.map((event) => event.actorId)).size}
                  detail="Unique actors"
                />
                <SummaryMetric
                  label="Resources"
                  value={new Set(events.map((event) => event.resourceType)).size}
                  detail="Resource types in view"
                />
              </div>

              {/* HIPAA: audit_events is append-only - no edit or delete actions are rendered per row */}
              <TableShell>
                <Table aria-label="Audit events">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        <button
                          type="button"
                          className="inline-flex cursor-pointer items-center gap-1 hover:underline"
                          onClick={() => handleSortToggle('createdAt')}
                        >
                          Timestamp{sortIndicator('createdAt')}
                        </button>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <button
                          type="button"
                          className="inline-flex cursor-pointer items-center gap-1 hover:underline"
                          onClick={() => handleSortToggle('actorId')}
                        >
                          Actor{sortIndicator('actorId')}
                        </button>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <button
                          type="button"
                          className="inline-flex cursor-pointer items-center gap-1 hover:underline"
                          onClick={() => handleSortToggle('action')}
                        >
                          Action{sortIndicator('action')}
                        </button>
                      </TableHead>
                      {['Resource Type', 'Resource ID', 'IP', 'User Agent'].map((h) => (
                        <TableHead key={h} className="whitespace-nowrap">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id} data-event-id={event.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(event.createdAt)}
                        </TableCell>
                        <TableCell title={event.actorId}>
                          {event.actorName ?? (
                            <span className="font-mono text-xs">{event.actorId}</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{event.action}</TableCell>
                        <TableCell>{event.resourceType}</TableCell>
                        <TableCell className="font-mono text-xs">{event.resourceId}</TableCell>
                        <TableCell>{event.ip ?? '-'}</TableCell>
                        <TableCell
                          className="max-w-52 overflow-hidden text-ellipsis whitespace-nowrap"
                          title={event.userAgent ?? undefined}
                        >
                          {event.userAgent ?? '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableShell>

              {nextCursor && (
                <div className="mt-4 text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading…' : 'Load more'}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
