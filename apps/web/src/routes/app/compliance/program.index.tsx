import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { isFeatureGateError } from '@phiguard/billing'
import { Alert, BackLinkAnchor, BackLinkNav, Button, PageHeader, Panel, PanelHeader, SummaryMetric } from '@phiguard/ui'
import { FeatureGate } from '../../../components/feature-gate.js'
import { getProgramDashboardFn } from '../../../server/program.js'
import { getOrgFeatureContextFn } from '../../../server/feature-context.js'
import { AppRouteErrorBoundary } from '../../../components/compliance-error-boundary.js'
import { trackProductEvent } from '../../../lib/product-analytics-browser'

export const Route = createFileRoute('/app/compliance/program/')({
  loader: async () => {
    try {
      return await getProgramDashboardFn()
    } catch (err) {
      if (isFeatureGateError(err)) return { gatedOrg: await getOrgFeatureContextFn() }
      throw err
    }
  },
  component: ProgramDashboard,
  errorComponent: AppRouteErrorBoundary,
})

function ProgramDashboard() {
  const data = Route.useLoaderData()

  if ('gatedOrg' in data) {
    return (
      <div className="mx-auto max-w-5xl">
        <BackLink />
        <PageHeader
          title="Compliance Program"
          description="Policies, training, risk assessments, and vendor management for your organization."
        />
        <FeatureGate feature="compliance_addon" org={data.gatedOrg}>
          {null}
        </FeatureGate>
      </div>
    )
  }

  return <ProgramDashboardLoaded data={data} />
}

function ProgramDashboardLoaded({
  data,
}: {
  data: Exclude<ReturnType<typeof Route.useLoaderData>, { gatedOrg: unknown }>
}) {
  const { policies, training, risk, vendors } = data
  const baaAttentionCount = vendors.expiredBaaCount + vendors.expiringBaaCount
  const attentionCount =
    policies.pendingAckCount + training.overdueCount + risk.highRiskCount + baaAttentionCount

  useEffect(() => {
    trackProductEvent('compliance_program_dashboard_viewed', {
      route: '/app/compliance/program',
      count: attentionCount,
    })
  }, [attentionCount])

  function trackProgramSectionOpened(input: {
    category: 'policies' | 'training' | 'risk' | 'vendors'
    destinationRoute: string
    count?: number
    status?: string
  }) {
    trackProductEvent('compliance_program_section_opened', {
      route: '/app/compliance/program',
      destination_route: input.destinationRoute,
      category: input.category,
      count: input.count,
      status: input.status,
    })
  }

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />

      <PageHeader
        title="Compliance Program"
        description="Organization-wide compliance status across policies, training, risk, and vendor management."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link
              to="/app/compliance/program/policies"
              onClick={() =>
                trackProgramSectionOpened({
                  category: 'policies',
                  destinationRoute: '/app/compliance/program/policies',
                  count: policies.pendingAckCount,
                  status: policies.pendingAckCount > 0 ? 'attention' : 'clear',
                })
              }
            >
              Review policies
            </Link>
          </Button>
        }
      />

      {attentionCount > 0 ? (
        <Alert tone="warning" title={`${attentionCount} item(s) need attention`} className="mb-6">
          Review pending acknowledgements, overdue training, high-risk items, and expired or expiring BAAs before your next audit.
        </Alert>
      ) : (
        <Alert tone="success" title="No immediate program exceptions" className="mb-6">
          No overdue training, pending acknowledgements, high-risk items, or expired or expiring BAAs found.
        </Alert>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryMetric
          label="Published policies"
          value={policies.publishedCount}
          detail={`${policies.pendingAckCount} acknowledgement(s) pending`}
          tone={policies.pendingAckCount > 0 ? 'warning' : 'success'}
        />
        <SummaryMetric
          label="Training overdue"
          value={training.overdueCount}
          detail={`${training.dueSoonCount} due soon`}
          tone={
            training.overdueCount > 0 ? 'danger' : training.dueSoonCount > 0 ? 'warning' : 'success'
          }
        />
        <SummaryMetric
          label="High-risk open"
          value={risk.highRiskCount}
          detail="Risk items requiring mitigation"
          tone={risk.highRiskCount > 0 ? 'danger' : 'success'}
        />
        <SummaryMetric
          label="BAA attention"
          value={baaAttentionCount}
          detail={`${vendors.expiredBaaCount} expired, ${vendors.expiringBaaCount} expiring in 60 days`}
          tone={
            vendors.expiredBaaCount > 0
              ? 'danger'
              : vendors.expiringBaaCount > 0
                ? 'warning'
                : 'success'
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DashboardCard
          title="Policies"
          to="/app/compliance/program/policies"
          category="policies"
          count={policies.pendingAckCount}
          status={policies.pendingAckCount > 0 ? 'attention' : 'clear'}
          onOpen={trackProgramSectionOpened}
          rows={[
            { label: 'Published', value: policies.publishedCount },
            {
              label: 'Pending acknowledgements',
              value: policies.pendingAckCount,
              urgent: policies.pendingAckCount > 0,
            },
          ]}
        />
        <DashboardCard
          title="Training"
          to="/app/compliance/program/training"
          category="training"
          count={training.overdueCount}
          status={training.overdueCount > 0 ? 'attention' : 'clear'}
          onOpen={trackProgramSectionOpened}
          rows={[
            {
              label: 'Overdue',
              value: training.overdueCount,
              urgent: training.overdueCount > 0,
            },
            { label: 'Due soon', value: training.dueSoonCount },
          ]}
        />
        <DashboardCard
          title="Risk Assessments"
          to="/app/compliance/program/risk"
          category="risk"
          count={risk.highRiskCount}
          status={risk.highRiskCount > 0 ? 'attention' : 'clear'}
          onOpen={trackProgramSectionOpened}
          rows={[
            {
              label: 'High-risk items open',
              value: risk.highRiskCount,
              urgent: risk.highRiskCount > 0,
            },
          ]}
        />
        <DashboardCard
          title="Vendors"
          to="/app/compliance/program/vendors"
          category="vendors"
          count={baaAttentionCount}
          status={baaAttentionCount > 0 ? 'attention' : 'clear'}
          onOpen={trackProgramSectionOpened}
          rows={[
            {
              label: 'BAAs expired',
              value: vendors.expiredBaaCount,
              urgent: vendors.expiredBaaCount > 0,
            },
            {
              label: 'BAAs expiring in 60 days',
              value: vendors.expiringBaaCount,
              urgent: vendors.expiringBaaCount > 0,
            },
          ]}
        />
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <BackLinkNav>
      <BackLinkAnchor as={Link} to="/app/compliance">
        Back to Compliance
      </BackLinkAnchor>
    </BackLinkNav>
  )
}

function DashboardCard({
  title,
  to,
  category,
  count,
  status,
  onOpen,
  rows,
}: {
  title: string
  to: string
  category: 'policies' | 'training' | 'risk' | 'vendors'
  count: number
  status: string
  onOpen: (input: {
    category: 'policies' | 'training' | 'risk' | 'vendors'
    destinationRoute: string
    count?: number
    status?: string
  }) => void
  rows: { label: string; value: number; urgent?: boolean }[]
}) {
  const handleOpen = () =>
    onOpen({
      category,
      destinationRoute: to,
      count,
      status,
    })

  return (
    <Panel className="min-w-0">
      <PanelHeader
        title={title}
        actions={
          <Link to={to} className="text-sm font-medium text-text-link" onClick={handleOpen}>
            View
          </Link>
        }
      />
      <Link to={to} className="sr-only" onClick={handleOpen}>
        Open {title}
      </Link>
      <ul className="m-0 list-none p-0">
        {rows.map((row) => (
          <li
            key={row.label}
            className={`mb-2 flex min-w-0 justify-between gap-4 text-sm ${row.urgent ? 'text-text-danger' : 'text-text-secondary'}`}
          >
            <span className="min-w-0 break-words">{row.label}</span>
            <strong className="shrink-0">{row.value}</strong>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
