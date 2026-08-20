import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { isFeatureGateError } from '@phiguard/billing'
import {
  Alert,
  BackLinkAnchor,
  BackLinkNav,
  Badge,
  Button,
  EmptyState,
  InputPrimitive,
  Label,
  PageHeader,
  Panel,
  PanelHeader,
  SummaryMetric,
} from '@phiguard/ui'
import { FeatureGate } from '../../../components/feature-gate.js'
import { formatDate } from '../../../lib/dates.js'
import { getOrgFeatureContextFn } from '../../../server/feature-context.js'
import { AppRouteErrorBoundary } from '../../../components/compliance-error-boundary'
import { trackProductEvent } from '../../../lib/product-analytics-browser'
import {
  createProgramPolicyFn,
  listProgramPoliciesFn,
  publishProgramPolicyFn,
} from '../../../server/program.js'

export const Route = createFileRoute('/app/compliance/program/policies/')({
  loader: async () => {
    try {
      return await listProgramPoliciesFn()
    } catch (err) {
      if (isFeatureGateError(err)) return { gatedOrg: await getOrgFeatureContextFn() }
      throw err
    }
  },
  component: ProgramPoliciesPage,
  errorComponent: AppRouteErrorBoundary,
})

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

type StatusVariant = 'default' | 'warning' | 'success'
const STATUS_BADGE_VARIANT: Record<string, StatusVariant> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
}

function ProgramPoliciesPage() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [bodyMarkdown, setBodyMarkdown] = useState('')
  const [version, setVersion] = useState('1.0')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [requiresAcknowledgement, setRequiresAcknowledgement] = useState(true)
  const [creating, setCreating] = useState(false)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if ('gatedOrg' in data) {
    return (
      <div className="mx-auto max-w-5xl">
        <BackLink />
        <PageHeader
          title="Policies"
          description="Compliance policies and your acknowledgement status."
        />
        <FeatureGate feature="compliance_addon" org={data.gatedOrg}>
          {null}
        </FeatureGate>
      </div>
    )
  }

  const { policies, canAdmin } = data
  const pendingAckCount = policies.filter((policy) => policy.pendingAck).length
  const draftCount = policies.filter((policy) => policy.status === 'draft').length
  const publishedCount = policies.filter((policy) => policy.status === 'published').length

  const handleCreatePolicy = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !bodyMarkdown.trim() || !version.trim()) return
    setError(null)
    setNotice(null)
    setCreating(true)
    try {
      await createProgramPolicyFn({
        data: {
          title: title.trim(),
          bodyMarkdown: bodyMarkdown.trim(),
          version: version.trim(),
          effectiveDate: effectiveDate || undefined,
          requiresAcknowledgement,
        },
      })
      setNotice('Policy draft created.')
      setShowCreateForm(false)
      setTitle('')
      setBodyMarkdown('')
      setVersion('1.0')
      setEffectiveDate('')
      setRequiresAcknowledgement(true)
      trackProductEvent('policy_created', {
        route: '/app/compliance/program/policies',
        status: 'draft',
      })
      await router.invalidate()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const handlePublish = async (policyId: string) => {
    setError(null)
    setNotice(null)
    setPublishing(policyId)
    try {
      await publishProgramPolicyFn({ data: { policyId } })
      trackProductEvent('policy_published', {
        route: '/app/compliance/program/policies',
        status: 'published',
      })
      setNotice('Policy published successfully.')
      await router.invalidate()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setPublishing(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />

      <PageHeader
        title="Policies"
        description="View, acknowledge, and manage compliance policies for your organization."
        actions={
          canAdmin ? <Button onClick={() => setShowCreateForm(true)}>New Policy</Button> : null
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryMetric
          label="Published"
          value={publishedCount}
          detail="Active for workforce"
          tone="brand"
        />
        <SummaryMetric
          label="Drafts"
          value={draftCount}
          detail="Awaiting publication"
          tone={draftCount > 0 ? 'warning' : 'neutral'}
        />
        <SummaryMetric
          label="Acknowledgement due"
          value={pendingAckCount}
          detail="Requires your action"
          tone={pendingAckCount > 0 ? 'danger' : 'success'}
        />
      </div>

      {pendingAckCount > 0 ? (
        <Alert tone="danger" title="Acknowledgement required" className="mb-4">
          Read and acknowledge the pending policies below to keep your compliance record up to date.
        </Alert>
      ) : null}
      {error ? (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {notice ? (
        <Alert tone="success" className="mb-4">
          {notice}
        </Alert>
      ) : null}

      {canAdmin && showCreateForm ? (
        <Panel className="mb-6">
          <form onSubmit={handleCreatePolicy}>
            <PanelHeader
              title="New Policy"
              description="Write a draft policy and then publish it for the workforce to read and acknowledge."
            />
            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-policy-form">
              <div className="min-w-0">
                <Label htmlFor="policy-title">Title *</Label>
                <InputPrimitive
                  id="policy-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </div>
              <div className="min-w-0">
                <Label htmlFor="policy-version">Version *</Label>
                <InputPrimitive
                  id="policy-version"
                  value={version}
                  onChange={(event) => setVersion(event.target.value)}
                  required
                />
              </div>
              <div className="min-w-0">
                <Label htmlFor="policy-effective-date">Effective date</Label>
                <InputPrimitive
                  id="policy-effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(event) => setEffectiveDate(event.target.value)}
                />
              </div>
            </div>
            <div className="mb-3 min-w-0">
              <Label htmlFor="policy-body">Body *</Label>
              <textarea
                id="policy-body"
                value={bodyMarkdown}
                onChange={(event) => setBodyMarkdown(event.target.value)}
                required
                rows={10}
                className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-text"
              />
            </div>
            <label className="mb-4 flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={requiresAcknowledgement}
                onChange={(event) => setRequiresAcknowledgement(event.target.checked)}
              />
              Requires acknowledgement
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={creating || !title.trim() || !bodyMarkdown.trim() || !version.trim()}
              >
                {creating ? 'Creating...' : 'Create Draft'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      {policies.length === 0 ? (
        <EmptyState
          heading="No policies yet"
          description="Create a draft policy, then publish it for the workforce to acknowledge."
          action={
            canAdmin ? <Button onClick={() => setShowCreateForm(true)}>New Policy</Button> : null
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {policies.map((policy) => (
            <Panel
              key={policy.id}
              className={policy.pendingAck ? 'border-danger-200 bg-danger-50' : 'p-5'}
            >
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link
                    to="/app/compliance/program/policies/$policyId"
                    params={{ policyId: policy.id }}
                    className="break-words font-semibold text-brand-700 hover:underline"
                  >
                    {policy.title}
                  </Link>
                  <div className="mt-1 text-xs leading-5 text-text-muted">
                    v{policy.version}
                    {policy.effectiveDate ? ` - Effective ${formatDate(policy.effectiveDate)}` : ''}
                    {policy.pendingAck ? (
                      <span className="ml-1 font-semibold text-danger-700">
                        - Acknowledgement required
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge variant={STATUS_BADGE_VARIANT[policy.status] ?? 'default'}>
                    {STATUS_LABELS[policy.status] ?? policy.status}
                  </Badge>

                  {canAdmin && policy.status === 'draft' ? (
                    <Link
                      to="/app/compliance/program/policies/$policyId"
                      params={{ policyId: policy.id }}
                      className="inline-flex"
                    >
                      <Button asChild variant="outline" size="sm">
                        <span>Edit</span>
                      </Button>
                    </Link>
                  ) : null}

                  {canAdmin && policy.status === 'draft' ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={publishing === policy.id}
                      onClick={() => handlePublish(policy.id)}
                    >
                      {publishing === policy.id ? 'Publishing...' : 'Publish'}
                    </Button>
                  ) : null}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}

function BackLink() {
  return (
    <BackLinkNav>
      <BackLinkAnchor as={Link} to="/app/compliance/program">
        Back to Compliance Program
      </BackLinkAnchor>
    </BackLinkNav>
  )
}
