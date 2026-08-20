import { createFileRoute, Link, useBlocker, useRouter } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import {
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  InputPrimitive,
  Label,
  PageHeader,
  Panel,
  PanelHeader,
  SummaryMetric,
} from '@phiguard/ui'
import { formatDate } from '../../../lib/dates.js'
import {
  acknowledgeProgramPolicyFn,
  archivePolicyFn,
  createPolicyVersionFn,
  getProgramPolicyFn,
  restorePolicyFn,
  updateProgramPolicyDraftFn,
} from '../../../server/program.js'
import { AppRouteErrorBoundary } from '../../../components/compliance-error-boundary'
import { trackProductEvent } from '../../../lib/product-analytics-browser'

export const Route = createFileRoute('/app/compliance/program/policies/$policyId')({
  loader: async ({ params }) => {
    return getProgramPolicyFn({ data: { policyId: params.policyId } })
  },
  component: PolicyDetailPage,
  errorComponent: AppRouteErrorBoundary,
})

type StatusVariant = 'default' | 'warning' | 'success'
const STATUS_BADGE_VARIANT: Record<string, StatusVariant> = {
  draft: 'warning',
  published: 'success',
  archived: 'default',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

const POLICY_DETAIL_ROUTE = '/app/compliance/program/policies/$policyId'

function PolicyDetailPage() {
  const { policy, hasAcknowledged, canAcknowledge, canAdmin } = Route.useLoaderData()
  const { policyId } = Route.useParams()
  const router = useRouter()

  const [acknowledging, setAcknowledging] = useState(false)
  const [acknowledged, setAcknowledged] = useState(hasAcknowledged)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [creatingVersion, setCreatingVersion] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [title, setTitle] = useState(policy.title)
  const [bodyMarkdown, setBodyMarkdown] = useState(policy.bodyMarkdown)
  const [version, setVersion] = useState(policy.version)
  const [effectiveDate, setEffectiveDate] = useState(
    policy.effectiveDate ? policy.effectiveDate.toISOString().slice(0, 10) : '',
  )
  const [requiresAcknowledgement, setRequiresAcknowledgement] = useState(
    policy.requiresAcknowledgement,
  )
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const savedEffectiveDate = policy.effectiveDate
    ? policy.effectiveDate.toISOString().slice(0, 10)
    : ''
  const isDirty =
    editing &&
    (title !== policy.title ||
      bodyMarkdown !== policy.bodyMarkdown ||
      version !== policy.version ||
      savedEffectiveDate !== effectiveDate ||
      requiresAcknowledgement !== policy.requiresAcknowledgement)

  useEffect(() => {
    if (!isDirty) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

  useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: false,
    withResolver: false,
  })

  const acknowledgementRequired = policy.requiresAcknowledgement && policy.status === 'published'
  const canEditDraft = canAdmin && policy.status === 'draft'

  const handleAcknowledge = async () => {
    setError(null)
    setAcknowledging(true)
    try {
      await acknowledgeProgramPolicyFn({ data: { policyId } })
      setAcknowledged(true)
      trackProductEvent('policy_acknowledged', {
        route: POLICY_DETAIL_ROUTE,
      })
    } catch (err) {
      trackProductEvent('policy_action_failed', {
        route: POLICY_DETAIL_ROUTE,
        action: 'acknowledge',
        error_type: 'request_failed',
      })
      setError((err as Error).message)
    } finally {
      setAcknowledging(false)
    }
  }

  const handleUpdateDraft = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !bodyMarkdown.trim() || !version.trim()) return
    setError(null)
    setSaving(true)
    try {
      await updateProgramPolicyDraftFn({
        data: {
          policyId,
          title: title.trim(),
          bodyMarkdown: bodyMarkdown.trim(),
          version: version.trim(),
          effectiveDate: effectiveDate || undefined,
          requiresAcknowledgement,
        },
      })
      setEditing(false)
      trackProductEvent('policy_draft_updated', {
        route: POLICY_DETAIL_ROUTE,
        status: 'draft',
        action: 'update',
      })
      await router.invalidate()
    } catch (err) {
      trackProductEvent('policy_action_failed', {
        route: POLICY_DETAIL_ROUTE,
        status: 'draft',
        action: 'update',
        error_type: 'request_failed',
      })
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateVersion = async () => {
    setError(null)
    setNotice(null)
    setCreatingVersion(true)
    try {
      const newPolicy = await createPolicyVersionFn({ data: { policyId } })
      trackProductEvent('policy_version_created', {
        route: POLICY_DETAIL_ROUTE,
        status: 'draft',
        action: 'create_version',
      })
      await router.navigate({
        to: '/app/compliance/program/policies/$policyId',
        params: { policyId: newPolicy.id },
      })
    } catch (err) {
      trackProductEvent('policy_action_failed', {
        route: POLICY_DETAIL_ROUTE,
        action: 'create_version',
        error_type: 'request_failed',
      })
      setError((err as Error).message)
    } finally {
      setCreatingVersion(false)
    }
  }

  const handleArchive = async () => {
    setError(null)
    setNotice(null)
    setArchiving(true)
    try {
      await archivePolicyFn({ data: { policyId } })
      trackProductEvent('policy_archived', {
        route: POLICY_DETAIL_ROUTE,
        status: 'archived',
        action: 'archive',
      })
      await router.navigate({ to: '/app/compliance/program/policies' })
    } catch (err) {
      trackProductEvent('policy_action_failed', {
        route: POLICY_DETAIL_ROUTE,
        action: 'archive',
        error_type: 'request_failed',
      })
      setError((err as Error).message)
      setArchiving(false)
    }
  }

  const handleRestore = async () => {
    setError(null)
    setNotice(null)
    setRestoring(true)
    try {
      await restorePolicyFn({ data: { policyId } })
      trackProductEvent('policy_restored', {
        route: POLICY_DETAIL_ROUTE,
        status: 'published',
        action: 'restore',
      })
      setNotice('Policy restored. It is published and visible to the workforce again.')
      await router.invalidate()
    } catch (err) {
      trackProductEvent('policy_action_failed', {
        route: POLICY_DETAIL_ROUTE,
        action: 'restore',
        error_type: 'request_failed',
      })
      setError((err as Error).message)
    } finally {
      setRestoring(false)
    }
  }

  const cancelEdit = () => {
    setEditing(false)
    setTitle(policy.title)
    setBodyMarkdown(policy.bodyMarkdown)
    setVersion(policy.version)
    setEffectiveDate(savedEffectiveDate)
    setRequiresAcknowledgement(policy.requiresAcknowledgement)
  }

  const publishedActions =
    canAdmin && policy.status === 'published' ? (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={creatingVersion} onClick={handleCreateVersion}>
          {creatingVersion ? 'Creating...' : 'Create new version'}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={archiving}>
              Archive
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive this policy?</AlertDialogTitle>
              <AlertDialogDescription>
                This policy will be hidden from the active catalog. Workforce members will no longer see it. An administrator can restore it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive}>Archive policy</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ) : null

  const draftActions =
    canEditDraft ? (
      <Button variant="outline" onClick={() => setEditing((current) => !current)}>
        {editing ? 'Cancel Edit' : 'Edit Draft'}
      </Button>
    ) : null

  const archivedActions =
    canAdmin && policy.status === 'archived' ? (
      <Button variant="outline" disabled={restoring} onClick={handleRestore}>
        {restoring ? 'Restoring...' : 'Restore policy'}
      </Button>
    ) : null

  return (
    <div className="mx-auto max-w-4xl">
      <nav className="mb-4 text-sm">
        <Link to="/app/compliance/program/policies" className="text-text-link">
          Back to Policies
        </Link>
      </nav>

      <PageHeader
        title={policy.title}
        description={
          <span className="flex flex-wrap items-center gap-3">
            <span>
              Version {policy.version}
              {policy.effectiveDate ? ` - Effective ${formatDate(policy.effectiveDate)}` : ''}
            </span>
            <Badge variant={STATUS_BADGE_VARIANT[policy.status] ?? 'default'}>
              {STATUS_LABELS[policy.status] ?? policy.status}
            </Badge>
          </span>
        }
        actions={publishedActions ?? draftActions ?? archivedActions}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryMetric label="Version" value={policy.version} detail="Policy revision" />
        <SummaryMetric
          label="Status"
          value={STATUS_LABELS[policy.status] ?? policy.status}
          detail={
            policy.effectiveDate
              ? `Effective ${formatDate(policy.effectiveDate)}`
              : 'No effective date'
          }
          tone={
            policy.status === 'published'
              ? 'success'
              : policy.status === 'archived'
                ? 'neutral'
                : 'warning'
          }
        />
        <SummaryMetric
          label="Acknowledgement"
          value={acknowledgementRequired ? (acknowledged ? 'Complete' : 'Due') : 'Not required'}
          detail={canAcknowledge || acknowledged ? 'Your record' : 'Read-only'}
          tone={!acknowledgementRequired || acknowledged ? 'success' : 'danger'}
        />
      </div>

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

      {acknowledgementRequired ? (
        <Alert
          tone={acknowledged ? 'success' : canAcknowledge ? 'danger' : 'warning'}
          title={acknowledged ? 'Policy acknowledged' : 'Acknowledgement required'}
          className="mb-6"
        >
          {acknowledged ? (
            'You have acknowledged this policy.'
          ) : canAcknowledge ? (
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 break-words">
                Read the policy, then click Acknowledge Policy when done.
              </span>
              <Button disabled={acknowledging} onClick={handleAcknowledge} className="shrink-0">
                {acknowledging ? 'Acknowledging...' : 'Acknowledge Policy'}
              </Button>
            </div>
          ) : (
            'This policy requires acknowledgement. Your role cannot submit it. Someone with write access must acknowledge it.'
          )}
        </Alert>
      ) : null}

      {editing && canEditDraft ? (
        <Panel className="mb-6">
          <form onSubmit={handleUpdateDraft}>
            <PanelHeader
              title="Edit Draft"
              description="Changes stay in draft until you publish the policy."
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
                rows={14}
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
                disabled={saving || !title.trim() || !bodyMarkdown.trim() || !version.trim()}
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel>
        <PanelHeader
          title="Body"
          description={canEditDraft ? 'Draft content.' : 'Policy content (read-only).'}
        />
        <div className="max-h-150 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-border-default bg-background-subtle p-6 text-sm leading-relaxed text-text-primary">
          {policy.bodyMarkdown}
        </div>
      </Panel>
    </div>
  )
}
