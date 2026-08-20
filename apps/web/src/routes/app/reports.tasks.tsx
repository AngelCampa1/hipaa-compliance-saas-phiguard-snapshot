import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { hasFeatureForOrg, type OrgFeatureContext } from '@phiguard/billing'
import { Alert, Button, PageHeader, Panel, SummaryMetric, TableShell } from '@phiguard/ui'
import { FeatureGate } from '../../components/feature-gate.js'
import { getTaskRollupFn, getRollupOrgPlanFn } from '../../server/rollup.js'
import { exportTaskRollupFn } from '../../server/reports.js'
import type { LocationTaskRollup } from '@phiguard/compliance'
import { AppRouteErrorBoundary } from '../../components/compliance-error-boundary.js'
import { trackProductEvent } from '../../lib/product-analytics-browser.js'

type SortKey = 'locationName' | 'open' | 'overdue' | 'completed'
type SortDir = 'asc' | 'desc'

export const Route = createFileRoute('/app/reports/tasks')({
  loader: async (): Promise<{ org: OrgFeatureContext; rollup: LocationTaskRollup[] | null }> => {
    const org = await getRollupOrgPlanFn()
    const rollup = hasFeatureForOrg(org, 'multi_location_rollup')
      ? await getTaskRollupFn()
      : null
    return { org, rollup }
  },
  component: TaskRollupPage,
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

function TaskRollupPage() {
  const { org, rollup } = Route.useLoaderData()
  const [sortKey, setSortKey] = useState<SortKey>('overdue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [exporting, setExporting] = useState(false)

  const openTasks = rollup?.reduce((sum, row) => sum + row.open, 0) ?? 0
  const overdueTasks = rollup?.reduce((sum, row) => sum + row.overdue, 0) ?? 0
  const completedTasks = rollup?.reduce((sum, row) => sum + row.completed, 0) ?? 0

  useEffect(() => {
    trackProductEvent('report_viewed', {
      route: '/app/reports/tasks',
      report_type: 'tasks_rollup',
      count: rollup?.length ?? 0,
    })
  }, [rollup?.length])

  useEffect(() => {
    if (rollup && rollup.length === 0) {
      trackProductEvent('report_empty_state_viewed', {
        route: '/app/reports/tasks',
        report_type: 'tasks_rollup',
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
      const nextDir = sortKey === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'desc'
      if (sortKey === key) {
        setSortDir(nextDir)
      } else {
        setSortKey(key)
        setSortDir(nextDir)
      }
      trackProductEvent('report_sort_changed', {
        route: '/app/reports/tasks',
        report_type: 'tasks_rollup',
        sort_key: key,
        sort_dir: nextDir,
      })
    },
    [sortDir, sortKey],
  )

  const handleExportCsv = useCallback(async () => {
    setExporting(true)
    try {
      const csv = await exportTaskRollupFn()
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'tasks-rollup.csv'
      anchor.click()
      URL.revokeObjectURL(url)
      trackProductEvent('report_exported', {
        route: '/app/reports/tasks',
        report_type: 'tasks_rollup',
        export_format: 'csv',
        count: rollup?.length ?? 0,
      })
    } catch {
      trackProductEvent('report_export_failed', {
        route: '/app/reports/tasks',
        report_type: 'tasks_rollup',
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
        title="Tasks by location"
        description="See task counts and overdue work for each clinic location."
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
              <SummaryMetric label="Open" value={openTasks} detail="Needs attention" tone={openTasks > 0 ? 'warning' : 'success'} />
              <SummaryMetric label="Overdue" value={overdueTasks} detail="Past due date" tone={overdueTasks > 0 ? 'danger' : 'success'} />
              <SummaryMetric label="Completed" value={completedTasks} detail="Closed tasks" />
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
                      onClick={() => handleSort('open')}
                      aria-sort={sortKey === 'open' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      Open
                      <SortIcon active={sortKey === 'open'} dir={sortDir} />
                    </th>
                    <th
                      className={thClass()}
                      onClick={() => handleSort('overdue')}
                      aria-sort={sortKey === 'overdue' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      Overdue
                      <SortIcon active={sortKey === 'overdue'} dir={sortDir} />
                    </th>
                    <th
                      className={thClass()}
                      onClick={() => handleSort('completed')}
                      aria-sort={sortKey === 'completed' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      Completed
                      <SortIcon active={sortKey === 'completed'} dir={sortDir} />
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface-0 divide-y divide-border-muted">
                  {sorted.map((row) => (
                    <tr key={row.locationId} className="hover:bg-background-subtle transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-text-primary">
                        <Link
                          to="/app/tasks"
                          search={{ locationId: row.locationId, status: 'open', sort: undefined, sortDir: undefined, page: undefined, pageSize: undefined, assigneeId: undefined }}
                          className="hover:text-text-link transition-colors"
                          onClick={() =>
                            trackProductEvent('report_drilldown_clicked', {
                              route: '/app/reports/tasks',
                              report_type: 'tasks_rollup',
                              destination_route: '/app/tasks',
                            })
                          }
                        >
                          {row.locationName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-right">{row.open}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {row.overdue > 0 ? (
                          <span className="text-danger-700 font-medium">{row.overdue}</span>
                        ) : (
                          <span className="text-text-secondary">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary text-right">{row.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </>
        ) : (
          <Panel>
            <Alert title="No task data yet">
              Add tasks to your locations. They will appear here once created.
            </Alert>
          </Panel>
        )}
      </FeatureGate>
    </div>
  )
}
