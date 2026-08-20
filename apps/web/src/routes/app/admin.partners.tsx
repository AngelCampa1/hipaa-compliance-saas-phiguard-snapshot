import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react'
import {
  Alert,
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
  formatCents,
} from '@phiguard/ui'
import { formatDate } from '../../lib/dates.js'
import { getClientErrorMessage } from '../../lib/client-errors'
import {
  adminApprovePartnerFn,
  adminListPartnersFn,
  adminListPayoutsFn,
  adminRunPayoutsFn,
  adminMarkPayoutPaidFn,
} from '../../server/partners'
import {
  getProductAnalyticsRowCountBucket,
  trackProductEvent,
} from '../../lib/product-analytics-browser'

const ACCESS_DENIED_CODES = new Set(['partners.admin_only', 'access_denied', 'forbidden'])

function isAccessDeniedError(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const code = (err as Record<string, unknown>).code
    if (typeof code === 'string' && ACCESS_DENIED_CODES.has(code)) return true
    const status = (err as Record<string, unknown>).status
    if (status === 403) return true
  }
  return false
}

function PartnersLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Panel>
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Panel>
    </div>
  )
}

const PARTNERS_PAGE_SIZE = 25
const PAYOUTS_PAGE_SIZE = 25
// Sentinel for the "All" filter option — Radix Select.Item cannot use an empty string.
const ALL_FILTER = 'all'

export const Route = createFileRoute('/app/admin/partners')({
  validateSearch: (search: Record<string, unknown>) => ({
    pStatus: (search.pStatus as string | undefined) ?? undefined,
    pSort: (search.pSort as string | undefined) ?? undefined,
    pDir: (search.pDir as 'asc' | 'desc' | undefined) ?? undefined,
    pQ: (search.pQ as string | undefined) ?? undefined,
    pPage: typeof search.pPage === 'number' ? search.pPage : Number(search.pPage ?? 1) || 1,
    oStatus: (search.oStatus as string | undefined) ?? undefined,
    oSort: (search.oSort as string | undefined) ?? undefined,
    oDir: (search.oDir as 'asc' | 'desc' | undefined) ?? undefined,
    oQ: (search.oQ as string | undefined) ?? undefined,
    oPage: typeof search.oPage === 'number' ? search.oPage : Number(search.oPage ?? 1) || 1,
  }),
  loader: async () => {
    try {
      const [{ partners }, { payouts }] = await Promise.all([
        adminListPartnersFn(),
        adminListPayoutsFn(),
      ])
      return { partners, payouts, accessDenied: false }
    } catch (err) {
      if (isAccessDeniedError(err)) {
        return { partners: [], payouts: [], accessDenied: true }
      }
      throw err
    }
  },
  pendingComponent: PartnersLoadingSkeleton,
  errorComponent: PartnersErrorPanel,
  component: AdminPartnersPage,
})

function PartnersErrorPanel() {
  const router = useRouter()
  const handleRetry = () => {
    trackProductEvent('partner_admin_load_retry_clicked', {
      route: '/app/admin/partners',
      category: 'overview',
      action: 'retry',
    })
    void router.invalidate()
  }

  return (
    <StatusPanel
      variant="error"
      title="Could not load partner data"
      description="There was a problem retrieving partner records. Check your connection and try again."
      action={{ label: 'Try again', onClick: handleRetry }}
    />
  )
}

type SortPartnerKey = 'name' | 'email' | 'status' | 'totalReferrals' | 'totalLtvCents'
type SortPayoutKey = 'partnerName' | 'periodStart' | 'amountCents' | 'status'

function AdminPartnersPage() {
  const { partners, payouts, accessDenied } = Route.useLoaderData()
  const router = useRouter()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/app/admin/partners' })
  const [isRunning, setIsRunning] = useState(false)
  const [approvingPartnerId, setApprovingPartnerId] = useState<string | null>(null)
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null)
  const [payoutReferences, setPayoutReferences] = useState<Record<string, string>>({})
  const [runError, setRunError] = useState<string | null>(null)
  const [runResult, setRunResult] = useState<string | null>(null)
  const viewTrackedRef = useRef<string | null>(null)
  const emptyTrackedRef = useRef<string | null>(null)

  // Partners search
  const [localPQ, setLocalPQ] = useState(search.pQ ?? '')
  const pDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deferredPQ = useDeferredValue(localPQ)

  useEffect(() => { setLocalPQ(search.pQ ?? '') }, [search.pQ])

  const handlePQChange = useCallback((value: string) => {
    setLocalPQ(value)
    if (pDebounceRef.current) clearTimeout(pDebounceRef.current)
    pDebounceRef.current = setTimeout(() => {
      void navigate({ search: (prev) => ({ ...prev, pQ: value, pPage: 1 }) })
      if (value.trim()) {
        trackProductEvent('partner_admin_search_performed', {
          route: '/app/admin/partners',
          category: 'partners',
          status: 'attempted',
          has_active_filters: Boolean(search.pStatus),
        })
      }
    }, 300)
  }, [navigate, search.pStatus])

  // Payouts search
  const [localOQ, setLocalOQ] = useState(search.oQ ?? '')
  const oDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deferredOQ = useDeferredValue(localOQ)

  useEffect(() => { setLocalOQ(search.oQ ?? '') }, [search.oQ])

  const handleOQChange = useCallback((value: string) => {
    setLocalOQ(value)
    if (oDebounceRef.current) clearTimeout(oDebounceRef.current)
    oDebounceRef.current = setTimeout(() => {
      void navigate({ search: (prev) => ({ ...prev, oQ: value, oPage: 1 }) })
      if (value.trim()) {
        trackProductEvent('partner_admin_search_performed', {
          route: '/app/admin/partners',
          category: 'payouts',
          status: 'attempted',
          has_active_filters: Boolean(search.oStatus),
        })
      }
    }, 300)
  }, [navigate, search.oStatus])

  const setPFilter = useCallback((key: string, value: string) => {
    // Radix Select.Item cannot use an empty value; the "All" option uses the
    // ALL_FILTER sentinel, mapped back to undefined to clear the filter.
    const next = value === ALL_FILTER || value === '' ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, [key]: next, pPage: 1 }) })
    trackProductEvent('partner_admin_filter_changed', {
      route: '/app/admin/partners',
      category: 'partners',
      action: key === 'pStatus' ? 'status_filter' : 'filter',
      status: next || 'all',
    })
  }, [navigate])

  const setOFilter = useCallback((key: string, value: string) => {
    const next = value === ALL_FILTER || value === '' ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, [key]: next, oPage: 1 }) })
    trackProductEvent('partner_admin_filter_changed', {
      route: '/app/admin/partners',
      category: 'payouts',
      action: key === 'oStatus' ? 'status_filter' : 'filter',
      status: next || 'all',
    })
  }, [navigate])

  const clearPFilters = useCallback(() => {
    void navigate({ search: (prev) => ({ ...prev, pStatus: undefined, pSort: undefined, pDir: undefined, pQ: undefined, pPage: 1 }) })
    setLocalPQ('')
    trackProductEvent('partner_admin_filter_changed', {
      route: '/app/admin/partners',
      category: 'partners',
      action: 'clear_filters',
      status: 'all',
    })
  }, [navigate])

  const clearOFilters = useCallback(() => {
    void navigate({ search: (prev) => ({ ...prev, oStatus: undefined, oSort: undefined, oDir: undefined, oQ: undefined, oPage: 1 }) })
    setLocalOQ('')
    trackProductEvent('partner_admin_filter_changed', {
      route: '/app/admin/partners',
      category: 'payouts',
      action: 'clear_filters',
      status: 'all',
    })
  }, [navigate])

  const togglePSort = useCallback((col: SortPartnerKey) => {
    const nextDir = search.pSort === col && search.pDir === 'desc' ? 'asc' : 'desc'
    void navigate({
      search: (prev) => ({
        ...prev,
        pSort: col,
        pDir: nextDir,
        pPage: 1,
      }),
    })
    trackProductEvent('partner_admin_sort_changed', {
      route: '/app/admin/partners',
      category: 'partners',
      sort_key: col,
      sort_dir: nextDir,
    })
  }, [navigate, search.pDir, search.pSort])

  const toggleOSort = useCallback((col: SortPayoutKey) => {
    const nextDir = search.oSort === col && search.oDir === 'desc' ? 'asc' : 'desc'
    void navigate({
      search: (prev) => ({
        ...prev,
        oSort: col,
        oDir: nextDir,
        oPage: 1,
      }),
    })
    trackProductEvent('partner_admin_sort_changed', {
      route: '/app/admin/partners',
      category: 'payouts',
      sort_key: col,
      sort_dir: nextDir,
    })
  }, [navigate, search.oDir, search.oSort])

  // Partners filter + sort + paginate
  const pQ = deferredPQ.trim().toLowerCase()
  let filteredPartners = partners
  if (search.pStatus) {
    filteredPartners = filteredPartners.filter((p) => p.status === search.pStatus)
  }
  if (pQ) {
    filteredPartners = filteredPartners.filter(
      (p) =>
        p.name.toLowerCase().includes(pQ) ||
        p.email.toLowerCase().includes(pQ) ||
        (p.referralCode ?? '').toLowerCase().includes(pQ) ||
        (p.company ?? '').toLowerCase().includes(pQ),
    )
  }
  const pSortKey = (search.pSort as SortPartnerKey | undefined) ?? 'name'
  const pSortDir = search.pDir ?? 'asc'
  filteredPartners = [...filteredPartners].sort((a, b) => {
    let cmp = 0
    if (pSortKey === 'totalLtvCents') cmp = a.totalLtvCents - b.totalLtvCents
    else if (pSortKey === 'totalReferrals') cmp = a.totalReferrals - b.totalReferrals
    else if (pSortKey === 'status') cmp = a.status.localeCompare(b.status)
    else if (pSortKey === 'email') cmp = a.email.localeCompare(b.email)
    else cmp = a.name.localeCompare(b.name)
    return pSortDir === 'asc' ? cmp : -cmp
  })
  const pPage = search.pPage ?? 1
  const pTotalPages = Math.max(1, Math.ceil(filteredPartners.length / PARTNERS_PAGE_SIZE))
  const pCurrentPage = Math.min(pPage, pTotalPages)
  const paginatedPartners = filteredPartners.slice(
    (pCurrentPage - 1) * PARTNERS_PAGE_SIZE,
    pCurrentPage * PARTNERS_PAGE_SIZE,
  )
  const hasActivePFilters = Boolean(search.pStatus || search.pQ)

  // Payouts filter + sort + paginate
  const oQ = deferredOQ.trim().toLowerCase()
  let filteredPayouts = payouts
  if (search.oStatus) {
    filteredPayouts = filteredPayouts.filter((p) => p.status === search.oStatus)
  }
  if (oQ) {
    filteredPayouts = filteredPayouts.filter(
      (p) =>
        p.partnerName.toLowerCase().includes(oQ) ||
        (p.externalReference ?? '').toLowerCase().includes(oQ),
    )
  }
  const oSortKey = (search.oSort as SortPayoutKey | undefined) ?? 'periodStart'
  const oSortDir = search.oDir ?? 'desc'
  filteredPayouts = [...filteredPayouts].sort((a, b) => {
    let cmp = 0
    if (oSortKey === 'amountCents') cmp = a.amountCents - b.amountCents
    else if (oSortKey === 'status') cmp = a.status.localeCompare(b.status)
    else if (oSortKey === 'partnerName') cmp = a.partnerName.localeCompare(b.partnerName)
    else cmp = new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime()
    return oSortDir === 'asc' ? cmp : -cmp
  })
  const oPage = search.oPage ?? 1
  const oTotalPages = Math.max(1, Math.ceil(filteredPayouts.length / PAYOUTS_PAGE_SIZE))
  const oCurrentPage = Math.min(oPage, oTotalPages)
  const paginatedPayouts = filteredPayouts.slice(
    (oCurrentPage - 1) * PAYOUTS_PAGE_SIZE,
    oCurrentPage * PAYOUTS_PAGE_SIZE,
  )
  const hasActiveOFilters = Boolean(search.oStatus || search.oQ)

  useEffect(() => {
    const viewKey = `${accessDenied}:${partners.length}:${payouts.length}`
    if (viewTrackedRef.current === viewKey) return
    viewTrackedRef.current = viewKey

    if (accessDenied) {
      trackProductEvent('partner_admin_access_denied_viewed', {
        route: '/app/admin/partners',
        status: 'blocked',
      })
      return
    }

    trackProductEvent('partner_admin_viewed', {
      route: '/app/admin/partners',
      category: 'overview',
      row_count_bucket: getProductAnalyticsRowCountBucket(partners.length),
      count: payouts.length,
    })
  }, [accessDenied, partners.length, payouts.length])

  useEffect(() => {
    if (accessDenied) return

    const emptyKey = `${partners.length === 0}:${filteredPartners.length === 0}:${payouts.length === 0}:${filteredPayouts.length === 0}:${hasActivePFilters}:${hasActiveOFilters}`
    if (emptyTrackedRef.current === emptyKey) return
    emptyTrackedRef.current = emptyKey

    if (partners.length === 0 || filteredPartners.length === 0) {
      trackProductEvent('partner_admin_empty_state_viewed', {
        route: '/app/admin/partners',
        category: 'partners',
        status: partners.length === 0 ? 'empty' : 'filtered_empty',
        has_active_filters: hasActivePFilters,
      })
    }

    if (payouts.length === 0 || filteredPayouts.length === 0) {
      trackProductEvent('partner_admin_empty_state_viewed', {
        route: '/app/admin/partners',
        category: 'payouts',
        status: payouts.length === 0 ? 'empty' : 'filtered_empty',
        has_active_filters: hasActiveOFilters,
      })
    }
  }, [
    accessDenied,
    filteredPartners.length,
    filteredPayouts.length,
    hasActiveOFilters,
    hasActivePFilters,
    partners.length,
    payouts.length,
  ])

  function SortIndicatorP({ col }: { col: SortPartnerKey }) {
    if (pSortKey !== col) return null
    return <span className="ml-1 text-text-muted">{pSortDir === 'asc' ? '↑' : '↓'}</span>
  }

  function SortIndicatorO({ col }: { col: SortPayoutKey }) {
    if (oSortKey !== col) return null
    return <span className="ml-1 text-text-muted">{oSortDir === 'asc' ? '↑' : '↓'}</span>
  }

  function SPHead({ col, children, className }: { col: SortPartnerKey; children: React.ReactNode; className?: string }) {
    return (
      <TableHead className={className} onClick={() => togglePSort(col)} style={{ cursor: 'pointer', userSelect: 'none' }}>
        {children}<SortIndicatorP col={col} />
      </TableHead>
    )
  }

  function SOHead({ col, children, className }: { col: SortPayoutKey; children: React.ReactNode; className?: string }) {
    return (
      <TableHead className={className} onClick={() => toggleOSort(col)} style={{ cursor: 'pointer', userSelect: 'none' }}>
        {children}<SortIndicatorO col={col} />
      </TableHead>
    )
  }

  // CSV export - partners table only, no PHI
  const handleExportPartnersCsv = () => {
    const headers = ['Name', 'Email', 'Company', 'Referral code', 'Commission %', 'Status', 'Referrals', 'Total LTV']
    const rows = filteredPartners.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.email.replace(/"/g, '""')}"`,
      `"${(p.company ?? '').replace(/"/g, '""')}"`,
      p.referralCode ?? '',
      `${p.commissionPct}%`,
      p.status,
      p.totalReferrals,
      formatCents(p.totalLtvCents),
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'partners.csv'
    a.click()
    URL.revokeObjectURL(url)
    trackProductEvent('partner_admin_exported', {
      route: '/app/admin/partners',
      category: 'partners',
      export_format: 'csv',
      row_count_bucket: getProductAnalyticsRowCountBucket(filteredPartners.length),
      has_active_filters: hasActivePFilters,
    })
  }

  if (accessDenied) {
    return (
      <Panel className="text-center">
        <h1 className="text-lg font-semibold text-text-primary mb-2">Access Denied</h1>
        <p className="text-sm text-text-secondary">
          This page is restricted to system administrators.
        </p>
      </Panel>
    )
  }

  async function handleRunPayouts() {
    setRunError(null)
    setRunResult(null)
    setIsRunning(true)

    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    trackProductEvent('partner_admin_payout_run_started', {
      route: '/app/admin/partners',
      category: 'payouts',
      action: 'run_payouts',
    })

    try {
      const result = await adminRunPayoutsFn({
        data: {
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
        },
      })
      setRunResult(`Created ${result.payoutsCreated} payout record(s) for this period.`)
      trackProductEvent('partner_admin_payout_run_completed', {
        route: '/app/admin/partners',
        category: 'payouts',
        action: 'run_payouts',
        status: 'succeeded',
        count: result.payoutsCreated,
      })
    } catch (err) {
      trackProductEvent('partner_admin_payout_run_failed', {
        route: '/app/admin/partners',
        category: 'payouts',
        action: 'run_payouts',
        status: 'failed',
        operation: 'partners.run-payouts',
        error_type: 'client_error',
      })
      setRunError(
        getClientErrorMessage(err, {
          route: '/app/admin/partners',
          operation: 'partners.run-payouts',
          fallbackMessage: 'Unable to run payouts.',
        }),
      )
    } finally {
      setIsRunning(false)
    }
  }

  async function handleMarkPaid(payoutId: string) {
    const externalReference = payoutReferences[payoutId]?.trim() ?? ''
    if (!externalReference) {
      trackProductEvent('partner_admin_payout_mark_paid_failed', {
        route: '/app/admin/partners',
        category: 'payouts',
        action: 'mark_paid',
        status: 'failed',
        reason: 'validation_failed',
      })
      setRunError('Enter the external payment reference before marking this payout paid.')
      return
    }

    setRunError(null)
    setRunResult(null)
    setMarkingPaidId(payoutId)
    try {
      await adminMarkPayoutPaidFn({ data: { payoutId, externalReference } })
      trackProductEvent('partner_admin_payout_marked_paid', {
        route: '/app/admin/partners',
        category: 'payouts',
        action: 'mark_paid',
        status: 'succeeded',
      })
      await router.invalidate()
    } catch (err) {
      trackProductEvent('partner_admin_payout_mark_paid_failed', {
        route: '/app/admin/partners',
        category: 'payouts',
        action: 'mark_paid',
        status: 'failed',
        operation: 'partners.mark-payout-paid',
        error_type: 'client_error',
      })
      setRunError(
        getClientErrorMessage(err, {
          route: '/app/admin/partners',
          operation: 'partners.mark-payout-paid',
          fallbackMessage: 'Unable to mark payout paid.',
        }),
      )
    } finally {
      setMarkingPaidId(null)
    }
  }

  async function handleApprovePartner(partnerId: string) {
    setRunError(null)
    setRunResult(null)
    setApprovingPartnerId(partnerId)
    try {
      const result = await adminApprovePartnerFn({ data: { partnerId } })
      const resultText = result.emailSent
        ? 'Partner approved and magic link sent.'
        : 'Partner approved, but the magic link email could not be sent.'
      setRunResult(resultText)
      trackProductEvent('partner_admin_partner_approved', {
        route: '/app/admin/partners',
        category: 'partners',
        action: 'approve',
        status: result.emailSent ? 'succeeded' : 'partial',
      })
      await router.invalidate()
    } catch (err) {
      trackProductEvent('partner_admin_partner_approve_failed', {
        route: '/app/admin/partners',
        category: 'partners',
        action: 'approve',
        status: 'failed',
        operation: 'partners.approve',
        error_type: 'client_error',
      })
      setRunError(
        getClientErrorMessage(err, {
          route: '/app/admin/partners',
          operation: 'partners.approve',
          fallbackMessage: 'Unable to approve partner.',
        }),
      )
    } finally {
      setApprovingPartnerId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner management"
        description="Review partner performance and run payouts. We hold balances under $50 until the partner reaches the $50 minimum."
        actions={
          <div className="flex flex-wrap gap-2">
            {filteredPartners.length > 0 ? (
              <Button size="sm" variant="outline" onClick={handleExportPartnersCsv}>
                Download CSV
              </Button>
            ) : null}
            <Button onClick={handleRunPayouts} disabled={isRunning} size="sm">
              {isRunning ? 'Running payouts...' : 'Run payouts'}
            </Button>
          </div>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetric
          label="Partners"
          value={partners.length}
          detail="All partner records"
          tone="brand"
        />
        <SummaryMetric label="Payouts" value={payouts.length} detail="Recorded periods" />
        <SummaryMetric
          label="Pending payout"
          value={formatCents(
            payouts
              .filter((p) => p.status === 'pending')
              .reduce((sum, p) => sum + p.amountCents, 0),
          )}
          detail="Awaiting payment"
          tone="warning"
        />
      </div>

      {runError && <Alert tone="danger">{runError}</Alert>}
      {runResult && <Alert tone="success">{runResult}</Alert>}
      <Alert tone="info">
        We hold balances under $50 until the partner reaches the $50 minimum.
      </Alert>

      <Panel>
        <PanelHeader title={`Partners (${partners.length})`} />

        {/* Partners filter bar */}
        {partners.length > 0 ? (
          <div className="mb-4 mt-2 flex flex-wrap items-center gap-3">
            <Select value={search.pStatus || ALL_FILTER} onValueChange={(v) => setPFilter('pStatus', v)}>
              <SelectTrigger className="w-36 text-sm" aria-label="Filter partners by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <InputPrimitive
              type="search"
              placeholder="Search by name, email, or code…"
              value={localPQ}
              onChange={(e) => handlePQChange(e.target.value)}
              className="w-64 text-sm"
              aria-label="Search partners"
            />

            {hasActivePFilters ? (
              <button type="button" onClick={clearPFilters} className="text-sm text-text-link hover:underline">
                Clear filters
              </button>
            ) : null}

            {hasActivePFilters ? (
              <span className="text-sm text-text-muted">
                {filteredPartners.length} of {partners.length} shown
              </span>
            ) : null}
          </div>
        ) : null}

        {partners.length === 0 ? (
          <div className="mt-4">
            <StatusPanel
              variant="empty"
              title="No partners yet"
              description="Partner applications will appear here once submitted. Approved partners receive a referral code and commission on referred clinics."
            />
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="py-6 text-center text-sm text-text-muted">
            No partners match the current filters.{' '}
            <button type="button" onClick={clearPFilters} className="text-text-link hover:underline">Clear filters</button>
          </div>
        ) : (
          <>
          <TableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <SPHead col="name">Name</SPHead>
                  <SPHead col="email">Email</SPHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Referral code</TableHead>
                  <TableHead>Commission</TableHead>
                  <SPHead col="status">Status</SPHead>
                  <SPHead col="totalReferrals">Referrals</SPHead>
                  <SPHead col="totalLtvCents">Total LTV</SPHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPartners.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-text-primary">{p.name}</TableCell>
                    <TableCell className="text-text-secondary">{p.email}</TableCell>
                    <TableCell className="text-text-secondary">{p.company ?? '-'}</TableCell>
                    <TableCell className="text-text-secondary">
                      {p.website ? (
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-link"
                        >
                          {p.website}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-surface-100 px-1.5 py-0.5 rounded">
                        {p.referralCode}
                      </code>
                    </TableCell>
                    <TableCell className="text-text-secondary">{p.commissionPct}%</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === 'active'
                            ? 'success'
                            : p.status === 'inactive'
                              ? 'default'
                              : 'warning'
                        }
                      >
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-secondary">{p.totalReferrals}</TableCell>
                    <TableCell className="font-medium text-text-primary">
                      {formatCents(p.totalLtvCents)}
                    </TableCell>
                    <TableCell>
                      {p.status === 'pending' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprovePartner(p.id)}
                          disabled={approvingPartnerId === p.id}
                        >
                          {approvingPartnerId === p.id ? 'Approving...' : 'Approve'}
                        </Button>
                      ) : (
                        <span className="text-sm text-text-muted">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableShell>
          {pTotalPages > 1 ? (
            <div className="mt-3 flex items-center justify-between text-sm text-text-secondary">
              <span>
                Page {pCurrentPage} of {pTotalPages} ({filteredPartners.length} partner{filteredPartners.length !== 1 ? 's' : ''})
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pCurrentPage <= 1}
                  onClick={() => void navigate({ search: (prev) => ({ ...prev, pPage: pCurrentPage - 1 }) })}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pCurrentPage >= pTotalPages}
                  onClick={() => void navigate({ search: (prev) => ({ ...prev, pPage: pCurrentPage + 1 }) })}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
          </>
        )}
      </Panel>

      <Panel>
        <PanelHeader title="Payout history" />

        {/* Payouts filter bar */}
        {payouts.length > 0 ? (
          <div className="mb-4 mt-2 flex flex-wrap items-center gap-3">
            <Select value={search.oStatus || ALL_FILTER} onValueChange={(v) => setOFilter('oStatus', v)}>
              <SelectTrigger className="w-36 text-sm" aria-label="Filter payouts by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <InputPrimitive
              type="search"
              placeholder="Search by partner name…"
              value={localOQ}
              onChange={(e) => handleOQChange(e.target.value)}
              className="w-56 text-sm"
              aria-label="Search payouts"
            />

            {hasActiveOFilters ? (
              <button type="button" onClick={clearOFilters} className="text-sm text-text-link hover:underline">
                Clear filters
              </button>
            ) : null}

            {hasActiveOFilters ? (
              <span className="text-sm text-text-muted">
                {filteredPayouts.length} of {payouts.length} shown
              </span>
            ) : null}
          </div>
        ) : null}

        {payouts.length === 0 ? (
          <div className="mt-4">
            <StatusPanel
              variant="empty"
              title="No payouts recorded yet"
              description='Use "Run payouts" to generate payout records for partners who have reached the $50 payout minimum.'
            />
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="py-6 text-center text-sm text-text-muted">
            No payouts match the current filters.{' '}
            <button type="button" onClick={clearOFilters} className="text-text-link hover:underline">Clear filters</button>
          </div>
        ) : (
          <>
          <TableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <SOHead col="partnerName">Partner</SOHead>
                  <SOHead col="periodStart">Period</SOHead>
                  <SOHead col="amountCents">Amount</SOHead>
                  <SOHead col="status">Status</SOHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-text-primary">{p.partnerName}</TableCell>
                    <TableCell className="text-text-secondary">
                      {formatDate(p.periodStart, {
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' - '}
                      {formatDate(p.periodEnd, {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-text-primary">
                      {formatCents(p.amountCents)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === 'paid'
                            ? 'success'
                            : p.status === 'cancelled'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.status === 'pending' ? (
                        <InputPrimitive
                          aria-label={`External reference for ${p.partnerName} payout`}
                          value={payoutReferences[p.id] ?? ''}
                          maxLength={120}
                          placeholder="Stripe or ACH reference"
                          onChange={(event) =>
                            setPayoutReferences((current) => ({
                              ...current,
                              [p.id]: event.target.value,
                            }))
                          }
                          className="min-w-56"
                        />
                      ) : p.externalReference ? (
                        <div className="space-y-1">
                          <code className="text-xs bg-surface-100 px-1.5 py-0.5 rounded">
                            {p.externalReference}
                          </code>
                          {p.paidAt ? (
                            <p className="text-xs text-text-muted">
                              Paid{' '}
                              {formatDate(p.paidAt, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                timeZoneName: 'short',
                              })}
                            </p>
                          ) : null}
                        </div>
                      ) : p.paidAt ? (
                        <div className="space-y-1">
                          <span className="text-sm text-text-danger">Missing reference</span>
                          <p className="text-xs text-text-muted">
                            Paid{' '}
                            {formatDate(p.paidAt, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              timeZoneName: 'short',
                            })}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.status === 'pending' && (
                        <Button
                          size="sm"
                          className="bg-success-600 hover:bg-success-700"
                          disabled={
                            markingPaidId === p.id || !(payoutReferences[p.id] ?? '').trim()
                          }
                          onClick={() => handleMarkPaid(p.id)}
                        >
                          {markingPaidId === p.id ? 'Saving...' : 'Mark Paid'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableShell>
          {oTotalPages > 1 ? (
            <div className="mt-3 flex items-center justify-between text-sm text-text-secondary">
              <span>
                Page {oCurrentPage} of {oTotalPages} ({filteredPayouts.length} payout{filteredPayouts.length !== 1 ? 's' : ''})
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={oCurrentPage <= 1}
                  onClick={() => void navigate({ search: (prev) => ({ ...prev, oPage: oCurrentPage - 1 }) })}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={oCurrentPage >= oTotalPages}
                  onClick={() => void navigate({ search: (prev) => ({ ...prev, oPage: oCurrentPage + 1 }) })}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
          </>
        )}
      </Panel>
    </div>
  )
}
