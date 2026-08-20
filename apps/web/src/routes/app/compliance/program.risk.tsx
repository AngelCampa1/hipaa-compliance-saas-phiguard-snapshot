import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useCallback, useState, type FormEvent } from 'react'
import { isFeatureGateError } from '@phiguard/billing'
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
  BackLinkAnchor,
  BackLinkNav,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  InputPrimitive,
  Label,
  PageHeader,
  Panel,
  PanelHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SummaryMetric,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableShell,
  TextareaPrimitive,
} from '@phiguard/ui'
import { formatDate } from '../../../lib/dates.js'
import { FeatureGate } from '../../../components/feature-gate.js'
import { getOrgFeatureContextFn } from '../../../server/feature-context.js'
import { AppRouteErrorBoundary } from '../../../components/compliance-error-boundary'
import { trackProductEvent } from '../../../lib/product-analytics-browser'
import {
  createRiskAssessmentFn,
  createRiskItemFn,
  deleteRiskAssessmentFn,
  deleteRiskItemFn,
  listRiskAssessmentsFn,
  reopenRiskAssessmentFn,
  renameRiskAssessmentFn,
  updateRiskAssessmentStatusFn,
  updateRiskItemFn,
} from '../../../server/program.js'

export const Route = createFileRoute('/app/compliance/program/risk')({
  validateSearch: (search: Record<string, unknown>) => ({
    ownerId: (search.ownerId as string | undefined) ?? undefined,
    sort: (search.sort as string | undefined) ?? undefined,
    dir: (search.dir as 'asc' | 'desc' | undefined) ?? undefined,
  }),
  loader: async () => {
    try {
      return await listRiskAssessmentsFn()
    } catch (err) {
      if (isFeatureGateError(err)) return { gatedOrg: await getOrgFeatureContextFn() }
      throw err
    }
  },
  component: RiskPage,
  errorComponent: AppRouteErrorBoundary,
})

// Sentinel for the "All" filter option — Radix Select.Item cannot use an empty string.
const ALL_FILTER = 'all'

const STATUS_BADGE: Record<string, 'warning' | 'default' | 'success'> = {
  open: 'warning',
  in_review: 'default',
  closed: 'success',
}

const ITEM_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
}

const SCORE_LABEL: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

function riskLevelForScore(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 20) return 'critical'
  if (score >= 15) return 'high'
  if (score >= 6) return 'medium'
  return 'low'
}

// Sentinel value meaning "leave owner unchanged" in the edit dialog.
const NO_CHANGE = '__no_change__'

type ItemFormState = {
  category: string
  description: string
  likelihood: string
  impact: string
  mitigation: string
  ownerId: string
  dueAt: string
}

function emptyItemForm(): ItemFormState {
  return {
    category: '',
    description: '',
    likelihood: '3',
    impact: '3',
    mitigation: '',
    ownerId: '',
    dueAt: '',
  }
}

function RiskPage() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/app/compliance/program/risk' })

  // New assessment form
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Add risk item inline form
  const [creatingItem, setCreatingItem] = useState(false)
  const [itemAssessmentId, setItemAssessmentId] = useState<string | null>(null)
  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm())

  // Edit risk item dialog
  const [editingItem, setEditingItem] = useState<{
    id: string
    assessmentId: string
  } | null>(null)
  const [editItemForm, setEditItemForm] = useState<ItemFormState & { ownerIdEdit: string }>({
    ...emptyItemForm(),
    ownerIdEdit: NO_CHANGE,
  })
  const [updatingItem, setUpdatingItem] = useState(false)

  // Assessment status updates
  const [updatingAssessmentId, setUpdatingAssessmentId] = useState<string | null>(null)

  // Rename assessment dialog
  const [renamingAssessment, setRenamingAssessment] = useState<{
    id: string
    title: string
  } | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  const [renamingBusy, setRenamingBusy] = useState(false)

  // Deleting item
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

  // Deleting assessment
  const [deletingAssessmentId, setDeletingAssessmentId] = useState<string | null>(null)

  // Reopening assessment
  const [reopeningAssessmentId, setReopeningAssessmentId] = useState<string | null>(null)

  // Feedback
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if ('gatedOrg' in data) {
    return (
      <div className="mx-auto max-w-5xl">
        <BackLink />
        <PageHeader
          title="Risk Assessments"
          description="Track HIPAA security risk assessments."
        />
        <FeatureGate feature="compliance_addon" org={data.gatedOrg}>
          {null}
        </FeatureGate>
      </div>
    )
  }

  const { assessments, canAdmin, users } = data

  const setFilter = useCallback(
    (key: string, value: string) => {
      // Radix Select.Item cannot use an empty value; the "All" option uses the
      // ALL_FILTER sentinel, mapped back to undefined to clear the filter.
      const next = value === ALL_FILTER || value === '' ? undefined : value
      void navigate({ search: (prev) => ({ ...prev, [key]: next }) })
    },
    [navigate],
  )

  const clearFilters = useCallback(() => {
    void navigate({
      search: () => ({ ownerId: undefined, sort: undefined, dir: undefined }),
    })
  }, [navigate])

  const toggleSortRisk = useCallback(
    (col: 'score' | 'category' | 'dueAt') => {
      void navigate({
        search: (prev) => ({
          ...prev,
          sort: col,
          dir: prev.sort === col && prev.dir === 'desc' ? 'asc' : 'desc',
        }),
      })
    },
    [navigate],
  )

  const sortKey = (search.sort as 'score' | 'category' | 'dueAt' | undefined) ?? 'score'
  const sortDir = search.dir ?? 'desc'
  const hasActiveFilters = Boolean(search.ownerId)

  // Apply owner filter and sort to items within each assessment
  const filteredAssessments = assessments.map((assessment) => {
    let items = assessment.items
    if (search.ownerId) {
      items = items.filter((item) =>
        search.ownerId === '__unassigned__' ? !item.ownerId : item.ownerId === search.ownerId,
      )
    }
    items = [...items].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'score') {
        cmp = a.score - b.score
      } else if (sortKey === 'category') {
        cmp = a.category.localeCompare(b.category)
      } else if (sortKey === 'dueAt') {
        cmp = new Date(a.dueAt ?? 0).getTime() - new Date(b.dueAt ?? 0).getTime()
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return { ...assessment, items }
  })

  function SortIndicatorR({ col }: { col: 'score' | 'category' | 'dueAt' }) {
    if (sortKey !== col) return null
    return <span className="ml-1 text-text-muted">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  function SortableRiskHead({
    col,
    children,
  }: {
    col: 'score' | 'category' | 'dueAt'
    children: React.ReactNode
  }) {
    return (
      <TableHead
        onClick={() => toggleSortRisk(col)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {children}
        <SortIndicatorR col={col} />
      </TableHead>
    )
  }

  const openCount = assessments.filter((a) => a.status !== 'closed').length
  const highRiskCount = assessments.reduce((sum, a) => sum + a.summary.high, 0)
  const itemCount = assessments.reduce((sum, a) => sum + a.itemCount, 0)

  function showSuccess(msg: string) {
    setNotice(msg)
    setError(null)
    setTimeout(() => setNotice(null), 4000)
  }

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    if (!newTitle.trim()) return
    setError(null)
    setCreating(true)
    try {
      await createRiskAssessmentFn({ data: { title: newTitle.trim() } })
      trackProductEvent('risk_assessment_created', {
        route: '/app/compliance/program/risk',
      })
      setNewTitle('')
      setShowForm(false)
      await router.invalidate()
      showSuccess('Assessment created.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const handleCreateItem = async (event: FormEvent) => {
    event.preventDefault()
    if (!itemAssessmentId || !itemForm.category.trim() || !itemForm.description.trim()) return
    setError(null)
    setCreatingItem(true)
    try {
      await createRiskItemFn({
        data: {
          assessmentId: itemAssessmentId,
          category: itemForm.category.trim(),
          description: itemForm.description.trim(),
          likelihood: Number(itemForm.likelihood),
          impact: Number(itemForm.impact),
          mitigation: itemForm.mitigation.trim() || undefined,
          ownerId: itemForm.ownerId || null,
          dueAt: itemForm.dueAt || undefined,
        },
      })
      trackProductEvent('risk_item_created', {
        route: '/app/compliance/program/risk',
        priority: riskLevelForScore(Number(itemForm.likelihood) * Number(itemForm.impact)),
      })
      setItemAssessmentId(null)
      setItemForm(emptyItemForm())
      await router.invalidate()
      showSuccess('Risk item added.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreatingItem(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    setError(null)
    setDeletingItemId(itemId)
    try {
      await deleteRiskItemFn({ data: { itemId } })
      trackProductEvent('risk_item_deleted', {
        route: '/app/compliance/program/risk',
      })
      await router.invalidate()
      showSuccess('Risk item deleted.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setDeletingItemId(null)
    }
  }

  const startEditItem = (
    item: (typeof assessments)[number]['items'][number],
    assessmentId: string,
  ) => {
    setEditingItem({ id: item.id, assessmentId })
    setEditItemForm({
      category: item.category,
      description: item.description,
      likelihood: String(item.likelihood),
      impact: String(item.impact),
      mitigation: item.mitigation ?? '',
      ownerId: item.ownerId ?? '',
      ownerIdEdit: item.ownerId ?? NO_CHANGE,
      dueAt: formatDateInput(item.dueAt),
    })
  }

  const handleUpdateItem = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingItem || !editItemForm.category.trim() || !editItemForm.description.trim()) return
    setError(null)
    setUpdatingItem(true)
    try {
      const resolvedOwnerId =
        editItemForm.ownerIdEdit === NO_CHANGE
          ? editItemForm.ownerId || null
          : editItemForm.ownerIdEdit || null
      await updateRiskItemFn({
        data: {
          itemId: editingItem.id,
          category: editItemForm.category.trim(),
          description: editItemForm.description.trim(),
          likelihood: Number(editItemForm.likelihood),
          impact: Number(editItemForm.impact),
          mitigation: editItemForm.mitigation.trim() || undefined,
          ownerId: resolvedOwnerId,
          dueAt: editItemForm.dueAt || null,
        },
      })
      trackProductEvent('risk_item_updated', {
        route: '/app/compliance/program/risk',
        priority: riskLevelForScore(Number(editItemForm.likelihood) * Number(editItemForm.impact)),
      })
      setEditingItem(null)
      await router.invalidate()
      showSuccess('Risk item updated.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUpdatingItem(false)
    }
  }

  const handleUpdateAssessmentStatus = async (
    assessmentId: string,
    status: 'open' | 'in_review' | 'closed',
  ) => {
    setError(null)
    setUpdatingAssessmentId(assessmentId)
    try {
      await updateRiskAssessmentStatusFn({ data: { assessmentId, status } })
      trackProductEvent('risk_assessment_status_changed', {
        route: '/app/compliance/program/risk',
        status,
      })
      await router.invalidate()
      showSuccess('Assessment status updated.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUpdatingAssessmentId(null)
    }
  }

  const handleReopenAssessment = async (assessmentId: string) => {
    setError(null)
    setReopeningAssessmentId(assessmentId)
    try {
      await reopenRiskAssessmentFn({ data: { assessmentId } })
      trackProductEvent('risk_assessment_reopened', {
        route: '/app/compliance/program/risk',
        status: 'open',
      })
      await router.invalidate()
      showSuccess('Assessment reopened.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setReopeningAssessmentId(null)
    }
  }

  const handleRenameAssessment = async (event: FormEvent) => {
    event.preventDefault()
    if (!renamingAssessment || !renameTitle.trim()) return
    setRenamingBusy(true)
    setError(null)
    try {
      await renameRiskAssessmentFn({
        data: {
          assessmentId: renamingAssessment.id,
          title: renameTitle.trim(),
        },
      })
      trackProductEvent('risk_assessment_renamed', {
        route: '/app/compliance/program/risk',
      })
      setRenamingAssessment(null)
      await router.invalidate()
      showSuccess('Assessment renamed.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setRenamingBusy(false)
    }
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    setError(null)
    setDeletingAssessmentId(assessmentId)
    try {
      await deleteRiskAssessmentFn({ data: { assessmentId } })
      trackProductEvent('risk_assessment_deleted', {
        route: '/app/compliance/program/risk',
      })
      await router.invalidate()
      showSuccess('Assessment deleted.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setDeletingAssessmentId(null)
    }
  }

  // Live score preview for edit dialog
  const editScore = Number(editItemForm.likelihood) * Number(editItemForm.impact)
  const editLevel = riskLevelForScore(editScore)

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />

      <PageHeader
        title="Risk Assessments"
        description="Log, score, and track HIPAA security risk items through mitigation."
        actions={
          canAdmin ? <Button onClick={() => setShowForm(true)}>New Assessment</Button> : null
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryMetric
          label="Open assessments"
          value={openCount}
          detail="Not yet closed"
          tone={openCount > 0 ? 'warning' : 'success'}
        />
        <SummaryMetric
          label="High-risk items"
          value={highRiskCount}
          detail="Across all assessments"
          tone={highRiskCount > 0 ? 'danger' : 'success'}
        />
        <SummaryMetric
          label="Risk items"
          value={itemCount}
          detail="Total recorded findings"
          tone="brand"
        />
      </div>

      {notice ? (
        <Alert tone="success" className="mb-4">
          {notice}
        </Alert>
      ) : null}

      {error ? (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      ) : null}

      {/* Filter bar */}
      {assessments.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Select value={search.ownerId || ALL_FILTER} onValueChange={(v) => setFilter('ownerId', v)}>
            <SelectTrigger className="w-52 text-sm" aria-label="Filter by owner">
              <SelectValue placeholder="Filter by owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER}>All owners</SelectItem>
              <SelectItem value="__unassigned__">Unassigned</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name ? `${u.name} (${u.email})` : u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-text-link hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : null}

      {showForm ? (
        <Panel className="mb-6">
          <form onSubmit={handleCreate}>
            <PanelHeader
              title="New Risk Assessment"
              description="Name the assessment first, then add risk items to it."
            />
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
              <InputPrimitive
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Assessment title, such as Annual HIPAA Risk Assessment 2026"
                className="min-w-0 flex-1"
              />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={creating || !newTitle.trim()}>
                  {creating ? 'Creating...' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </Panel>
      ) : null}

      {assessments.length === 0 ? (
        <EmptyState
          heading="No risk assessments yet"
          description="Start an assessment to record risks and track mitigation status."
          action={
            canAdmin ? <Button onClick={() => setShowForm(true)}>New Assessment</Button> : null
          }
        />
      ) : (
        <div className="grid gap-3">
          {filteredAssessments.map((assessment) => (
            <Panel key={assessment.id} className="p-4 md:p-4">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="break-words font-semibold text-text-primary">
                    {assessment.title}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-text-muted">
                    {assessment.itemCount} item(s): {assessment.summary.high} high,{' '}
                    {assessment.summary.medium} medium, {assessment.summary.low} low risk
                  </div>
                </div>
                <Badge
                  variant={STATUS_BADGE[assessment.status] ?? 'default'}
                  className="w-fit shrink-0"
                >
                  {assessment.status.replace('_', ' ')}
                </Badge>
              </div>

              {canAdmin ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {assessment.status !== 'closed' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setItemAssessmentId(assessment.id)}
                    >
                      Add Risk Item
                    </Button>
                  ) : null}

                  {assessment.status === 'open' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={updatingAssessmentId === assessment.id}
                      onClick={() => void handleUpdateAssessmentStatus(assessment.id, 'in_review')}
                    >
                      {updatingAssessmentId === assessment.id ? 'Updating...' : 'Send to review'}
                    </Button>
                  ) : null}

                  {assessment.status === 'in_review' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={updatingAssessmentId === assessment.id}
                      onClick={() => void handleUpdateAssessmentStatus(assessment.id, 'closed')}
                    >
                      {updatingAssessmentId === assessment.id ? 'Updating...' : 'Close'}
                    </Button>
                  ) : null}

                  {assessment.status === 'closed' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={reopeningAssessmentId === assessment.id}
                      onClick={() => void handleReopenAssessment(assessment.id)}
                    >
                      {reopeningAssessmentId === assessment.id ? 'Reopening...' : 'Reopen'}
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRenamingAssessment({
                        id: assessment.id,
                        title: assessment.title,
                      })
                      setRenameTitle(assessment.title)
                    }}
                  >
                    Rename
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={deletingAssessmentId === assessment.id}
                      >
                        {deletingAssessmentId === assessment.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete assessment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently deletes "{assessment.title}" and all of its risk items. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void handleDeleteAssessment(assessment.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : null}

              {itemAssessmentId === assessment.id ? (
                <form
                  onSubmit={handleCreateItem}
                  className="mt-4 rounded-md border border-border-subtle p-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`risk-category-${assessment.id}`}>Category</Label>
                      <InputPrimitive
                        id={`risk-category-${assessment.id}`}
                        value={itemForm.category}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            category: event.target.value,
                          }))
                        }
                        placeholder="Access Control"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`risk-due-${assessment.id}`}>Due date</Label>
                      <InputPrimitive
                        id={`risk-due-${assessment.id}`}
                        type="date"
                        value={itemForm.dueAt}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            dueAt: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`risk-owner-${assessment.id}`}>Owner</Label>
                      <select
                        id={`risk-owner-${assessment.id}`}
                        className="h-10 w-full rounded-md border border-border-input bg-surface-panel px-3 text-sm text-text-primary"
                        value={itemForm.ownerId}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            ownerId: event.target.value,
                          }))
                        }
                      >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {formatUserOption(user)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor={`risk-likelihood-${assessment.id}`}>Likelihood</Label>
                      <select
                        id={`risk-likelihood-${assessment.id}`}
                        className="h-10 w-full rounded-md border border-border-input bg-surface-panel px-3 text-sm text-text-primary"
                        value={itemForm.likelihood}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            likelihood: event.target.value,
                          }))
                        }
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor={`risk-impact-${assessment.id}`}>Impact</Label>
                      <select
                        id={`risk-impact-${assessment.id}`}
                        className="h-10 w-full rounded-md border border-border-input bg-surface-panel px-3 text-sm text-text-primary"
                        value={itemForm.impact}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            impact: event.target.value,
                          }))
                        }
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`risk-description-${assessment.id}`}>Description</Label>
                      <TextareaPrimitive
                        id={`risk-description-${assessment.id}`}
                        value={itemForm.description}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Describe the finding and affected safeguard."
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`risk-mitigation-${assessment.id}`}>Mitigation</Label>
                      <TextareaPrimitive
                        id={`risk-mitigation-${assessment.id}`}
                        value={itemForm.mitigation}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            mitigation: event.target.value,
                          }))
                        }
                        placeholder="Planned mitigation or compensating control."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      disabled={
                        creatingItem || !itemForm.category.trim() || !itemForm.description.trim()
                      }
                    >
                      {creatingItem ? 'Adding...' : 'Add Item'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setItemAssessmentId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : null}

              {assessment.items.length > 0 ? (
                <div className="mt-4">
                  <TableShell>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <SortableRiskHead col="category">Risk</SortableRiskHead>
                          <SortableRiskHead col="score">Score</SortableRiskHead>
                          <TableHead>Owner</TableHead>
                          <SortableRiskHead col="dueAt">Due</SortableRiskHead>
                          {canAdmin && assessment.status !== 'closed' ? (
                            <TableHead>Actions</TableHead>
                          ) : null}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assessment.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="min-w-72">
                              <div className="font-medium text-text-primary">{item.category}</div>
                              <div className="mt-1 break-words text-sm text-text-secondary">
                                {item.description}
                              </div>
                              {item.mitigation ? (
                                <div className="mt-2 break-words text-xs text-text-muted">
                                  Mitigation: {item.mitigation}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <Badge variant={ITEM_BADGE[item.status] ?? 'default'}>
                                {item.score} - {SCORE_LABEL[item.status] ?? item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="min-w-40">{formatOwner(item)}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {item.dueAt
                                ? formatDate(item.dueAt, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'Not set'}
                            </TableCell>
                            {canAdmin && assessment.status !== 'closed' ? (
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditItem(item, assessment.id)}
                                  >
                                    Edit
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={deletingItemId === item.id}
                                      >
                                        {deletingItemId === item.id ? 'Deleting...' : 'Delete'}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete risk item?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This permanently removes the "{item.category}" finding. This cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => void handleDeleteItem(item.id)}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            ) : null}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableShell>
                </div>
              ) : (
                <div className="mt-4 rounded-md border border-dashed border-border-subtle px-4 py-3 text-sm text-text-muted">
                  No risk items recorded for this assessment.
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}

      {/* Edit risk item Dialog */}
      <Dialog
        open={editingItem !== null}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Risk Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateItem}>
            <div className="grid gap-4 py-2 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-risk-category">Category</Label>
                <InputPrimitive
                  id="edit-risk-category"
                  value={editItemForm.category}
                  onChange={(event) =>
                    setEditItemForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-risk-due">Due date</Label>
                <InputPrimitive
                  id="edit-risk-due"
                  type="date"
                  value={editItemForm.dueAt}
                  onChange={(event) =>
                    setEditItemForm((current) => ({
                      ...current,
                      dueAt: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-risk-owner">Owner</Label>
                <select
                  id="edit-risk-owner"
                  className="h-10 w-full rounded-md border border-border-input bg-surface-panel px-3 text-sm text-text-primary"
                  value={editItemForm.ownerIdEdit}
                  onChange={(event) =>
                    setEditItemForm((current) => ({
                      ...current,
                      ownerIdEdit: event.target.value,
                    }))
                  }
                >
                  <option value={NO_CHANGE}>- No change -</option>
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {formatUserOption(user)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-risk-likelihood">Likelihood</Label>
                <select
                  id="edit-risk-likelihood"
                  className="h-10 w-full rounded-md border border-border-input bg-surface-panel px-3 text-sm text-text-primary"
                  value={editItemForm.likelihood}
                  onChange={(event) =>
                    setEditItemForm((current) => ({
                      ...current,
                      likelihood: event.target.value,
                    }))
                  }
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-risk-impact">Impact</Label>
                <select
                  id="edit-risk-impact"
                  className="h-10 w-full rounded-md border border-border-input bg-surface-panel px-3 text-sm text-text-primary"
                  value={editItemForm.impact}
                  onChange={(event) =>
                    setEditItemForm((current) => ({
                      ...current,
                      impact: event.target.value,
                    }))
                  }
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-text-secondary">
                  Score:{' '}
                  <Badge variant={ITEM_BADGE[editLevel] ?? 'default'}>
                    {editScore} - {SCORE_LABEL[editLevel]}
                  </Badge>
                </div>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-risk-description">Description</Label>
                <TextareaPrimitive
                  id="edit-risk-description"
                  value={editItemForm.description}
                  onChange={(event) =>
                    setEditItemForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-risk-mitigation">Mitigation</Label>
                <TextareaPrimitive
                  id="edit-risk-mitigation"
                  value={editItemForm.mitigation}
                  onChange={(event) =>
                    setEditItemForm((current) => ({
                      ...current,
                      mitigation: event.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="submit"
                disabled={
                  updatingItem || !editItemForm.category.trim() || !editItemForm.description.trim()
                }
              >
                {updatingItem ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename assessment Dialog */}
      <Dialog
        open={renamingAssessment !== null}
        onOpenChange={(open) => {
          if (!open) setRenamingAssessment(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Assessment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameAssessment}>
            <div className="py-2">
              <Label htmlFor="rename-assessment-title">Title</Label>
              <InputPrimitive
                id="rename-assessment-title"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                placeholder="Assessment title"
                autoFocus
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={renamingBusy || !renameTitle.trim()}>
                {renamingBusy ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setRenamingAssessment(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatDateInput(date: Date | string | null | undefined) {
  if (!date) return ''
  return new Date(date).toISOString().slice(0, 10)
}

function formatUserOption(user: { name: string | null; email: string }) {
  return user.name && user.name !== user.email ? `${user.name} (${user.email})` : user.email
}

function formatOwner(item: {
  ownerId: string | null
  ownerName?: string | null
  ownerEmail?: string | null
}) {
  if (!item.ownerId) return 'Unassigned'
  return item.ownerName || item.ownerEmail || item.ownerId
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
