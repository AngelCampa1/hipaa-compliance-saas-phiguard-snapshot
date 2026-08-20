import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react'
import {
  Badge,
  Button,
  InputPrimitive,
  PageHeader,
  Panel,
  PanelHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SummaryMetric,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableShell,
} from '@phiguard/ui'
import { formatDate } from '../../../../lib/dates.js'
import {
  getProductAnalyticsRowCountBucket,
  trackProductEvent,
} from '../../../../lib/product-analytics-browser'
import { getComplianceScopeFn, listIncidentsFn } from '../../../../server/compliance.js'
import { AppRouteErrorBoundary } from '../../../../components/compliance-error-boundary'

export const Route = createFileRoute('/app/compliance/incidents/')({
  validateSearch: (search: Record<string, unknown>) => ({
    severity: (search.severity as string | undefined) ?? undefined,
    status: (search.status as string | undefined) ?? undefined,
    category: (search.category as string | undefined) ?? undefined,
    locationId: (search.locationId as string | undefined) ?? undefined,
    q: (search.q as string | undefined) ?? undefined,
    sort: (search.sort as string | undefined) ?? undefined,
    dir: (search.dir as 'asc' | 'desc' | undefined) ?? undefined,
  }),
  shouldReload: true,
  loader: async () => {
    const [incidents, scope] = await Promise.all([
      listIncidentsFn({ data: {} }),
      getComplianceScopeFn(),
    ])
    return { incidents, scope }
  },
  component: IncidentListPage,
  errorComponent: AppRouteErrorBoundary,
})

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const SEVERITY_CLASSES: Record<string, string> = {
  critical: 'text-danger-600',
  high: 'text-warning-600',
  medium: 'text-warning-600',
  low: 'text-text-muted',
}

const STATUS_LABELS: Record<string, string> = {
  reported: 'Reported',
  triaging: 'Triaging',
  contained: 'Contained',
  resolved: 'Resolved',
  closed: 'Closed',
}

function toTitleCase(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

type SortKey = 'title' | 'severity' | 'status' | 'category' | 'reportedAt'

const SEVERITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const INCIDENT_LIST_ANALYTICS_ROUTE = '/app/compliance/incidents'

function getQueryLengthBucket(value: string) {
  const length = value.trim().length
  if (length === 0) return 'empty'
  if (length < 4) return 'short'
  if (length < 12) return 'medium'
  return 'long'
}

function IncidentListPage() {
  const { incidents, scope } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/app/compliance/incidents/' })

  const canWrite = scope.canWrite
  const showLocation = scope.locations.length > 1
  const locationName = (id: string | null | undefined) =>
    scope.locations.find((loc) => loc.id === id)?.name ?? 'Unknown location'
  const openIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed')
  const criticalOrHigh = openIncidents.filter(
    (i) => i.severity === 'critical' || i.severity === 'high',
  ).length
  const contained = incidents.filter((i) => i.status === 'contained').length

  // Debounced search query
  const [localQ, setLocalQ] = useState(search.q ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listViewKeyRef = useRef<string | null>(null)
  const emptyStateKeyRef = useRef<string | null>(null)
  const deferredQ = useDeferredValue(localQ)

  useEffect(() => {
    setLocalQ(search.q ?? '')
  }, [search.q])

  const handleQChange = useCallback(
    (value: string) => {
      setLocalQ(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        trackProductEvent('incident_search_performed', {
          route: INCIDENT_LIST_ANALYTICS_ROUTE,
          query_length_bucket: getQueryLengthBucket(value),
        })
        void navigate({ search: (prev) => ({ ...prev, q: value }) })
      }, 300)
    },
    [navigate],
  )

  const setFilter = useCallback(
    (key: string, value: string) => {
      const nextValue = value === 'all' ? undefined : value
      trackProductEvent('incident_filter_changed', {
        route: INCIDENT_LIST_ANALYTICS_ROUTE,
        filter_type: key,
        filter_state: nextValue ? 'applied' : 'cleared',
      })
      void navigate({ search: (prev) => ({ ...prev, [key]: nextValue }) })
    },
    [navigate],
  )

  const clearFilters = useCallback(() => {
    trackProductEvent('incident_filter_changed', {
      route: INCIDENT_LIST_ANALYTICS_ROUTE,
      filter_type: 'all',
      filter_state: 'cleared',
    })
    void navigate({
      search: () => ({
        severity: undefined,
        status: undefined,
        category: undefined,
        locationId: undefined,
        q: undefined,
        sort: undefined,
        dir: undefined,
      }),
    })
    setLocalQ('')
  }, [navigate])

  const toggleSort = useCallback(
    (col: SortKey) => {
      const nextDir = search.sort === col && search.dir === 'desc' ? 'asc' : 'desc'
      trackProductEvent('incident_sort_changed', {
        route: INCIDENT_LIST_ANALYTICS_ROUTE,
        sort_key: col,
        sort_dir: nextDir,
      })
      void navigate({
        search: (prev) => ({
          ...prev,
          sort: col,
          dir: nextDir,
        }),
      })
    },
    [navigate, search.dir, search.sort],
  )

  // Derive unique categories for the filter dropdown
  const categories = [...new Set(incidents.map((i) => i.category).filter(Boolean))].sort()

  // Filter client-side (data is already fully loaded)
  let filtered = incidents
  if (search.severity) filtered = filtered.filter((i) => i.severity === search.severity)
  if (search.status) filtered = filtered.filter((i) => i.status === search.status)
  if (search.category) filtered = filtered.filter((i) => i.category === search.category)
  // Only honour the location scope when the clinic actually has multiple
  // locations; otherwise a dashboard deep-link's locationId would surface a
  // phantom "Clear filters" affordance with no matching visible control.
  if (showLocation && search.locationId)
    filtered = filtered.filter((i) => i.locationId === search.locationId)
  const q = deferredQ.trim().toLowerCase()
  if (q) {
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.status ?? '').toLowerCase().includes(q),
    )
  }

  // Sort
  const sortKey = (search.sort as SortKey | undefined) ?? 'reportedAt'
  const sortDir = search.dir ?? 'desc'
  filtered = [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'severity') {
      cmp = (SEVERITY_ORDER[a.severity] ?? 0) - (SEVERITY_ORDER[b.severity] ?? 0)
    } else if (sortKey === 'reportedAt') {
      cmp = new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime()
    } else {
      const av = String((a as Record<string, unknown>)[sortKey] ?? '')
      const bv = String((b as Record<string, unknown>)[sortKey] ?? '')
      cmp = av.localeCompare(bv)
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const hasActiveFilters = Boolean(
    search.severity ||
      search.status ||
      search.category ||
      (showLocation && search.locationId) ||
      search.q,
  )

  useEffect(() => {
    const listViewKey = [
      incidents.length,
      openIncidents.length,
      filtered.length,
      hasActiveFilters,
      canWrite,
    ].join(':')
    if (listViewKeyRef.current === listViewKey) return
    listViewKeyRef.current = listViewKey
    trackProductEvent('incident_list_viewed', {
      route: INCIDENT_LIST_ANALYTICS_ROUTE,
      row_count_bucket: getProductAnalyticsRowCountBucket(incidents.length),
      visible_row_count_bucket: getProductAnalyticsRowCountBucket(filtered.length),
      open_row_count_bucket: getProductAnalyticsRowCountBucket(openIncidents.length),
      has_active_filters: hasActiveFilters,
      can_write: canWrite,
    })
  }, [canWrite, filtered.length, hasActiveFilters, incidents.length, openIncidents.length])

  useEffect(() => {
    const emptyStateType =
      incidents.length === 0 ? 'no_incidents' : filtered.length === 0 ? 'no_matches' : null
    if (!emptyStateType) return
    const emptyStateKey = `${emptyStateType}:${hasActiveFilters}:${canWrite}`
    if (emptyStateKeyRef.current === emptyStateKey) return
    emptyStateKeyRef.current = emptyStateKey
    trackProductEvent('incident_empty_state_viewed', {
      route: INCIDENT_LIST_ANALYTICS_ROUTE,
      empty_state_type: emptyStateType,
      has_active_filters: hasActiveFilters,
      can_write: canWrite,
    })
  }, [canWrite, filtered.length, hasActiveFilters, incidents.length])

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return null
    return <span className="ml-1 text-text-muted">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  function SortableHead({
    col,
    children,
    className,
  }: {
    col: SortKey
    children: React.ReactNode
    className?: string
  }) {
    return (
      <TableHead
        className={className}
        onClick={() => toggleSort(col)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {children}
        <SortIndicator col={col} />
      </TableHead>
    )
  }

  // CSV export - no PHI fields. Title and summary are treated as PHI
  // (see updateIncident in packages/compliance/src/incidents.ts), so only
  // a short opaque ID prefix plus non-identifying classification columns
  // are exported.
  const handleExportCsv = () => {
    trackProductEvent('incident_exported', {
      route: INCIDENT_LIST_ANALYTICS_ROUTE,
      export_format: 'csv',
      row_count_bucket: getProductAnalyticsRowCountBucket(filtered.length),
      has_active_filters: hasActiveFilters,
    })
    const headers = ['ID', 'Severity', 'Category', 'Location', 'Status', 'Reported']
    const rows = filtered.map((i) => [
      i.id.slice(0, 8),
      SEVERITY_LABELS[i.severity] ?? toTitleCase(i.severity),
      toTitleCase(i.category),
      locationName(i.locationId),
      STATUS_LABELS[i.status] ?? toTitleCase(i.status),
      new Date(i.reportedAt).toISOString(),
    ])
    // Quote every field: location names are free-text and may contain commas,
    // quotes, or newlines that would otherwise corrupt the CSV.
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`
    const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'incidents.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <nav>
        <Link to="/app/compliance" className="text-sm text-text-muted hover:text-text-primary">
          ← Compliance
        </Link>
      </nav>

      <PageHeader
        eyebrow="Compliance"
        title="Incidents"
        description={
          canWrite
            ? 'Review open incidents, severity levels, and response status.'
            : 'Read-only access. Incident reporting is disabled.'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {canWrite ? (
              <Button asChild size="sm">
                <Link
                  to="/app/compliance/incidents/new"
                  onClick={() =>
                    trackProductEvent('incident_report_started', {
                      route: INCIDENT_LIST_ANALYTICS_ROUTE,
                    })
                  }
                >
                  Report incident
                </Link>
              </Button>
            ) : null}
            {filtered.length > 0 ? (
              <Button size="sm" variant="outline" onClick={handleExportCsv}>
                Download CSV
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetric
          label="Open"
          value={openIncidents.length}
          detail="Reported, triaging, or contained"
          tone={openIncidents.length > 0 ? 'warning' : 'success'}
        />
        <SummaryMetric
          label="Critical or high"
          value={criticalOrHigh}
          detail="Among open incidents"
          tone={criticalOrHigh > 0 ? 'danger' : 'neutral'}
        />
        <SummaryMetric
          label="Contained"
          value={contained}
          detail="Awaiting resolution"
          tone="brand"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={search.severity ?? 'all'} onValueChange={(v) => setFilter('severity', v)}>
          <SelectTrigger className="w-36 text-sm" aria-label="Filter by severity">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            {Object.entries(SEVERITY_LABELS).map(([k, label]) => (
              <SelectItem key={k} value={k}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={search.status ?? 'all'} onValueChange={(v) => setFilter('status', v)}>
          <SelectTrigger className="w-36 text-sm" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, label]) => (
              <SelectItem key={k} value={k}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {categories.length > 0 ? (
          <Select value={search.category ?? 'all'} onValueChange={(v) => setFilter('category', v)}>
            <SelectTrigger className="w-44 text-sm" aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {toTitleCase(cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {showLocation ? (
          <Select
            value={search.locationId ?? 'all'}
            onValueChange={(v) => setFilter('locationId', v)}
          >
            <SelectTrigger className="w-44 text-sm" aria-label="Filter by location">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {scope.locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <InputPrimitive
          type="search"
          placeholder="Search incidents…"
          value={localQ}
          onChange={(e) => handleQChange(e.target.value)}
          className="w-56 text-sm"
          aria-label="Search incidents"
        />

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-text-link hover:underline"
          >
            Clear filters
          </button>
        ) : null}

        {hasActiveFilters ? (
          <span className="text-sm text-text-muted">
            {filtered.length} of {incidents.length} shown
          </span>
        ) : null}
      </div>

      {incidents.length === 0 ? (
        <Panel className="border-dashed bg-surface-50 text-center">
          <PanelHeader
            title="No incidents reported"
            description={
              canWrite
                ? 'No incidents on record. Use the report button if one occurs.'
                : 'No incidents on record. Reporting is disabled in this workspace.'
            }
          />
        </Panel>
      ) : filtered.length === 0 ? (
        <Panel className="border-dashed bg-surface-50 text-center">
          <PanelHeader
            title="No matching incidents"
            description="Adjust the filters or search to show results."
          />
        </Panel>
      ) : (
        <Panel>
          <PanelHeader
            title="Incident log"
            description="Reports sorted by most recent, with severity and status."
          />
          <TableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead col="title">Title</SortableHead>
                  <SortableHead col="severity">Severity</SortableHead>
                  <SortableHead col="category">Category</SortableHead>
                  {showLocation ? <TableHead>Location</TableHead> : null}
                  <SortableHead col="status">Status</SortableHead>
                  <SortableHead col="reportedAt">Reported</SortableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="min-w-60">
                      <Link
                        to="/app/compliance/incidents/$incidentId"
                        params={{ incidentId: inc.id }}
                        className="break-words font-medium text-text-link"
                      >
                        {inc.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-semibold ${SEVERITY_CLASSES[inc.severity] ?? 'text-text-muted'}`}
                      >
                        {SEVERITY_LABELS[inc.severity] ?? toTitleCase(inc.severity)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">
                      {toTitleCase(inc.category)}
                    </TableCell>
                    {showLocation ? (
                      <TableCell className="text-sm text-text-secondary">
                        {locationName(inc.locationId)}
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <Badge
                        variant={
                          inc.status === 'resolved' || inc.status === 'closed'
                            ? 'success'
                            : inc.status === 'reported' || inc.status === 'triaging'
                              ? 'warning'
                              : 'default'
                        }
                      >
                        {STATUS_LABELS[inc.status] ?? toTitleCase(inc.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-text-secondary">
                      {formatDate(inc.reportedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableShell>
        </Panel>
      )}
    </div>
  )
}
