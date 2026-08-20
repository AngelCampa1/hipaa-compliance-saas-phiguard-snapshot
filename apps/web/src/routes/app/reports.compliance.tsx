import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { hasFeatureForOrg, type OrgFeatureContext } from '@phiguard/billing'
import {
  Alert,
  Button,
  PageHeader,
  Panel,
  SummaryMetric,
  TableShell,
} from '@phiguard/ui'
import { FeatureGate } from '../../components/feature-gate.js'
import { getComplianceRollupFn, getRollupOrgPlanFn } from '../../server/rollup.js'
import { exportComplianceRollupFn } from '../../server/reports.js'
import type { LocationRollup } from '@phiguard/compliance'
import { AppRouteErrorBoundary } from '../../components/compliance-error-boundary.js'
import { trackProductEvent } from '../../lib/product-analytics-browser.js'

type SortKey = 'locationName' | 'total' | 'complete' | 'pct'
type SortDir = 'asc' | 'desc'

export const Route = createFileRoute('/app/reports/compliance')({
  loader: async (): Promise<{ org: OrgFeatureContext; rollup: LocationRollup[] | null }> => {
    const org = await getRollupOrgPlanFn()
    const rollup = hasFeatureForOrg(org, 'multi_location_rollup')
      ? await getComplianceRollupFn()
      : null
    return { org, rollup }
  },
  component: ComplianceRollupPage,
  errorComponent: AppRouteErrorBoundary,
})

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return <span aria-hidden="true" className="ml-1 text-text-muted opacity-40">↕</span>
  }
  return (
    <span aria-hidden="true" className="ml-1 text-text-primary">
      {dir === 'asc' ? '↑' : '↓'}
    </span>
  )
}

function ComplianceRollupPage() {
  const { org, rollup } = Route.useLoaderData()
  const [sortKey, setSortKey] = useState<SortKey>('pct')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [exporting, setExporting] = useState(false)

  const totalItems = rollup?.reduce((sum, row) => sum + row.total, 0) ?? 0
  const completeItems = rollup?.reduce((sum, row) => sum + row.complete, 0) ?? 0
  const averageProgress = totalItems ? Math.round((completeItems / totalItems) * 100) : 0

  useEffect(() => {
    trackProductEvent('report_viewed', {
      route: '/app/reports/compliance',
      report_type: 'compliance_rollup',
      count: rollup?.length ?? 0,
    })
  }, [rollup?.length])

  useEffect(() => {
    if (rollup && rollup.length === 0) {
      trackProductEvent('report_empty_state_viewed', {
        route: '/app/reports/compliance',
        report_type: 'compliance_rollup',
        status: 'empty',
      })
    }
  }, [rollup])

  const sorted = useMemo(() => {
    if (!rollup) return []
    return [...rollup].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rollup, sortKey, sortDir])

  const handleSort = useCallback(
    (key: SortKey) => {
      const nextDir = sortKey === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc'
      if (sortKey === key) {
        setSortDir(nextDir)
      } else {
        setSortKey(key)
        setSortDir(nextDir)
      }
      trackProductEvent('report_sort_changed', {
        route: '/app/reports/compliance',
        report_type: 'compliance_rollup',
        sort_key: key,
        sort_dir: nextDir,
      })
    },
    [sortDir, sortKey],
  )

  const handleExportCsv = useCallback(async () => {
    setExporting(true)
    try {
      const csv = await exportComplianceRollupFn()
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'compliance-rollup.csv'
      anchor.click()
      URL.revokeObjectURL(url)
      trackProductEvent('report_exported', {
        route: '/app/reports/compliance',
        report_type: 'compliance_rollup',
        export_format: 'csv',
        count: rollup?.length ?? 0,
      })
    } catch {
      trackProductEvent('report_export_failed', {
        route: '/app/reports/compliance',
        report_type: 'compliance_rollup',
        export_format: 'csv',
        error_type: 'client_error',
      })
    } finally {
      setExporting(false)
    }
  }, [])

  function thClass(align: 'left' | 'right' = 'right') {
    return `px-4 py-3 text-${align} text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer select-none hover:text-text-primary transition-colors`
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance progress by location"
        description="See checklist progress for each clinic location. Spot locations that need follow-up."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={exporting || !rollup?.length}
          >
            {exporting ? 'Preparing…' : 'Download CSV'}
          </Button>
        }
      />
      <FeatureGate feature="multi_location_rollup" org={org}>
        {rollup && rollup.length > 0 ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryMetric label="Locations" value={rollup.length} detail="Included in this report" />
              <SummaryMetric label="Completed items" value={`${completeItems}/${totalItems}`} detail="Across all locations" tone="brand" />
              <SummaryMetric label="Average progress" value={`${averageProgress}%`} detail="Weighted by checklist item count" tone={averageProgress >= 80 ? 'success' : averageProgress >= 50 ? 'warning' : 'danger'} />
            </div>
            <TableShell>
              <table className="min-w-full divide-y divide-border-default border border-border-default rounded-lg">
                <thead className="bg-background-subtle">
                  <tr>
                    <th
                      className={thClass('left')}
                      onClick={() => handleSort('locationName')}
                      aria-sort={sortKey === 'locationName' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      Location
                      <SortIcon active={sortKey === 'locationName'} dir={sortDir} />
                    </th>
                    <th
                      className={thClass()}
                      onClick={() => handleSort('total')}
                      aria-sort={sortKey === 'total' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      Total items
                      <SortIcon active={sortKey === 'total'} dir={sortDir} />
                    </th>
                    <th
                      className={thClass()}
                      onClick={() => handleSort('complete')}
                      aria-sort={sortKey === 'complete' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      Completed
                      <SortIcon active={sortKey === 'complete'} dir={sortDir} />
                    </th>
                    <th
                      className={thClass()}
                      onClick={() => handleSort('pct')}
                      aria-sort={sortKey === 'pct' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      Progress %
                      <SortIcon active={sortKey === 'pct'} dir={sortDir} />
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface-0 divide-y divide-border-muted">
                  {sorted.map((row) => (
                    <tr key={row.locationId} className="hover:bg-background-subtle transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-text-primary">
                        <Link
                          to="/app/compliance/checklists"
                          search={{ locationId: row.locationId }}
                          className="hover:text-text-link transition-colors"
                          onClick={() =>
                            trackProductEvent('report_drilldown_clicked', {
                              route: '/app/reports/compliance',
                              report_type: 'compliance_rollup',
                              destination_route: '/app/compliance/checklists',
                            })
                          }
                        >
                          {row.locationName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-right">{row.total}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-right">{row.complete}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span
                          className={
                            row.pct === 100
                              ? 'text-success-700 font-medium'
                              : row.pct >= 50
                                ? 'text-warning-700'
                                : 'text-danger-700'
                          }
                        >
                          {row.pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </>
        ) : (
          <Panel>
            <Alert title="No checklist data yet">
              Add checklists to your locations. Progress will appear here once items exist.
            </Alert>
          </Panel>
        )}
      </FeatureGate>
    </div>
  )
}
