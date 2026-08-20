import { isFeatureGateError } from '@phiguard/billing'
import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Alert, BackLinkAnchor, BackLinkNav, Badge, Button, EmptyState, InputPrimitive, Label, PageHeader, Panel, PanelHeader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SummaryMetric, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableShell } from '@phiguard/ui'
import { formatDate } from '../../lib/dates.js'
import { listAccessReviewsFn, openAccessReviewFn } from '../../server/soc2.js'
import { FeatureGate } from '../../components/feature-gate.js'
import { getOrgFeatureContextFn } from '../../server/feature-context.js'
import { AppRouteErrorBoundary } from '../../components/compliance-error-boundary'
import {
  getProductAnalyticsRowCountBucket,
  trackProductEvent,
} from '../../lib/product-analytics-browser.js'

export const Route = createFileRoute('/app/soc2/access-reviews/')({
  validateSearch: (search: Record<string, unknown>) => ({
    status: (search.status as string | undefined) ?? undefined,
    sort: (search.sort as string | undefined) ?? undefined,
    dir: (search.dir as 'asc' | 'desc' | undefined) ?? undefined,
  }),
  loader: async () => {
    try {
      return await listAccessReviewsFn()
    } catch (err) {
      if (isFeatureGateError(err)) return { gatedOrg: await getOrgFeatureContextFn() }
      throw err
    }
  },
  component: AccessReviewsPage,
  errorComponent: AppRouteErrorBoundary,
})

type SortReviewKey = 'periodStart' | 'periodEnd' | 'status' | 'completedAt'
const ACCESS_REVIEWS_ANALYTICS_ROUTE = '/app/soc2/access-reviews'
// Sentinel for the "All" filter option — Radix Select.Item cannot use an empty string.
const ALL_FILTER = 'all'

function AccessReviewsPage() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/app/soc2/access-reviews/' })
  const router = useRouter()
  const [showOpenForm, setShowOpenForm] = useState(false)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gatedOrg = 'gatedOrg' in data ? data.gatedOrg : null
  const accessReviewData = 'reviews' in data ? data : null
  const reviews = accessReviewData?.reviews ?? []
  const canAdmin = accessReviewData?.canAdmin ?? false
  type AccessReview = (typeof reviews)[number]
  const openCount = reviews.filter((review) => review.status !== 'closed').length
  const completedCount = reviews.filter((review) => review.completedAt).length

  const setFilter = useCallback(
    (key: string, value: string) => {
      // Radix Select.Item cannot use an empty value; the "All" option uses the
      // ALL_FILTER sentinel, mapped back to undefined to clear the filter.
      const next = value === ALL_FILTER || value === '' ? undefined : value
      trackProductEvent('access_review_filter_changed', {
        route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
        filter_type: key,
        action: next ? 'apply_filter' : 'clear_filter',
      })
      void navigate({ search: (prev) => ({ ...prev, [key]: next }) })
    },
    [navigate],
  )

  const clearFilters = useCallback(() => {
    trackProductEvent('access_review_filter_changed', {
      route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
      filter_type: 'all',
      action: 'clear_filter',
    })
    void navigate({ search: () => ({ status: undefined, sort: undefined, dir: undefined }) })
  }, [navigate])

  const toggleSort = useCallback(
    (col: SortReviewKey) => {
      const nextDir = search.sort === col && search.dir === 'desc' ? 'asc' : 'desc'
      trackProductEvent('access_review_sort_changed', {
        route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
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

  let filteredReviews = reviews
  if (search.status) {
    filteredReviews = filteredReviews.filter((r) => r.status === search.status)
  }

  const sortKey = (search.sort as SortReviewKey | undefined) ?? 'periodStart'
  const sortDir = search.dir ?? 'desc'
  filteredReviews = [...filteredReviews].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'periodStart') {
      cmp = new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime()
    } else if (sortKey === 'periodEnd') {
      cmp = new Date(a.periodEnd).getTime() - new Date(b.periodEnd).getTime()
    } else if (sortKey === 'completedAt') {
      cmp = new Date(a.completedAt ?? 0).getTime() - new Date(b.completedAt ?? 0).getTime()
    } else if (sortKey === 'status') {
      cmp = a.status.localeCompare(b.status)
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const hasActiveFilters = Boolean(search.status)

  useEffect(() => {
    if (!gatedOrg) return
    trackProductEvent('access_review_feature_gate_viewed', {
      route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
      feature: 'soc2_evidence',
      status: 'blocked',
    })
  }, [gatedOrg])

  useEffect(() => {
    if (gatedOrg) return
    trackProductEvent('access_reviews_viewed', {
      route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
      row_count_bucket: getProductAnalyticsRowCountBucket(reviews.length),
      visible_row_count_bucket: getProductAnalyticsRowCountBucket(filteredReviews.length),
      has_active_filters: hasActiveFilters,
      can_manage: canAdmin,
    })
  }, [canAdmin, filteredReviews.length, gatedOrg, hasActiveFilters, reviews.length])

  useEffect(() => {
    if (gatedOrg) return
    const emptyStateType =
      reviews.length === 0 ? 'no_reviews' : filteredReviews.length === 0 ? 'no_matches' : null
    if (!emptyStateType) return
    trackProductEvent('access_review_empty_state_viewed', {
      route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
      empty_state_type: emptyStateType,
      has_active_filters: hasActiveFilters,
      can_manage: canAdmin,
    })
  }, [canAdmin, filteredReviews.length, gatedOrg, hasActiveFilters, reviews.length])

  if (gatedOrg) {
    return (
      <div className="mx-auto max-w-5xl">
        <BackLink />
        <PageHeader title="Access Reviews" description="Quarterly access reviews required by SOC 2 CC6.2." />
        <FeatureGate feature="soc2_evidence" org={gatedOrg}>{null}</FeatureGate>
      </div>
    )
  }

  function SortIndicatorAR({ col }: { col: SortReviewKey }) {
    if (sortKey !== col) return null
    return <span className="ml-1 text-text-muted">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  function SortableReviewHead({
    col,
    children,
    className,
  }: {
    col: SortReviewKey
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
        <SortIndicatorAR col={col} />
      </TableHead>
    )
  }

  const handleOpenReview = async (event: FormEvent) => {
    event.preventDefault()
    if (!periodStart || !periodEnd) return
    setError(null)
    setOpening(true)
    trackProductEvent('access_review_open_started', {
      route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
      feature: 'soc2_access_reviews',
    })
    try {
      await openAccessReviewFn({
        data: {
          periodStart: new Date(periodStart).toISOString(),
          periodEnd: new Date(periodEnd).toISOString(),
        },
      })
      trackProductEvent('access_review_opened', {
        route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
        status: 'open',
      })
      setShowOpenForm(false)
      await router.invalidate()
    } catch (err) {
      trackProductEvent('access_review_action_failed', {
        route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
        operation: 'access_review.open',
      })
      setError((err as Error).message)
    } finally {
      setOpening(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />

      <PageHeader
        title="Access Reviews"
        description="Review workforce access each quarter. Required by SOC 2 CC6.2."
        actions={
          canAdmin ? (
            <Button
              onClick={() => {
                trackProductEvent('access_review_open_started', {
                  route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
                  feature: 'soc2_access_reviews',
                  source: 'page_header',
                })
                setShowOpenForm(true)
              }}
              size="sm"
            >
              Open Review
            </Button>
          ) : null
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryMetric label="Reviews" value={reviews.length} detail="Review periods on record" />
        <SummaryMetric label="Open" value={openCount} detail="Not yet completed" tone={openCount > 0 ? 'warning' : 'success'} />
        <SummaryMetric label="Completed" value={completedCount} detail="Closed or completed" tone="brand" />
      </div>

      {showOpenForm ? (
        <Panel className="mb-6">
          <form onSubmit={handleOpenReview}>
            <PanelHeader title="Open Access Review" description="Set the review period. You will record a decision for each member." />
            <div className="mb-4 flex flex-wrap gap-4">
              <div>
                <Label htmlFor="access-review-period-start">Period Start</Label>
                <InputPrimitive id="access-review-period-start" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="access-review-period-end">Period End</Label>
                <InputPrimitive id="access-review-period-end" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} required />
              </div>
            </div>
            {error ? <Alert tone="danger" className="mb-3">{error}</Alert> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={opening} size="sm">
                {opening ? 'Opening...' : 'Open Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  trackProductEvent('access_review_open_cancelled', {
                    route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
                    feature: 'soc2_access_reviews',
                  })
                  setShowOpenForm(false)
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      {/* Filter bar */}
      {reviews.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select value={search.status || ALL_FILTER} onValueChange={(v) => setFilter('status', v)}>
            <SelectTrigger className="w-36 text-sm" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER}>All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

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
              {filteredReviews.length} of {reviews.length} shown
            </span>
          ) : null}
        </div>
      ) : null}

      {reviews.length === 0 ? (
        <EmptyState
          heading="No access reviews"
          description="Open a quarterly review to verify workforce access. Record a keep, revoke, or role-change decision for each member."
          action={
            canAdmin ? (
              <Button
                onClick={() => {
                  trackProductEvent('access_review_open_started', {
                    route: ACCESS_REVIEWS_ANALYTICS_ROUTE,
                    feature: 'soc2_access_reviews',
                    source: 'empty_state',
                  })
                  setShowOpenForm(true)
                }}
              >
                Open Review
              </Button>
            ) : null
          }
        />
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-md border border-dashed border-border-subtle px-4 py-8 text-center text-sm text-text-muted">
          No reviews match these filters.{' '}
          <button type="button" onClick={clearFilters} className="text-text-link hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <TableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableReviewHead col="periodStart">Period</SortableReviewHead>
                <SortableReviewHead col="status">Status</SortableReviewHead>
                <SortableReviewHead col="completedAt">Completed</SortableReviewHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review: AccessReview) => (
                <TableRow key={review.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(review.periodStart)} - {formatDate(review.periodEnd)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.status === 'closed' ? 'success' : 'warning'}>
                      {review.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {review.completedAt ? formatDate(review.completedAt) : 'Not completed'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to="/app/soc2/access-reviews/$reviewId" params={{ reviewId: review.id }} className="text-sm text-text-link">
                      Review
                    </Link>
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
