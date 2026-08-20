import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react'
import { isFeatureGateError } from '@phiguard/billing'
import { BackLinkAnchor, BackLinkNav, Badge, EmptyState, InputPrimitive, PageHeader, SummaryMetric, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableShell } from '@phiguard/ui'
import { FeatureGate } from '../../components/feature-gate.js'
import { listControlsFn } from '../../server/soc2.js'
import { getOrgFeatureContextFn } from '../../server/feature-context.js'
import { AppRouteErrorBoundary } from '../../components/compliance-error-boundary'
import { trackProductEvent } from '../../lib/product-analytics-browser'

export const Route = createFileRoute('/app/soc2/controls')({
  validateSearch: (search: Record<string, unknown>) => ({
    missingOnly: search.missingOnly === 'true' || search.missingOnly === true || undefined,
    q: (search.q as string | undefined) ?? undefined,
    sort: (search.sort as string | undefined) ?? undefined,
    dir: (search.dir as 'asc' | 'desc' | undefined) ?? undefined,
  }),
  loader: async () => {
    try {
      return await listControlsFn()
    } catch (err) {
      if (isFeatureGateError(err)) return { gatedOrg: await getOrgFeatureContextFn() }
      throw err
    }
  },
  component: Soc2ControlsPage,
  errorComponent: AppRouteErrorBoundary,
})

const CATEGORY_LABELS: Record<string, string> = {
  CC1: 'Control Environment',
  CC2: 'Communication & Information',
  CC3: 'Risk Assessment',
  CC4: 'Monitoring Activities',
  CC5: 'Control Activities',
  CC6: 'Logical & Physical Access',
  CC7: 'System Operations',
  CC8: 'Change Management',
  CC9: 'Risk Mitigation',
}

type SortControlKey = 'controlId' | 'category' | 'evidenceCount'
type Soc2ControlSummary = {
  id: string
  controlId: string
  title: string
  category: string
  evidenceCount: number
}

function Soc2ControlsPage() {
  const data = Route.useLoaderData()

  if ('gatedOrg' in data) {
    return (
      <div className="mx-auto max-w-5xl">
        <BackLink />
        <PageHeader title="SOC 2 Controls" description="Trust Services Criteria controls tracked for your audit." />
        <FeatureGate feature="soc2_evidence" org={data.gatedOrg}>{null}</FeatureGate>
      </div>
    )
  }

  return <Soc2ControlsLoaded controls={data} />
}

function Soc2ControlsLoaded({ controls }: { controls: Soc2ControlSummary[] }) {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/app/soc2/controls' })
  const [localQ, setLocalQ] = useState(search.q ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deferredQ = useDeferredValue(localQ)

  useEffect(() => {
    setLocalQ(search.q ?? '')
  }, [search.q])

  const handleQChange = useCallback(
    (value: string) => {
      setLocalQ(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        void navigate({ search: (prev) => ({ ...prev, q: value }) })
      }, 300)
    },
    [navigate],
  )

  const clearFilters = useCallback(() => {
    void navigate({ search: () => ({ missingOnly: undefined, q: undefined, sort: undefined, dir: undefined }) })
    setLocalQ('')
  }, [navigate])

  const toggleMissingOnly = useCallback(() => {
    trackProductEvent('soc2_controls_filter_changed', {
      route: '/app/soc2/controls',
      action: 'missing_only',
      status: search.missingOnly ? 'disabled' : 'enabled',
    })
    void navigate({ search: (prev) => ({ ...prev, missingOnly: prev.missingOnly ? undefined : (true as const) }) })
  }, [navigate, search.missingOnly])

  const toggleSort = useCallback(
    (col: SortControlKey) => {
      const nextDir = search.sort === col && search.dir === 'desc' ? 'asc' : 'desc'
      trackProductEvent('soc2_controls_sort_changed', {
        route: '/app/soc2/controls',
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

  type Control = (typeof controls)[number]

  const coveredCount = controls.filter((ctrl: Control) => ctrl.evidenceCount > 0).length
  const missingCount = controls.length - coveredCount

  const q = deferredQ.trim().toLowerCase()
  let filteredControls = controls
  if (search.missingOnly) {
    filteredControls = filteredControls.filter((ctrl: Control) => ctrl.evidenceCount === 0)
  }
  if (q) {
    filteredControls = filteredControls.filter(
      (ctrl: Control) =>
        ctrl.controlId.toLowerCase().includes(q) ||
        ctrl.title.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[ctrl.category] ?? ctrl.category).toLowerCase().includes(q),
    )
  }

  const sortKey = (search.sort as SortControlKey | undefined) ?? 'controlId'
  const sortDir = search.dir ?? 'asc'
  filteredControls = [...filteredControls].sort((a: Control, b: Control) => {
    let cmp = 0
    if (sortKey === 'evidenceCount') {
      cmp = a.evidenceCount - b.evidenceCount
    } else if (sortKey === 'category') {
      cmp = (CATEGORY_LABELS[a.category] ?? a.category).localeCompare(
        CATEGORY_LABELS[b.category] ?? b.category,
      )
    } else {
      cmp = a.controlId.localeCompare(b.controlId)
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const hasActiveFilters = Boolean(search.missingOnly || search.q)

  useEffect(() => {
    trackProductEvent('soc2_controls_viewed', {
      route: '/app/soc2/controls',
      count: controls.length,
    })
  }, [controls.length])

  useEffect(() => {
    if (!search.q?.trim()) return
    trackProductEvent('soc2_controls_search_performed', {
      route: '/app/soc2/controls',
      has_active_filters: true,
    })
  }, [search.q])

  function SortIndicatorC({ col }: { col: SortControlKey }) {
    if (sortKey !== col) return null
    return <span className="ml-1 text-text-muted">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  function SortableControlHead({
    col,
    children,
    className,
  }: {
    col: SortControlKey
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
        <SortIndicatorC col={col} />
      </TableHead>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />

      <PageHeader
        title="SOC 2 Controls"
        description="Trust Services Criteria controls in scope for your audit. Shows evidence coverage per control."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryMetric label="Controls" value={controls.length} detail="In audit scope" />
        <SummaryMetric label="With evidence" value={coveredCount} detail="At least one evidence item attached" tone="success" />
        <SummaryMetric label="Missing evidence" value={missingCount} detail="No evidence attached yet" tone={missingCount > 0 ? 'warning' : 'success'} />
      </div>

      {/* Filter bar */}
      {controls.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={search.missingOnly ?? false}
              onChange={toggleMissingOnly}
              className="h-4 w-4 rounded border border-border-strong accent-brand-600"
            />
            Missing evidence only
          </label>

          <InputPrimitive
            type="search"
            placeholder="Search controls…"
            value={localQ}
            onChange={(e) => handleQChange(e.target.value)}
            className="w-56 text-sm"
            aria-label="Search SOC 2 controls"
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
              {filteredControls.length} of {controls.length} shown
            </span>
          ) : null}
        </div>
      ) : null}

      {controls.length === 0 ? (
        <EmptyState
          heading="No controls"
          description="Controls will appear here once the control catalog is set up for your organization."
        />
      ) : filteredControls.length === 0 ? (
        <div className="rounded-md border border-dashed border-border-subtle px-4 py-8 text-center text-sm text-text-muted">
          No controls match these filters.{' '}
          <button type="button" onClick={clearFilters} className="text-text-link hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <TableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableControlHead col="controlId">Control ID</SortableControlHead>
                <SortableControlHead col="category">Category</SortableControlHead>
                <TableHead className="min-w-80">Title</TableHead>
                <SortableControlHead col="evidenceCount" className="text-right">Evidence</SortableControlHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredControls.map((ctrl: Control) => (
                <TableRow key={ctrl.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    <Link
                      to="/app/soc2/evidence"
                      search={{ controlId: ctrl.controlId }}
                      className="text-text-link"
                      onClick={() =>
                        trackProductEvent('soc2_control_evidence_opened', {
                          route: '/app/soc2/controls',
                          destination_route: '/app/soc2/evidence',
                          status: ctrl.evidenceCount > 0 ? 'covered' : 'missing',
                        })
                      }
                    >
                      {ctrl.controlId}
                    </Link>
                  </TableCell>
                  <TableCell className="min-w-48 text-text-muted">
                    {CATEGORY_LABELS[ctrl.category] ?? ctrl.category}
                  </TableCell>
                  <TableCell className="min-w-80 break-words">{ctrl.title}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={ctrl.evidenceCount > 0 ? 'success' : 'default'}>
                      {ctrl.evidenceCount}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      )}
    </div>
  )
}

function BackLink() {
  return (
    <BackLinkNav>
      <BackLinkAnchor as={Link} to="/app/soc2">
        Back to SOC 2
      </BackLinkAnchor>
    </BackLinkNav>
  )
}
