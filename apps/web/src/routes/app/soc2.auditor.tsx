import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { isFeatureGateError } from '@phiguard/billing'
import { Alert, BackLinkAnchor, BackLinkNav, Badge, EmptyState, PageHeader, SummaryMetric, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableShell } from '@phiguard/ui'
import { FeatureGate } from '../../components/feature-gate.js'
import { listControlsFn } from '../../server/soc2.js'
import { getOrgFeatureContextFn } from '../../server/feature-context.js'
import { AppRouteErrorBoundary } from '../../components/compliance-error-boundary'
import { trackProductEvent } from '../../lib/product-analytics-browser'

export const Route = createFileRoute('/app/soc2/auditor')({
  loader: async () => {
    try {
      return await listControlsFn()
    } catch (err) {
      if (isFeatureGateError(err)) return { gatedOrg: await getOrgFeatureContextFn() }
      throw err
    }
  },
  component: Soc2AuditorPage,
  errorComponent: AppRouteErrorBoundary,
})

function Soc2AuditorPage() {
  const data = Route.useLoaderData()
  const isGated = 'gatedOrg' in data

  useEffect(() => {
    if (isGated) return
    trackProductEvent('soc2_auditor_viewed', {
      route: '/app/soc2/auditor',
      count: data.length,
    })
  }, [data, isGated])

  if ('gatedOrg' in data) {
    return (
      <div className="mx-auto max-w-5xl">
        <BackLink />
        <PageHeader title="SOC 2 Auditor View" description="Read-only view of controls and evidence counts for your auditor." />
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
  const coveredCount = controls.filter((control: Control) => (control.evidenceCount ?? 0) > 0).length
  const missingCount = controls.length - coveredCount

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />

      <PageHeader
        title="SOC 2 Auditor View"
        description="Read-only view of control coverage and evidence for your auditor. No changes can be made here."
      />

      <Alert tone="info" title="Read-only access" className="mb-6">
        Administrators manage evidence bundle exports from the Evidence page.
      </Alert>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryMetric label="Controls" value={controls.length} detail="In audit scope" />
        <SummaryMetric label="Evidence items" value={totalEvidence} detail="Across all controls" tone="brand" />
        <SummaryMetric label="Missing evidence" value={missingCount} detail={`${coveredCount} control(s) covered`} tone={missingCount > 0 ? 'warning' : 'success'} />
      </div>

      {controls.length === 0 ? (
        <EmptyState
          heading="No controls available"
          description="Controls will appear here once the control catalog is set up for your organization."
        />
      ) : (
        <TableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Control ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Evidence Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controls.map((ctrl: Control) => (
                <TableRow key={ctrl.id}>
                  <TableCell className="whitespace-nowrap font-medium">{ctrl.controlId}</TableCell>
                  <TableCell className="min-w-40 break-words text-text-muted">{ctrl.category}</TableCell>
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
