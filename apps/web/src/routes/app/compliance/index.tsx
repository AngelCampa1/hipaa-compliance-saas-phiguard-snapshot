import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { hasFeatureForOrg } from '@phiguard/billing'
import { Badge, PageHeader, Panel, PanelHeader, SummaryMetric } from '@phiguard/ui'
import { listChecklistsFn, listIncidentsFn } from '../../../server/compliance.js'
import { getOrgFeatureContextFn } from '../../../server/feature-context.js'
import { AppRouteErrorBoundary } from '../../../components/compliance-error-boundary.js'
import { trackProductEvent } from '../../../lib/product-analytics-browser'

export const Route = createFileRoute('/app/compliance/')({
  shouldReload: true,
  loader: async () => {
    const [checklists, incidents, orgFeatureContext] = await Promise.all([
      listChecklistsFn(),
      listIncidentsFn({ data: {} }),
      // Policies live in Program → Policies (authoring + acknowledgement). We use
      // the feature context here to decide whether the Policies card sends the
      // org to that surface or to an upgrade prompt for plans without authoring.
      getOrgFeatureContextFn(),
    ])
    return { checklists, incidents, orgFeatureContext }
  },
  component: ComplianceDashboard,
  errorComponent: AppRouteErrorBoundary,
})

const SEVERITY_BADGE: Record<string, 'danger' | 'warning' | 'default'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'default',
  low: 'default',
}

function ComplianceDashboard() {
  const { checklists, incidents, orgFeatureContext } = Route.useLoaderData()
  const canAuthorPolicies = hasFeatureForOrg(orgFeatureContext, 'compliance_addon')
  const activeChecklists = checklists.filter((checklist) => checklist.status === 'active').length
  const completedChecklists = checklists.filter((checklist) => checklist.status === 'completed').length
  const openIncidents = incidents.filter((inc) => inc.status !== 'closed' && inc.status !== 'resolved')

  const openIncidentsBySeverity = incidents.reduce<Record<string, number>>((acc, inc) => {
    if (inc.status !== 'closed' && inc.status !== 'resolved') {
      acc[inc.severity] = (acc[inc.severity] ?? 0) + 1
    }
    return acc
  }, {})

  const attentionCount = openIncidents.length

  useEffect(() => {
    trackProductEvent('compliance_dashboard_viewed', {
      route: '/app/compliance',
      count: attentionCount,
    })
  }, [attentionCount])

  function trackSectionOpened(input: {
    category: 'checklists' | 'incidents' | 'policies'
    destinationRoute: string
    status?: string
    count?: number
  }) {
    trackProductEvent('compliance_dashboard_section_opened', {
      route: '/app/compliance',
      destination_route: input.destinationRoute,
      category: input.category,
      status: input.status,
      count: input.count,
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Compliance"
        title="Compliance Program"
        description="See checklist progress, policies, and open incidents in one place."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryMetric label="Active checklists" value={activeChecklists} detail={`${completedChecklists} completed`} tone="brand" />
        <SummaryMetric label="Open incidents" value={openIncidents.length} detail="Reported, triaging, or contained" tone={openIncidents.length > 0 ? 'warning' : 'success'} />
        <SummaryMetric label="Critical or high" value={(openIncidentsBySeverity.critical ?? 0) + (openIncidentsBySeverity.high ?? 0)} detail="Open incident severity" tone={(openIncidentsBySeverity.critical ?? 0) > 0 ? 'danger' : 'neutral'} />
      </div>

      <Panel>
        <PanelHeader
          title="Checklists"
          description="Recent checklists across the compliance program."
          actions={
          <Link
            to="/app/compliance/checklists"
            search={{ locationId: undefined }}
            className="text-text-link"
            onClick={() =>
              trackSectionOpened({
                category: 'checklists',
                destinationRoute: '/app/compliance/checklists',
                count: checklists.length,
              })
            }
          >
            View all
          </Link>
          }
        />
        {checklists.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-default bg-surface-50 p-5 text-sm text-text-secondary">
            No checklists yet. Assign a starter template to create the first checklist for a location.
          </div>
        ) : (
          <ul className="list-none divide-y divide-border-muted p-0">
            {checklists.slice(0, 5).map((c) => (
              <li key={c.id} className="flex min-w-0 flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to="/app/compliance/checklists/$checklistId"
                  params={{ checklistId: c.id }}
                  className="min-w-0 break-words font-medium text-text-link"
                  onClick={() =>
                    trackSectionOpened({
                      category: 'checklists',
                      destinationRoute: '/app/compliance/checklists/$checklistId',
                      status: c.status,
                    })
                  }
                >
                  {c.name}
                </Link>
                <Badge variant={c.status === 'completed' ? 'success' : 'default'}>{c.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Open incidents"
          description="Open incidents grouped by severity."
          actions={
          <Link
            to="/app/compliance/incidents"
            search={{ locationId: undefined, severity: undefined, status: undefined, category: undefined, q: undefined, sort: undefined, dir: undefined }}
            className="text-text-link"
            onClick={() =>
              trackSectionOpened({
                category: 'incidents',
                destinationRoute: '/app/compliance/incidents',
                count: openIncidents.length,
              })
            }
          >View all</Link>
          }
        />
        {Object.keys(openIncidentsBySeverity).length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-default bg-surface-50 p-5 text-sm text-text-secondary">
            No open incidents. New reports will appear here.
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
              const count = openIncidentsBySeverity[sev]
              if (!count) return null
              return (
                <Badge key={sev} variant={SEVERITY_BADGE[sev] ?? 'default'}>
                  {count} {sev}
                </Badge>
              )
            })}
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Policies"
          description="Author, publish, and track acknowledgement of compliance policies."
          actions={
          <Link
            to="/app/compliance/program/policies"
            className="text-text-link"
            onClick={() =>
              trackSectionOpened({
                category: 'policies',
                destinationRoute: '/app/compliance/program/policies',
              })
            }
          >
            Open Policies
          </Link>
          }
        />
        <div className="rounded-lg border border-dashed border-border-default bg-surface-50 p-5 text-sm text-text-secondary">
          {canAuthorPolicies
            ? 'Write policies, publish them to your workforce, and see who still needs to acknowledge them in Program → Policies.'
            : 'Policy authoring and acknowledgement tracking are included on the Group plan and up. Open Policies to see what is included.'}
        </div>
      </Panel>
    </div>
  )
}
