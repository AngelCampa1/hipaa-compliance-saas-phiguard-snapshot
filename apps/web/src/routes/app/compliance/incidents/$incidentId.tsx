import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import {
  Alert,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputPrimitive,
  Label,
  PageHeader,
  Panel,
  PanelHeader,
  SummaryMetric,
  TextareaPrimitive,
} from '@phiguard/ui'
import { VALID_TRANSITIONS } from '@phiguard/compliance'
import {
  appendIncidentUpdateFn,
  getComplianceScopeFn,
  getIncidentFn,
  listIncidentUpdatesFn,
  transitionIncidentFn,
  updateIncidentFn,
} from '../../../../server/compliance.js'
import { trackProductEvent } from '../../../../lib/product-analytics-browser'
import { AppRouteErrorBoundary } from '../../../../components/compliance-error-boundary'
import { formatDateTime } from '../../../../lib/dates.js'

export const Route = createFileRoute('/app/compliance/incidents/$incidentId')({
  loader: async ({ params }) => {
    const [incident, scope, updates] = await Promise.all([
      getIncidentFn({ data: { incidentId: params.incidentId } }),
      getComplianceScopeFn(),
      listIncidentUpdatesFn({ data: { incidentId: params.incidentId } }),
    ])
    return { incident, scope, updates }
  },
  component: IncidentDetailPage,
  errorComponent: AppRouteErrorBoundary,
})

const NEXT_STATUSES: Record<string, string[]> = VALID_TRANSITIONS

const STATUS_LABEL_MAP: Record<string, string> = {
  triaging: 'Begin triage',
  contained: 'Mark contained',
  resolved: 'Mark resolved',
  closed: 'Close incident',
}

type TransitionStatus = 'triaging' | 'contained' | 'resolved' | 'closed'

const SEVERITY_TEXT_CLASS: Record<string, string> = {
  critical: 'text-text-danger',
  high: 'text-warning-700',
  medium: 'text-warning-600',
  low: 'text-text-muted',
}

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const

const CATEGORY_OPTIONS = [
  { value: 'unauthorized_access', label: 'Unauthorized Access' },
  { value: 'lost_device', label: 'Lost or Stolen Device' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'improper_disposal', label: 'Improper Disposal of PHI' },
  { value: 'system_compromise', label: 'System Compromise' },
  { value: 'workforce_violation', label: 'Workforce Policy Violation' },
  { value: 'other', label: 'Other' },
] as const

type Severity = (typeof SEVERITY_OPTIONS)[number]['value']
type Category = (typeof CATEGORY_OPTIONS)[number]['value']

const selectClass =
  'h-10 w-full rounded-md border border-border-input bg-surface-panel px-3 text-sm text-text-primary'

function DlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="font-medium text-text-primary sm:w-44 sm:flex-shrink-0">{label}</dt>
      <dd className="m-0 min-w-0 break-words">{children}</dd>
    </div>
  )
}

type IncidentUpdateView = Awaited<ReturnType<typeof listIncidentUpdatesFn>>[number]

export function IncidentUpdateItem({ update }: { update: IncidentUpdateView }) {
  return (
    <li className="rounded-md border border-border-subtle p-3 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-medium text-text-primary">{update.authorName}</span>
        <span className="whitespace-nowrap text-xs text-text-muted">
          {formatDateTime(update.createdAt)}
        </span>
      </div>
      <p className="mt-1 whitespace-pre-wrap break-words text-text-secondary">{update.text}</p>
    </li>
  )
}

function IncidentDetailPage() {
  const router = useRouter()
  const { incident: initial, scope, updates: initialUpdates } = Route.useLoaderData()
  const canWrite = scope.canWrite
  const [incident, setIncident] = useState(initial)
  const [updates, setUpdates] = useState(initialUpdates)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Edit incident dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(incident.title)
  const [editSummary, setEditSummary] = useState(incident.summary ?? '')
  const [editSeverity, setEditSeverity] = useState<Severity>(incident.severity as Severity)
  const [editCategory, setEditCategory] = useState<Category>(incident.category as Category)
  const [editBusy, setEditBusy] = useState(false)

  // Add update form
  const [updateText, setUpdateText] = useState('')
  const [addingUpdate, setAddingUpdate] = useState(false)

  const nextStatuses = NEXT_STATUSES[incident.status] ?? []

  function showSuccess(msg: string) {
    setNotice(msg)
    setError(null)
    setTimeout(() => setNotice(null), 4000)
  }

  const openEdit = () => {
    setEditTitle(incident.title)
    setEditSummary(incident.summary ?? '')
    setEditSeverity(incident.severity as Severity)
    setEditCategory(incident.category as Category)
    setEditOpen(true)
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editTitle.trim()) return
    setEditBusy(true)
    setError(null)
    try {
      const updated = await updateIncidentFn({
        data: {
          incidentId: incident.id,
          title: editTitle.trim(),
          summary: editSummary.trim() || null,
          severity: editSeverity,
          category: editCategory,
        },
      })
      setIncident(updated)
      setEditOpen(false)
      trackProductEvent('incident_updated', {
        route: '/app/compliance/incidents/$incidentId',
        status: updated.status,
        priority: editSeverity,
      })
      void router.invalidate()
      showSuccess('Incident updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setEditBusy(false)
    }
  }

  const handleTransition = async (toStatus: TransitionStatus) => {
    setBusy(true)
    setError(null)
    try {
      const updated = await transitionIncidentFn({
        data: { incidentId: incident.id, toStatus },
      })
      setIncident(updated)
      void router.invalidate()
      trackProductEvent('incident_status_changed', {
        route: '/app/compliance/incidents/$incidentId',
        status: toStatus,
      })
      if (toStatus === 'closed') {
        trackProductEvent('incident_closed', {
          route: '/app/compliance/incidents',
          status: toStatus,
        })
      }
      showSuccess(`Incident moved to ${toStatus.replace(/_/g, ' ')}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transition failed')
    } finally {
      setBusy(false)
    }
  }

  const handleAddUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!updateText.trim()) return
    setAddingUpdate(true)
    setError(null)
    try {
      await appendIncidentUpdateFn({
        data: { incidentId: incident.id, text: updateText.trim() },
      })
      setUpdateText('')
      // Refresh updates list
      const refreshed = await listIncidentUpdatesFn({
        data: { incidentId: incident.id },
      })
      setUpdates(refreshed)
      trackProductEvent('incident_update_added', {
        route: '/app/compliance/incidents/$incidentId',
        status: incident.status,
      })
      void router.invalidate()
      showSuccess('Update added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add update')
    } finally {
      setAddingUpdate(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <nav>
        <Link
          to="/app/compliance/incidents"
          search={{
            severity: undefined,
            status: undefined,
            category: undefined,
            locationId: undefined,
            q: undefined,
            sort: undefined,
            dir: undefined,
          }}
          className="text-sm text-text-muted hover:text-text-primary"
        >
          &larr; Incidents
        </Link>
      </nav>

      <PageHeader
        eyebrow="Incident detail"
        title={incident.title}
        description="Classification, response status, and operational notes for this incident."
        actions={
          <div className="flex items-center gap-2">
            <Badge>{incident.status}</Badge>
            {canWrite ? (
              <Button type="button" size="sm" variant="outline" onClick={openEdit}>
                Edit
              </Button>
            ) : null}
          </div>
        }
      />

      {!canWrite ? (
        <Alert tone="warning">Read-only access. Status transitions are disabled.</Alert>
      ) : null}

      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {error ? <Alert tone="danger">{error}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetric
          label="Severity"
          value={incident.severity}
          detail="Priority level"
          tone={
            incident.severity === 'critical'
              ? 'danger'
              : incident.severity === 'high'
                ? 'warning'
                : 'neutral'
          }
        />
        <SummaryMetric
          label="Response stage"
          value={
            incident.status === 'closed' || incident.status === 'resolved'
              ? 'Complete'
              : 'In progress'
          }
          detail="See status badge"
          tone={
            incident.status === 'closed' || incident.status === 'resolved' ? 'success' : 'brand'
          }
        />
        <SummaryMetric
          label="Category"
          value={incident.category.replace(/_/g, ' ')}
          detail="Incident type"
          tone="neutral"
        />
      </div>

      <Panel>
        <PanelHeader
          title="Incident record"
          description="Dates, affected systems, and summary on file for this incident."
        />
        <dl className="space-y-3 text-sm text-text-secondary">
          <DlRow label="Severity">
            <span
              className={`font-semibold uppercase ${SEVERITY_TEXT_CLASS[incident.severity] ?? 'text-text-muted'}`}
            >
              {incident.severity}
            </span>
          </DlRow>
          <DlRow label="Category">
            <span className="capitalize">{incident.category.replace(/_/g, ' ')}</span>
          </DlRow>
          <DlRow label="Discovered">{formatDateTime(incident.discoveredAt)}</DlRow>
          <DlRow label="Reported">{formatDateTime(incident.reportedAt)}</DlRow>
          {incident.resolvedAt ? (
            <DlRow label="Resolved">{formatDateTime(incident.resolvedAt)}</DlRow>
          ) : null}
          {incident.affectedSystems && incident.affectedSystems.length > 0 ? (
            <DlRow label="Affected systems">{incident.affectedSystems.join(', ')}</DlRow>
          ) : null}
          {incident.summary ? (
            <DlRow label="Summary">
              <span className="whitespace-pre-wrap break-words">{incident.summary}</span>
            </DlRow>
          ) : null}
        </dl>
      </Panel>

      {canWrite && nextStatuses.length > 0 ? (
        <Panel>
          <PanelHeader
            title="Status transitions"
            description="Advance the incident status as response work is completed."
          />
          <div className="flex flex-wrap gap-3">
            {nextStatuses.map((s) => (
              <Button
                key={s}
                onClick={() => handleTransition(s as TransitionStatus)}
                disabled={busy}
              >
                {STATUS_LABEL_MAP[s] ?? s}
              </Button>
            ))}
          </div>
        </Panel>
      ) : null}

      {/* Incident updates - append-only log */}
      <Panel>
        <PanelHeader
          title="Incident updates"
          description="Append-only log of response actions and notes. Updates cannot be edited or deleted."
        />
        {updates.length > 0 ? (
          <ul className="mb-4 space-y-3">
            {updates.map((update) => (
              <IncidentUpdateItem key={update.id} update={update} />
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-text-muted">No updates recorded yet.</p>
        )}
        {canWrite ? (
          <form onSubmit={handleAddUpdate} className="space-y-2">
            <Label htmlFor="incident-update-text">Add update</Label>
            <TextareaPrimitive
              id="incident-update-text"
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              rows={3}
              placeholder="Describe the response action, finding, or status note. Do not include patient names or MRNs."
              maxLength={5000}
              className="resize-y"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-disabled">{updateText.length} / 5000</span>
              <Button type="submit" size="sm" disabled={addingUpdate || !updateText.trim()}>
                {addingUpdate ? 'Adding...' : 'Add update'}
              </Button>
            </div>
          </form>
        ) : null}
      </Panel>

      {!canWrite && incident.status === 'closed' ? (
        <Alert tone="info">
          This incident is closed. No further status transitions are available.
        </Alert>
      ) : null}

      {/* Edit incident Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) setEditOpen(false)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Incident</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="edit-incident-title">Title</Label>
                <InputPrimitive
                  id="edit-incident-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="edit-incident-severity">Severity</Label>
                <select
                  id="edit-incident-severity"
                  value={editSeverity}
                  onChange={(e) => setEditSeverity(e.target.value as Severity)}
                  className={selectClass}
                >
                  {SEVERITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-incident-category">Category</Label>
                <select
                  id="edit-incident-category"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as Category)}
                  className={selectClass}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-incident-summary">Summary</Label>
                <Alert role="note" tone="warning" className="mb-2" title="Do not include PHI">
                  Do not include patient names, MRNs, or other PHI.
                </Alert>
                <TextareaPrimitive
                  id="edit-incident-summary"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Operational facts only - no patient-identifying information."
                  className="resize-y"
                />
                <div className="mt-1 text-right text-xs text-text-disabled">
                  {editSummary.length} / 2000
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={editBusy || !editTitle.trim()}>
                {editBusy ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
