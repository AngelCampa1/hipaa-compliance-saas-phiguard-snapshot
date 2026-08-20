import { useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { isFeatureGateError } from '@phiguard/billing'
import { Alert, Button, PageHeader, Panel, PanelHeader, SummaryMetric } from '@phiguard/ui'
import { FeatureGate } from '../../components/feature-gate.js'
import { listControlsFn } from '../../server/soc2.js'
import { getOrgFeatureContextFn } from '../../server/feature-context.js'
import { AppRouteErrorBoundary } from '../../components/compliance-error-boundary.js'
import { trackProductEvent } from '../../lib/product-analytics-browser.js'

export const Route = createFileRoute('/app/soc2/')({
  loader: async () => {
    try {
      return await listControlsFn()
    } catch (err) {
      if (isFeatureGateError(err)) return { gatedOrg: await getOrgFeatureContextFn() }
      throw err
    }
  },
  component: Soc2Dashboard,
  errorComponent: AppRouteErrorBoundary,
})

function Soc2Dashboard() {
  const data = Route.useLoaderData()
  useEffect(() => {
    trackProductEvent('soc2_dashboard_viewed', {
      route: '/app/soc2',
    })
  }, [])

  if ('gatedOrg' in data) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="SOC 2 Type I Preparation"
          description="Collect evidence and run access reviews before your audit."
        />
        <FeatureGate feature="soc2_evidence" org={data.gatedOrg}>{null}</FeatureGate>
      </div>
    )
  }
  const controls = data
  type Control = (typeof controls)[number]

  const totalEvidence = controls.reduce(
    (sum: number, control: Control) => sum + (control.evidenceCount ?? 0),
    0,
  )
  const controlsWithEvidence = controls.filter(
    (control: Control) => (control.evidenceCount ?? 0) > 0,
  ).length
  const controlsMissingEvidence = controls.length - controlsWithEvidence
  const coveragePercent =
    controls.length > 0 ? Math.round((controlsWithEvidence / controls.length) * 100) : 0

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="SOC 2 Type I Preparation"
        description="Review control coverage, collected evidence, and quarterly access reviews before your audit."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/app/soc2/auditor">Auditor view</Link>
          </Button>
        }
      />

      {controlsMissingEvidence > 0 ? (
        <Alert tone="warning" title={`${controlsMissingEvidence} control(s) missing evidence`} className="mb-6">
          Add evidence for each uncovered control before sharing the auditor view.
        </Alert>
      ) : (
        <Alert tone="success" title="Every tracked control has evidence" className="mb-6">
          Check that each evidence item covers the current audit period before you export.
        </Alert>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryMetric
          label="Controls tracked"
          value={controls.length}
          detail="Trust Services Criteria controls"
        />
        <SummaryMetric
          label="Evidence items"
          value={totalEvidence}
          detail="Across all controls"
          tone={totalEvidence > 0 ? 'brand' : 'neutral'}
        />
        <SummaryMetric
          label="Coverage"
          value={`${coveragePercent}%`}
          detail={`${controlsWithEvidence} of ${controls.length} controls`}
          tone={controlsMissingEvidence > 0 ? 'warning' : 'success'}
        />
        <SummaryMetric
          label="Needs evidence"
          value={controlsMissingEvidence}
          detail="Controls with no evidence attached"
          tone={controlsMissingEvidence > 0 ? 'warning' : 'success'}
        />
      </div>

      <Panel>
        <PanelHeader
          title="Next actions"
          description="Use these views to build your evidence package. None of these actions change the control catalog."
        />
        <nav className="grid gap-3 text-sm sm:grid-cols-3">
          <Link to="/app/soc2/controls" search={{ missingOnly: undefined, q: undefined, sort: undefined, dir: undefined }} className="rounded-full border border-border-default px-4 py-3 text-text-link">
            View controls
          </Link>
          <Link to="/app/soc2/evidence" className="rounded-full border border-border-default px-4 py-3 text-text-link">
            Review evidence
          </Link>
          <Link to="/app/soc2/access-reviews" search={{ status: undefined, sort: undefined, dir: undefined }} className="rounded-full border border-border-default px-4 py-3 text-text-link">
            Access reviews
          </Link>
        </nav>
      </Panel>
    </div>
  )
}
