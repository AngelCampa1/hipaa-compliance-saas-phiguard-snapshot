import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getMinimumPlanForFeatures, hasFeatureForOrg, PLANS, type OrgFeatureContext } from '@phiguard/billing'
import { PageHeader, Panel, PanelHeader, SummaryMetric } from '@phiguard/ui'
import type { LocationRollup, LocationTaskRollup } from '@phiguard/compliance'
import {
  getComplianceRollupFn,
  getRollupOrgPlanFn,
  getTaskRollupFn,
} from '../../server/rollup.js'
import { ContextualHelpPanel } from '../../components/help-guidance'
import { FeatureGate } from '../../components/feature-gate.js'
import { AppRouteErrorBoundary } from '../../components/compliance-error-boundary.js'
import { trackProductEvent } from '../../lib/product-analytics-browser.js'

const MULTI_LOCATION_MINIMUM_PLAN_NAME = PLANS[getMinimumPlanForFeatures(['multi_location_rollup'])].name

export const Route = createFileRoute('/app/reports/')({
  loader: async (): Promise<{
    org: OrgFeatureContext
    compliance: LocationRollup[] | null
    tasks: LocationTaskRollup[] | null
  }> => {
    const org = await getRollupOrgPlanFn()
    if (!hasFeatureForOrg(org, 'multi_location_rollup')) {
      return { org, compliance: null, tasks: null }
    }
    const [compliance, tasks] = await Promise.all([getComplianceRollupFn(), getTaskRollupFn()])
    return { org, compliance, tasks }
  },
  component: ReportsIndexPage,
  errorComponent: AppRouteErrorBoundary,
})

function ReportsIndexPage() {
  const { org, compliance, tasks } = Route.useLoaderData()

  const locationCount = compliance?.length ?? 0
  const totalItems = compliance?.reduce((sum, row) => sum + row.total, 0) ?? 0
  const completeItems = compliance?.reduce((sum, row) => sum + row.complete, 0) ?? 0
  const averageProgress = totalItems ? Math.round((completeItems / totalItems) * 100) : 0
  const openTasks = tasks?.reduce((sum, row) => sum + row.open, 0) ?? 0

  useEffect(() => {
    trackProductEvent('report_viewed', {
      route: '/app/reports',
      report_type: 'reports_index',
      count: locationCount,
    })
  }, [locationCount])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description={`Multi-location rollup reports. Available on ${MULTI_LOCATION_MINIMUM_PLAN_NAME} and above. See compliance progress and task status across all your clinic locations in one place.`}
      />
      <FeatureGate feature="multi_location_rollup" org={org}>
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <SummaryMetric label="Locations" value={locationCount} detail="Included in this report" tone="brand" />
          <SummaryMetric label="Average compliance" value={`${averageProgress}%`} detail="Checklist items done" tone={averageProgress >= 80 ? 'success' : averageProgress >= 50 ? 'warning' : 'danger'} />
          <Link
            to="/app/tasks"
            search={{ status: 'open', locationId: undefined, sort: undefined, sortDir: undefined, page: undefined, pageSize: undefined, assigneeId: undefined }}
            className="block"
            onClick={() =>
              trackProductEvent('report_drilldown_clicked', {
                route: '/app/reports',
                report_type: 'tasks_rollup',
                destination_route: '/app/tasks',
                action: 'open_tasks',
              })
            }
          >
            <SummaryMetric label="Open tasks" value={openTasks} detail="Across all locations, click to view" tone={openTasks > 0 ? 'warning' : 'success'} />
          </Link>
        </div>
        <ContextualHelpPanel
          className="mb-6"
          title="Can't find a downloaded file?"
          description="If you download a report or PDF and cannot find it, the Help Center has a step-by-step guide for each type of computer."
          topicId="open-pdf-download"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/app/reports/compliance"
            className="block"
            onClick={() =>
              trackProductEvent('report_drilldown_clicked', {
                route: '/app/reports',
                report_type: 'compliance_rollup',
              })
            }
          >
            <Panel className="h-full transition hover:border-border-strong hover:shadow-md">
              <PanelHeader
                title="Compliance progress by location"
                description="See checklist completion rates for every location in your organization."
              />
            </Panel>
          </Link>
          <Link
            to="/app/reports/tasks"
            className="block"
            onClick={() =>
              trackProductEvent('report_drilldown_clicked', {
                route: '/app/reports',
                report_type: 'tasks_rollup',
              })
            }
          >
            <Panel className="h-full transition hover:border-border-strong hover:shadow-md">
              <PanelHeader
                title="Tasks by location"
                description="See open, overdue, and completed task counts for each location."
              />
            </Panel>
          </Link>
        </div>
      </FeatureGate>
    </div>
  )
}
